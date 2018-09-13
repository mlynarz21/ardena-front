import React, { Component } from 'react';
import './Event.css';
import {Avatar, Icon} from 'antd';
import { Link } from 'react-router-dom';
import { getAvatarColor } from '../util/Colors';
import { formatDateTime } from '../util/Helpers';

import { Radio, Button } from 'antd';
import {EVENT_TOOK_TEXT, VOTE_TEXT, VOTES_TEXT} from "../constants/Texts";
const RadioGroup = Radio.Group;

class Event extends Component {
    calculatePercentage = (option) => {
        if (this.props.event.totalVotes === 0) {
            return 0;
        }
        return (option.voteCount * 100) / (this.props.event.totalVotes);
    };

    isSelected = (option) => {
        return this.props.event.selectedOption === option.id;
    };

    getWinningOption = () => {
        return this.props.event.options.reduce((prevOption, currentOption) =>
                currentOption.voteCount > prevOption.voteCount ? currentOption : prevOption,
            {voteCount: -Infinity}
        );
    };

    render() {
        const eventOptions = [];
        if (this.props.event.selectedOption || this.props.event.expired) {
            const winningOption = this.props.event.expired ? this.getWinningOption() : null;

            this.props.event.options.forEach(option => {
                eventOptions.push(<CompletedOrVotedEventOption
                    key={option.id}
                    option={option}
                    isWinner={winningOption && option.id === winningOption.id}
                    isSelected={this.isSelected(option)}
                    percentVote={this.calculatePercentage(option)}
                />);
            });
        } else {
            this.props.event.options.forEach(option => {
                eventOptions.push(<Radio className="event-option-radio" key={option.id}
                                         value={option.id}>{option.text}</Radio>)
            })
        }
        return (
            <div className="event-content">
                <div className="event-header">
                    <div className="event-creator-info">
                        <Link className="creator-link" to={`/users/${this.props.event.createdBy.username}`}>
                            <Avatar className="event-creator-avatar"
                                    style={{backgroundColor: getAvatarColor(this.props.event.createdBy.name)}}>
                                {this.props.event.createdBy.name[0].toUpperCase()}
                            </Avatar>
                            <span className="event-creator-name">
                                {this.props.event.createdBy.name}
                            </span>
                            <span className="event-creator-username">
                                @{this.props.event.createdBy.username}
                            </span>
                            <span className="event-creation-date">
                                {formatDateTime(this.props.event.creationDateTime)}
                            </span>
                        </Link>
                    </div>
                    <div className="event-date">
                        {
                            this.props.event.expired ? EVENT_TOOK_TEXT + formatDateTime(this.props.event.eventDate) :
                                formatDateTime(this.props.event.eventDate)
                        }
                    </div>
                    <div className="event-description">
                        {this.props.event.description}
                    </div>
                </div>
                <div className="event-options">
                    <RadioGroup
                        className="event-option-radio-group"
                        onChange={this.props.handleVoteChange}
                        value={this.props.currentVote}>
                        {eventOptions}
                    </RadioGroup>
                </div>
                <div className="event-footer">
                    {
                        !(this.props.event.selectedOption || this.props.event.expired || this.props.event.options.length === 0) ?
                            (<Button className="vote-button" disabled={!this.props.currentVote}
                                     onClick={this.props.handleVoteSubmit}>{VOTE_TEXT}</Button>) : null
                    }
                    {
                        !(this.props.event.options.length === 0) ?
                            (<span className="total-votes">{this.props.event.totalVotes} {VOTES_TEXT}</span>) : null
                    }
                </div>
            </div>
        );
    }
}

function CompletedOrVotedEventOption(props) {
    return (
        <div className="cv-event-option">
            <span className="cv-event-option-details">
                <span className="cv-option-percentage">
                    {props.option.voteCount} {props.option.voteCount===1? VOTE_TEXT : VOTES_TEXT}- {Math.round(props.percentVote * 100) / 100}%
                </span>            
                <span className="cv-option-text">
                    {props.option.text}
                </span>
                {
                    props.isSelected ? (
                        <Icon
                            className="selected-option-icon"
                            type="check-circle-o"
                        />) : null
                }    
            </span>
            <span className={props.isWinner ? 'cv-option-percent-chart winner' : 'cv-option-percent-chart'}
                  style={{width: props.percentVote + '%'}}>
            </span>
        </div>
    );
}


export default Event;