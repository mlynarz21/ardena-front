import React, { Component } from 'react';
import { getAllEvents, getUserCreatedEvents, getUserVotedEvents } from '../util/APIUtils';
import Event from './Event';
import { castVote } from '../util/APIUtils';
import LoadingIndicator  from '../common/LoadingIndicator';
import { Button, Icon, notification } from 'antd';
import {isAdmin, POLL_LIST_SIZE} from '../constants';
import { withRouter } from 'react-router-dom';
import './EventList.css';
import {
    APP_NAME, ERROR_TEXT, LOAD_MORE_TEXT, NO_EVENTS_TEXT, PLEASE_LOGIN_TEXT,
    UNAUTHORIZED_TEXT
} from "../constants/Texts";

class EventList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
            page: 0,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            last: true,
            currentVotes: [],
            isLoading: false
        };
        this.loadEventList = this.loadEventList.bind(this);
        this.handleLoadMore = this.handleLoadMore.bind(this);
    }

    loadEventList(page = 0, size = POLL_LIST_SIZE) {
        let promise;
        if (this.props.username) {
            if (this.props.type === 'USER_CREATED_POLLS') {
                promise = getUserCreatedEvents(this.props.username, page, size);
            } else if (this.props.type === 'USER_VOTED_POLLS') {
                promise = getUserVotedEvents(this.props.username, page, size);
            }
        } else {
            promise = getAllEvents(page, size);
        }

        if (!promise) {
            return;
        }

        this.setState({
            isLoading: true
        });

        promise
            .then(response => {
                const events = this.state.events.slice();
                const currentVotes = this.state.currentVotes.slice();

                this.setState({
                    events: events.concat(response.content),
                    page: response.page,
                    size: response.size,
                    totalElements: response.totalElements,
                    totalPages: response.totalPages,
                    last: response.last,
                    currentVotes: currentVotes.concat(Array(response.content.length).fill(null)),
                    isLoading: false
                })
            }).catch(error => {
            this.setState({
                isLoading: false
            })
        });

    }

    componentWillMount() {
        this.loadEventList();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isAuthenticated !== nextProps.isAuthenticated) {
            // Reset State
            this.setState({
                events: [],
                page: 0,
                size: 10,
                totalElements: 0,
                totalPages: 0,
                last: true,
                currentVotes: [],
                isLoading: false
            });
            this.loadEventList();
        }
    }

    handleLoadMore() {
        this.loadEventList(this.state.page + 1);
    }

    handleVoteChange(event, eventIndex) {
        const currentVotes = this.state.currentVotes.slice();
        currentVotes[eventIndex] = event.target.value;

        this.setState({
            currentVotes: currentVotes
        });
    }


    handleVoteSubmit(e, eventIndex) {
        e.preventDefault();
        if (!this.props.isAuthenticated) {
            this.props.history.push("/login");
            notification.info({
                message: APP_NAME,
                description: PLEASE_LOGIN_TEXT,
            });
            return;
        }

        const event = this.state.events[eventIndex];
        const selectedOption = this.state.currentVotes[eventIndex];

        const voteData = {
            eventId: event.id,
            optionId: selectedOption
        };

        castVote(voteData)
            .then(response => {
                const events = this.state.events.slice();
                events[eventIndex] = response;
                this.setState({
                    events: events
                });
            }).catch(error => {
            if (error.status === 401) {
                this.props.handleLogout('/login', 'error', UNAUTHORIZED_TEXT);
            } else {
                notification.error({
                    message: APP_NAME,
                    description: error.message || ERROR_TEXT
                });
            }
        });
    }

    renderAddButton() {
        if (localStorage.getItem(isAdmin) === 'true') {
            return (
                <div className="create-event-div">
                    <Button type="primary" shape="circle" size="large" icon="plus" className="create-event-button"
                            onClick={() => this.props.history.push("/event/new")}/>
                </div>
            )
        }
    }

    render() {
        const eventViews = [];
        this.state.events.forEach((event, eventIndex) => {
            eventViews.push(<Event
                key={event.id}
                event={event}
                currentVote={this.state.currentVotes[eventIndex]}
                handleVoteChange={(event) => this.handleVoteChange(event, eventIndex)}
                handleVoteSubmit={(event) => this.handleVoteSubmit(event, eventIndex)}/>)
        });

        return (
            <div className="events-container">
                {this.renderAddButton()}
                {eventViews}
                {
                    !this.state.isLoading && this.state.events.length === 0 ? (
                        <div className="no-events-found">
                            <span>{NO_EVENTS_TEXT}</span>
                        </div>
                    ) : null
                }
                {
                    !this.state.isLoading && !this.state.last ? (
                        <div className="load-more-events">
                            <Button type="dashed" onClick={this.handleLoadMore} disabled={this.state.isLoading}>
                                <Icon type="plus"/> {LOAD_MORE_TEXT}
                            </Button>
                        </div>) : null
                }
                {
                    this.state.isLoading ?
                        <LoadingIndicator/> : null
                }
            </div>
        );
    }
}

export default withRouter(EventList);