import React, { Component } from 'react';
import './Lesson.css';
import {Alert, Button, Divider, Popconfirm, Table} from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {
    acceptReservation, addHorse, cancelReservation, getAllHorses, getInstructors, getLesson,
    payForReservation, updateLesson, updateReservation
} from "../util/APIUtils";
import {isInstructor} from "../constants";
import withRouter from "react-router-dom/es/withRouter";
import {Link} from "react-router-dom";
import {notification} from "antd/lib/index";
import EditableTableAutocomplete from "../EditableTables/EditableTableAutocomplete";
import AddHorseForm from "../horse/AddHorseForm";
import EditLessonForm from "./EditLessonForm";
import moment from "moment";
import {formatDateTime} from "../util/Helpers";
import {
    ACTION_TEXT,
    APP_NAME, DATE_TEXT, ERROR_TEXT, HORSE_TEXT, INSTRUCTOR_TEXT, LESSON_LEVEL_TEXT, NO_HORSE_TEXT, NO_TEXT, PASS_TEXT,
    PAY_CASH_TEXT,
    RESERVATION_PAY_CASH_TEXT,
    RESERVATION_PAY_PASS_TEXT,
    RIDER_NAME_TEXT,
    UNAUTHORIZED_TEXT,
    YES_TEXT
} from "../constants/Texts";

class Lesson extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            lesson: null,
            horseArray: [],
            instructorArray: [],
            visible: false,
        }
    }

    componentDidMount() {
        const lessonId = this.props.match.params.lessonId;
        this.loadLesson(lessonId);
        this.loadHorseArray();
        this.loadInstructorArray();
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

    loadHorseArray() {
        getAllHorses().then(response => {
            this.setState(
                {
                    // isLoading: false,
                    horseArray: response
                }
            )
        })
    }

    loadInstructorArray() {
        getInstructors().then(response => {
            this.setState(
                {
                    instructorArray: response
                }
            )
        })
    }

    confirmCancel(reservationId) {
        cancelReservation(reservationId).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadLesson(this.props.match.params.lessonId);
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

    confirmAccept(reservationId) {
        acceptReservation(reservationId).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadLesson(this.props.match.params.lessonId);
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

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.formRef.props.form;
        this.setState({visible: false});
        form.resetFields();
    };

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            console.log(values);
            updateLesson(
                this.props.match.params.lessonId,
                {
                    lessonLevel : values.lessonLevel,
                    instructor : values.instructor.split(" ")[0],
                    date : this.state.lesson.date
                }).then(response => {
                notification.success({
                    message: APP_NAME,
                    description: response.message,
                });
                this.loadLesson(this.props.match.params.lessonId)
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

            form.resetFields();
            this.setState({visible: false});

            this.loadLesson(this.props.match.params.lessonId);
        });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };

    static renderHorse(record) {
        if (record.horse === null) {
            return NO_HORSE_TEXT
        }
        else return record.horse.horseName
    }

    renderPopconfirm(record) {
        if (record.status === "Pending") {
            return (
                <div>
                    <Popconfirm placement="left" title="Want to accept this reservation?" onConfirm={() => {
                        this.confirmAccept(record.id)
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a>Accept </a>
                    </Popconfirm>
                    <Divider type="vertical"/>
                    <Popconfirm placement="left" title="Want to cancel this lesson?" onConfirm={() => {
                        this.confirmCancel(record.id)
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a> Cancel</a>
                    </Popconfirm>
                </div>
            )
        } else if (record.status === "Confirmed") {
            return (<div className="pending-pop">
                <Popconfirm placement="left" title="Want to cancel this lesson?" onConfirm={() => {
                    this.confirmCancel(record.id)
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a> Cancel</a>
                </Popconfirm>
                <Divider type="vertical"/>
                <Popconfirm placement="left" title={RESERVATION_PAY_PASS_TEXT} onConfirm={() => {
                    this.payReservation(record.id, {status: "Paid_pass"});
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{PASS_TEXT}</a>
                </Popconfirm>
                <Divider type="vertical"/>
                <Popconfirm placement="left" title={RESERVATION_PAY_CASH_TEXT} onConfirm={() => {
                    this.payReservation(record.id, {status: "Paid_cash"});
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{PAY_CASH_TEXT}</a>
                </Popconfirm>
            </div>)
        }
    }

    payReservation(reservationId, data) {
        payForReservation(reservationId, data).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadLesson(this.props.match.params.lessonId);
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

    handleSave = (row) => {
        updateReservation(row.id,
            {status: row.status, rider: row.rider, horseName: row.horse.horseName}).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadLesson(this.props.match.params.lessonId)
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
    };

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
            width: '10%'
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '15%',
            filters: [
                {text: 'Cancelled', value: 'Cancelled'},
                {text: 'Pending', value: 'Pending'},
                {text: 'Confirmed', value: 'Confirmed'},
                {text: 'Paid_pass', value: 'Paid_pass'},
                {text: 'Paid_cash', value: 'Paid_cash'},
            ],
            onFilter: (value, record) => record.status.indexOf(value) === 0
        }, {
            title: RIDER_NAME_TEXT,
            key: 'rider',
            width: '20%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.rider.username}`}>
                    {record.rider.name}
                </Link>),
            sorter: (a, b) => ('' + a.rider.name).localeCompare(b.rider.name)
        }, {
            title: HORSE_TEXT,
            dataIndex: 'horse.horseName',
            key: 'horse',
            width: '20%',
            editable: true,
            render: (text, record) => (
                Lesson.renderHorse(record)
            )
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '35%',
            render: (text, record) => (
                this.renderPopconfirm(record)
            )
        }];

        if (localStorage.getItem(isInstructor) === 'true') {
            return (
                <div className="lesson-container">
                    <div className="flex-alert">
                        <Alert className="lesson-info-date"
                               message={`${DATE_TEXT}: ${formatDateTime(this.state.lesson.date)}`}/>
                        <Link className="user-link" to={`/users/${this.state.lesson.instructor.username}`}>
                            <Alert className="lesson-info-instructor"
                                   message={`${INSTRUCTOR_TEXT}: ${this.state.lesson.instructor.name}`}/>
                        </Link>
                        <Alert className="lesson-info-level"
                               message={`${LESSON_LEVEL_TEXT}: ${this.state.lesson.lessonLevel}`}/>
                    </div>

                    <div className="reservation-list">
                        <EditableTableAutocomplete
                            className="reservations-table"
                            dataSource={this.state.lesson.reservations}
                            columns={reservationColumns}
                            handleSave={this.handleSave}
                            options={this.state.horseArray.map(horse => horse.horseName)}>
                        </EditableTableAutocomplete>

                        <Button type="primary"
                                className={this.state.lesson.reservations.length > 0 ? 'edit-lesson-button' : 'edit-lesson-button-no-data'}
                                onClick={this.showModal}>
                            Edit lesson</Button>
                    </div>

                    <EditLessonForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        lesson={this.state.lesson}
                        dataSource={this.state.instructorArray.map(i=> i.username+' ('+i.name+')')}
                    />
                </div>);
        } else return (
            <div className="lesson-container">
                <div className="flex-alert">
                    <Link className="user-link" to={`/users/${this.state.lesson.instructor.username}`}>
                        <Alert className="lesson-info"
                               message={`${INSTRUCTOR_TEXT}: ${this.state.lesson.instructor.name}`}/>
                    </Link>
                    <Alert className="lesson-info"
                           message={`${DATE_TEXT}: ${formatDateTime(this.state.lesson.date)}`}/>
                    <Alert className="lesson-info"
                           message={`${LESSON_LEVEL_TEXT}: ${this.state.lesson.lessonLevel}`}/>
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