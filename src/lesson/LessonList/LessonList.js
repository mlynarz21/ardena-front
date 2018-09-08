import React, { Component } from 'react';
import './LessonList.css';
import { Popconfirm, Table, Tabs, Calendar, Alert } from 'antd';
import LoadingIndicator  from '../../common/LoadingIndicator';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import * as moment from "moment";
import {
    addReservation, cancelReservation, getAllHorses, getInstructors, getLessonsByDateAndUser,
    getUnpaidReservationsByUser, getUserReservationHistory,
    getUserReservations, payForReservation
} from "../../util/APIUtils";
import {notification} from "antd/lib/index";
import {Link, withRouter} from 'react-router-dom';
import {LevelOptions} from "../../constants";

const TabPane = Tabs.TabPane;

class LessonList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: moment().subtract(1, 'd'),
            isLoading: true,
            selectedValue: "",
            lessonArray: [],
            reservationArray: [],
            reservationHistoryArray: [],
            horseArray: [],
            instructorArray: [],
            pendingPaymentArray: []
        }
    }

    componentDidMount() {
        this.loadReservationArray();
        this.loadHistoryArray();
        this.loadHorseArray();
        this.loadInstructorArray();
        this.loadPendingPaymentArray();
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

    loadHistoryArray() {
        getUserReservationHistory().then(response => {
            this.setState(
                {
                    isLoading: false,
                    reservationHistoryArray: response
                }
            )
        })
    }

    loadPendingPaymentArray() {
        getUnpaidReservationsByUser().then(response => {
            this.setState(
                {
                    isLoading: false,
                    pendingPaymentArray: response
                }
            )
        })
    }

    loadHorseArray() {
        getAllHorses().then(response => {
            this.setState(
                {
                    isLoading: false,
                    horseArray: response
                }
            )
        })
    }

    loadInstructorArray() {
        getInstructors().then(response => {
            this.setState(
                {
                    isLoading: false,
                    instructorArray: response
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
        return value.valueOf() <= moment().subtract(1, 'd');
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
            this.loadLessonArray({date: this.state.selectedValue + ' 00:00'});
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        })
    }

    payReservation(reservationId, data){
        payForReservation(reservationId, data).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadPendingPaymentArray();
            this.loadHistoryArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        })
    }

    static getCancelText(recordState){
        if(recordState!=='Cancelled')
            return "Cancel";
        else return ""
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
                   {record.id}
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
            key: 'instructor',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.instructor.username}`}>
                    {record.instructor.name}
                </Link>)
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
                    {record.id}
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
            key: 'instructor',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.lesson.instructor.username}`}>
                    {record.lesson.instructor.name}
                </Link>)
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
                    <a>{LessonList.getCancelText(record.status)}</a>
                </Popconfirm>)
        }];

        const reservationHistoryColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.lesson.id}`}>
                    {record.id}
                </Link>)
        }, {
            title: 'Level',
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '10%',
            filters: LevelOptions.map(element => ({text: element, value: element})),
            onFilter: (value, record) => record.lesson.lessonLevel.indexOf(value) === 0
        }, {
            title: 'Date',
            dataIndex: 'lesson.date',
            key: 'date',
            width: '20%',
            sorter: (a, b) => moment(a.lesson.date, 'YYYY-MM-DD HH:mm').valueOf()-moment(b.lesson.date, 'YYYY-MM-DD HH:mm').valueOf()
        }, {
            title: 'Instructor',
            key: 'instructor',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.lesson.instructor.username}`}>
                    {record.lesson.instructor.name}
                </Link>),
            filters:
                this.state.instructorArray.map(element => {
                    return { text: element.name, value: element.name }
                }),
            onFilter: (value, record) => record.lesson.instructor.name.indexOf(value===null? "": value) === 0
        }, {
            title: 'Horse',
            dataIndex: 'horse.horseName',
            key: 'horse',
            width: '15%',
            filters:
                this.state.horseArray.map(element => {
                    return { text: element.horseName, value: element.horseName }
                }),
            onFilter: (value, record) => record.horse === null ? false: record.horse.horseName.indexOf(value===null? "": value) === 0
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '25%',
            filters: [
                { text: 'Cancelled', value: 'Cancelled' },
                { text: 'Pending', value: 'Pending' },
                { text: 'Confirmed', value: 'Confirmed' },
                { text: 'Paid_pass', value: 'Paid_pass' },
                { text: 'Paid_cash', value: 'Paid_cash' },
            ],
            onFilter: (value, record) => record.status.indexOf(value) === 0
        }];

        const pendingPaymentColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '10%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.lesson.id}`}>
                    {record.id}
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
            key: 'instructor',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.lesson.instructor.username}`}>
                    {record.lesson.instructor.name}
                </Link>)
        }, {
            title: 'Action',
            key: 'action',
            width: '40%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to pay for this lesson? (pass)" onConfirm={() => {
                    this.payReservation(record.id,{status: "Paid_pass"});
                }}
                            okText="Yes" cancelText="No">
                    <a>Pay with pass</a>
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

                        <TabPane tab={`My History`} key="3">
                            <Table className="reservation-history-table"
                                   dataSource={this.state.reservationHistoryArray}
                                   columns={reservationHistoryColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                        </TabPane>

                        <TabPane tab={`Pending payments`} key="4">
                            <Table className="pending-payments-table"
                                   dataSource={this.state.pendingPaymentArray}
                                   columns={pendingPaymentColumns}
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