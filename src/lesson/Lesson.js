import React, { Component } from 'react';
import './Lesson.css';
import {Alert, Divider, Popconfirm, Table, Tabs} from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {getLesson} from "../util/APIUtils";
import {isInstructor} from "../constants";
import withRouter from "react-router-dom/es/withRouter";
import {Link} from "react-router-dom";

const TabPane = Tabs.TabPane;

class Lesson extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            lesson: null
        }
    }

    componentDidMount() {
        const lessonId = this.props.match.params.lessonId;
        this.loadLesson(lessonId);
    }

    loadLesson(lessonId) {
        getLesson(lessonId).then(response => {
            this.setState(
                {
                    isLoading: false,
                    lesson: response
                }
            )
        })
    }

    render() {
        if (this.state.isLoading) {
            return <LoadingIndicator/>;
        }

        if (this.state.notFound) {
            return <NotFound/>;
        }

        if (this.state.serverError) {
            return <ServerError/>;
        }

        const reservationColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '25%'
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '25%'
        }, {
            title: 'Rider Name',
            key: 'rider',
            width: '25%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.rider.username}`}>
                    <a>{record.rider.name}</a>
                </Link>)
        }, {
            title: 'Horse',
            dataIndex: 'horse',
            key: 'horse',
            width: '15%'
        }, {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (text, record) => (
                <Popconfirm placement="left" title={record.rider.username}
                            okText="Yes" cancelText="No">
                    <a>Reserve</a>
                </Popconfirm>)
        }];

        if (localStorage.getItem(isInstructor) === 'true') {
            return (
                <div className="lesson-container">
                    <div className="flex-alert">
                        <Link className="user-link" to={`/users/${this.state.lesson.instructor.username}`}>
                            <Alert className="lesson-info"
                                   message={`Instructor: ${this.state.lesson.instructor.name}`}/>
                        </Link>
                        <Alert className="lesson-info"
                               message={`Date: ${this.state.lesson.date}`}/>
                        <Alert className="lesson-info"
                               message={`Level: ${this.state.lesson.lessonLevel}`}/>
                    </div>
                    <Table className="reservations-table"
                           dataSource={this.state.lesson.reservations}
                           columns={reservationColumns}
                           rowKey='id'
                           rowClassName="lesson-row"
                        // scroll={{ x: '100%', y: '100%' }}
                        // pagination={false}
                    />

                </div>);
        } else return (
            <div className="lesson-container">
                <div className="flex-alert">
                    <Link className="user-link" to={`/users/${this.state.lesson.instructor.username}`}>
                        <Alert className="lesson-info"
                               message={`Instructor: ${this.state.lesson.instructor.name}`}/>
                    </Link>
                    <Alert className="lesson-info"
                           message={`Date: ${this.state.lesson.date}`}/>
                    <Alert className="lesson-info"
                           message={`Level: ${this.state.lesson.lessonLevel}`}/>
                </div>
                <Table className="reservations-table"
                       dataSource={this.state.lesson.reservations}
                       columns={reservationColumns}
                       rowKey='id'
                       rowClassName="lesson-row"
                    // scroll={{ x: '100%', y: '100%' }}
                    // pagination={false}
                />

            </div>)
    }
}

export default withRouter(Lesson);