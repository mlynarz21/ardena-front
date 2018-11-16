import React, { Component } from 'react';
import './LessonList.css';
import {Popconfirm, Table, Tabs, Calendar, Alert, Badge} from 'antd';
import LoadingIndicator  from '../../common/LoadingIndicator';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import * as moment from "moment";
import {
    addReservation, cancelReservation, getAllComingLessons, getAllHorses, getAllLessons, getInstructors,
    getLessonsByDateAndUser,
    getLessonsByInstructor,
    getUnpaidReservationsByUser, getUserReservationHistory,
    getUserReservations, payForReservation
} from "../../util/APIUtils";
import {notification} from "antd/lib/index";
import {Link, withRouter} from 'react-router-dom';
import {LevelOptions} from "../../constants";
import {formatDateTimeShort, formatDateToDMY, getIsoStringFromDate} from "../../util/Helpers";
import {
    ACTION_TEXT,
    APP_NAME, CANCEL_TEXT, DATE_TEXT, ERROR_TEXT, HORSE_TEXT, INSTRUCTOR_TEXT, LESSON_LEVEL_TEXT, LESSON_TEXT,
    LEVEL_TEXT,
    MY_HISTORY_TEXT,
    MY_LESSONS_TEXT,
    NO_TEXT, PASS_TEXT,
    PENDING_PAYMENTS_TEXT,
    RESERVATION_CANCEL_TEXT, RESERVATION_PAY_PASS_TEXT,
    RESERVE_LESSON_TEXT,
    RESERVE_TEXT, SELECTED_DATE_TEXT, STATUS_TEXT,
    UNAUTHORIZED_TEXT,
    YES_TEXT
} from "../../constants/Texts";

const TabPane = Tabs.TabPane;

class LessonList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: moment().subtract(1, 'd'),
            isLoading: true,
            selectedValue: "",
            lessonByDateArray: [],
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
        this.loadLessonArray();
    }

    loadLessonArray() {
        getAllComingLessons().then(response => {
            this.setState(
                {
                    isLoading: false,
                    lessonArray: response
                }
            )
        })
    }

    loadLessonArrayByDate(date) {
        getLessonsByDateAndUser(date).then(response => {
            this.setState(
                {
                    isLoading: false,
                    lessonByDateArray: response
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
        this.loadLessonArrayByDate({date: getIsoStringFromDate(value)});
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
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadReservationArray();
            this.loadLessonArray();
            this.loadLessonArrayByDate({date: getIsoStringFromDate(this.state.value)});
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', UNAUTHORIZED_TEXT);
            } else {
                notification.error({
                    message: APP_NAME,
                    description: error.message || ERROR_TEXT
                });
            }
        });
    }

    cancelLesson(reservationId) {
        cancelReservation(reservationId).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadReservationArray();
            this.loadLessonArray();
            this.loadLessonArrayByDate({date: getIsoStringFromDate(this.state.value)});
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', UNAUTHORIZED_TEXT);
            } else {
                notification.error({
                    message: APP_NAME,
                    description: error.message || ERROR_TEXT
                });
            }
        })
    }

    payReservation(reservationId, data){
        payForReservation(reservationId, data).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/lessons");
            this.loadPendingPaymentArray();
            this.loadHistoryArray();
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', UNAUTHORIZED_TEXT);
            } else {
                notification.error({
                    message: APP_NAME,
                    description: error.message || ERROR_TEXT
                });
            }
        })
    }

    static getCancelText(recordState){
        if(recordState!=='Cancelled')
            return CANCEL_TEXT;
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

        let dateCellRender = (value) =>{
            var listData =[];
            this.state.lessonArray.some(function (lesson) {
                if (formatDateToDMY(lesson.date)===formatDateToDMY(value)) {
                    return listData.push({ type: 'success'});
                }
            });

            return (
                <ul className="events">
                    {
                        listData.map(item => (
                            <Badge status={item.type} text={item.content} />
                        ))
                    }
                </ul>
            );
        };

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
            title: LEVEL_TEXT,
            dataIndex: 'lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '25%',
            render: (text, record) => (
                formatDateTimeShort(record.date)
            )
        }, {
            title: INSTRUCTOR_TEXT,
            key: 'instructor',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.instructor.username}`}>
                    {record.instructor.name}
                </Link>)
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title={RESERVE_LESSON_TEXT} onConfirm={() => {
                    this.confirm(record.id)
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{RESERVE_TEXT}</a>
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
            title: LEVEL_TEXT,
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '10%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '20%',
            render: (text, record) => (
                formatDateTimeShort(record.lesson.date)
            )
        }, {
            title: INSTRUCTOR_TEXT,
            key: 'instructor',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.lesson.instructor.username}`}>
                    {record.lesson.instructor.name}
                </Link>)
        }, {
            title: HORSE_TEXT,
            dataIndex: 'horse.horseName',
            key: 'horse',
            width: '15%'
        }, {
            title: STATUS_TEXT,
            dataIndex: 'status',
            key: 'status',
            width: '10%'
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '15%',
            render: (text, record) => (
                <Popconfirm placement="left" title={RESERVATION_CANCEL_TEXT} onConfirm={() => {
                    this.cancelLesson(record.id)
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
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
            title: LEVEL_TEXT,
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '10%',
            filters: LevelOptions.map(element => ({text: element, value: element})),
            onFilter: (value, record) => record.lesson.lessonLevel.indexOf(value) === 0
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '20%',
            render: (text, record) => (
                formatDateTimeShort(record.lesson.date)
            ),
            sorter: (a, b) => moment(a.lesson.date, 'YYYY-MM-DD HH:mm').valueOf()-moment(b.lesson.date, 'YYYY-MM-DD HH:mm').valueOf()
        }, {
            title: INSTRUCTOR_TEXT,
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
            title: HORSE_TEXT,
            dataIndex: 'horse.horseName',
            key: 'horse',
            width: '15%',
            filters:
                this.state.horseArray.map(element => {
                    return { text: element.horseName, value: element.horseName }
                }),
            onFilter: (value, record) => record.horse === null ? false: record.horse.horseName.indexOf(value===null? "": value) === 0
        }, {
            title: STATUS_TEXT,
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
            title: LEVEL_TEXT,
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '10%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '20%',
            render: (text, record) => (
                formatDateTimeShort(record.lesson.date)
            )
        }, {
            title: INSTRUCTOR_TEXT,
            key: 'instructor',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.lesson.instructor.username}`}>
                    {record.lesson.instructor.name}
                </Link>)
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '40%',
            render: (text, record) => (
                <Popconfirm placement="left" title={RESERVATION_PAY_PASS_TEXT} onConfirm={() => {
                    this.payReservation(record.id,{status: "Paid_pass"});
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{PASS_TEXT}</a>
                </Popconfirm>)
        }];

        return <div className="lesson-list">
            <div className="tab-panel">

                <Tabs defaultActiveKey="1"
                      animated={false}
                      tabBarStyle={tabBarStyle}
                      size="large"
                      className="lesson-tabs">

                    <TabPane tab={RESERVE_TEXT +" "+ LESSON_TEXT} key="1">
                        <div className="flex-container">
                            <div className="lesson-calendar">
                                <Alert className="date-alert"
                                       message={`${SELECTED_DATE_TEXT} : ${this.state.selectedValue}`}/>
                                <Calendar value={this.state.value}
                                          onSelect={this.onSelect}
                                          onPanelChange={this.onPanelChange}
                                          disabledDate={this.disabledDate}
                                          fullscreen={false}
                                          dateCellRender={dateCellRender}
                                />
                            </div>
                            <Table className="lesson-table"
                                   dataSource={this.state.lessonByDateArray}
                                   columns={lessonColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                        </div>
                    </TabPane>

                    <TabPane tab={MY_LESSONS_TEXT} key="2">
                        <Table className="reservation-table"
                               dataSource={this.state.reservationArray}
                               columns={reservationColumns}
                               rowKey='id'
                               rowClassName="lesson-row"
                            // scroll={{ x: '100%', y: '100%' }}
                            // pagination={false}
                        />
                    </TabPane>

                    <TabPane tab={MY_HISTORY_TEXT} key="3">
                        <Table className="reservation-history-table"
                               dataSource={this.state.reservationHistoryArray}
                               columns={reservationHistoryColumns}
                               rowKey='id'
                               rowClassName="lesson-row"
                            // scroll={{ x: '100%', y: '100%' }}
                            // pagination={false}
                        />
                    </TabPane>

                    <TabPane tab={PENDING_PAYMENTS_TEXT} key="4">
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
        </div>;
    }
}

export default withRouter(LessonList);