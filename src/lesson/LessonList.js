import React, { Component } from 'react';
import './LessonList.css';
import { Popconfirm, Table, Tabs, Calendar, Alert } from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import * as moment from "moment";
import {
    addReservation, cancelReservation, getLessonsByDateAndUser,
    getUserReservations
} from "../util/APIUtils";
import {notification} from "antd/lib/index";
import {Link, withRouter} from 'react-router-dom';

const TabPane = Tabs.TabPane;

class LessonList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: moment(),
            selectedValue: "",
            lessonArray: [],
            reservationArray: []
        }
    }

    componentDidMount() {
        this.loadReservationArray();
    }

    loadLessonArray(date) {
        getLessonsByDateAndUser(date).then(response => {
            this.setState(
                {
                    isLoading: false,
                    lessonArray: response
                }
            )
        })
    }

    loadReservationArray() {
        getUserReservations().then(response => {
            this.setState(
                {
                    isLoading: false,
                    reservationArray: response
                }
            )
        })
    }

    onSelect = (value) => {
        this.setState({
            value: value,
            selectedValue: value.format('YYYY-MM-DD'),
        });
        this.loadLessonArray({date: value.format('YYYY-MM-DD') + ' 00:00'});
    };

    onPanelChange = (value) => {
        this.setState({value});
    };

    disabledDate = (value) => {
        return value.valueOf() <= moment();
    };

    confirm(lessonId) {
        addReservation(lessonId).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadReservationArray();
            this.loadLessonArray({date: this.state.selectedValue + ' 00:00'});
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    cancelLesson(reservationId) {
        cancelReservation(reservationId).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadReservationArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
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

        const tabBarStyle = {
            textAlign: 'center'
        };

        const lessonColumns = [{
            title: 'Id',
            key: 'id',
            width: '10%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.id}`}>
                    <a>{record.id}</a>
                </Link>)
        }, {
            title: 'Level',
            dataIndex: 'lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: '25%'
        }, {
            title: 'Instructor',
            dataIndex: 'instructor.name',
            key: 'instructor',
            width: '30%'
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to reserve this lesson?" onConfirm={() => {
                    this.confirm(record.id)
                }}
                            okText="Yes" cancelText="No">
                    <a>Reserve</a>
                </Popconfirm>)
        }];

        const reservationColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.lesson.id}`}>
                    <a>{record.id}</a>
                </Link>)
        }, {
            title: 'Level',
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '10%'
        }, {
            title: 'Date',
            dataIndex: 'lesson.date',
            key: 'date',
            width: '20%'
        }, {
            title: 'Instructor',
            dataIndex: 'lesson.instructor.name',
            key: 'instructor',
            width: '20%'
        }, {
            title: 'Horse',
            dataIndex: 'horse.horseName',
            key: 'horse',
            width: '15%'
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '10%'
        }, {
            title: 'Action',
            key: 'action',
            width: '15%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to cancel this lesson?" onConfirm={() => {
                    this.cancelLesson(record.id)
                }}
                            okText="Yes" cancelText="No">
                    <a>Cancel</a>
                </Popconfirm>)
        }];

        return (
            <div className="lesson-list">
                <div className="tab-panel">

                    <Tabs defaultActiveKey="1"
                          animated={false}
                          tabBarStyle={tabBarStyle}
                          size="large"
                          className="lesson-tabs">

                        <TabPane tab={`Reserve lesson`} key="1">
                            <div className="flex-container">
                                <div className="lesson-calendar">
                                    <Alert className="date-alert"
                                           message={`You selected date: ${this.state.selectedValue}`}/>
                                    <Calendar value={this.state.value}
                                              onSelect={this.onSelect}
                                              onPanelChange={this.onPanelChange}
                                              disabledDate={this.disabledDate}
                                              fullscreen={false}
                                    />
                                </div>
                                <Table className="lesson-table"
                                       dataSource={this.state.lessonArray}
                                       columns={lessonColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                    // scroll={{ x: '100%', y: '100%' }}
                                    // pagination={false}
                                />
                            </div>
                        </TabPane>

                        <TabPane tab={`My lessons`} key="2">
                                <Table className="reservation-table"
                                       dataSource={this.state.reservationArray}
                                       columns={reservationColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                    // scroll={{ x: '100%', y: '100%' }}
                                    // pagination={false}
                                />
                        </TabPane>

                    </Tabs>
                </div>
            </div>);
    }
}

export default withRouter(LessonList);