import React, { Component } from 'react';
import './Schedule.css';
import {Button, Popconfirm, Table, Tabs, Calendar, Alert, Divider} from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import * as moment from "moment";
import {
    acceptReservation, addLesson, cancelReservation,
    deleteLesson, getLessonsByDateAndInstructor, getLessonsByInstructor, getPendingReservationsByInstructor
} from "../util/APIUtils";
import {notification} from "antd/lib/index";
import AddLessonForm from "./AddLessonForm";
import {Link, withRouter} from 'react-router-dom';

const TabPane = Tabs.TabPane;

class Schedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: moment(),
            selectedValue: "",
            lessonArray: [],
            pendingReservationArray: [],
            visible: false
        }
    }

    componentDidMount() {
        this.loadLessonArray();
        this.loadPendingReservationArray();
    }

    loadPendingReservationArray() {
        getPendingReservationsByInstructor().then(response => {
            this.setState(
                {
                    isLoading: false,
                    pendingReservationArray: response
                }
            )
        })
    }

    loadLessonArray() {
        getLessonsByInstructor().then(response => {
            this.setState(
                {
                    isLoading: false,
                    lessonArray: response
                }
            )
        })
    }

    loadLessonArrayByDate(date) {
        getLessonsByDateAndInstructor(date).then(response => {
            this.setState(
                {
                    isLoading: false,
                    lessonArray: response
                }
            )
        })
    }

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    onSelect = (value) => {
        this.setState({
            value: value,
            selectedValue: value.format('YYYY-MM-DD'),
        });
        this.loadLessonArrayByDate({date: value.format('YYYY-MM-DD') + ' 00:00'});
    };

    onPanelChange = (value) => {
        this.setState({value});
    };

    disabledDate = (value) => {
        return value.valueOf() <= moment();
    };

    confirmCancel(reservationId) {
        cancelReservation(reservationId).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadPendingReservationArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    confirmDeletion(lessonId) {
        deleteLesson(lessonId).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadLessonArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    confirmAccept(reservationId) {
        acceptReservation(reservationId).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadPendingReservationArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addLesson({
                lessonLevel: values.level,
                date: values.date.format('YYYY-MM-DD') +" "+values.time.format('HH:mm'),
            }).then(response => {
                notification.success({
                    message: 'Ardena',
                    description: response.message,
                });
                this.props.history.push("/schedule");
                if(this.state.selectedValue==="")
                    this.loadLessonArray();
                else this.loadLessonArrayByDate({date: this.state.selectedValue+' 00:00'})
            }).catch(error => {
                notification.error({
                    message: 'Ardena',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });

            form.resetFields();
            this.setState({visible: false});
            });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
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

        const tabBarStyle = {
            textAlign: 'center'
        };

        const lessonColumns = [{
            title: 'Id',
            key: 'id',
            width: '20%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.id}`}>
                    <a>{record.id}</a>
                </Link>)
        }, {
            title: 'Level',
            dataIndex: 'lessonLevel',
            key: 'lessonLevel',
            width: '25%'
        }, {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: '30%'
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to delete this lesson?" onConfirm={() => {
                    this.confirmDeletion(record.id)
                }}
                            okText="Yes" cancelText="No">
                    <a>Delete</a>
                </Popconfirm>)
        }];

        const pendingReservationColumns = [{
            title: 'Id',
            key: 'id',
            width: '15%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.lesson.id}`}>
                    <a>{record.id}</a>
                </Link>)
        }, {
            title: 'Lesson level',
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '20%'
        }, {
            title: 'Date',
            dataIndex: 'lesson.date',
            key: 'date',
            width: '25%'
        }, {
            title: 'Rider name',
            dataIndex: 'rider.name',
            key: 'name',
            width: '20%'
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <div>
                    <Popconfirm placement="left" title="Want to accept this reservation?" onConfirm={() => {
                        this.confirmAccept(record.id)
                    }}
                                okText="Yes" cancelText="No">
                        <a>Accept   </a>
                    </Popconfirm>
                    <Divider type="vertical" />
                    <Popconfirm placement="left" title="Want to cancel this lesson?" onConfirm={() => {
                        this.confirmCancel(record.id)
                    }}
                                okText="Yes" cancelText="No">
                        <a>  Cancel</a>
                    </Popconfirm>
                </div>)
        }];

        return (
            <div className="schedule-list">
                <div className="tab-panel">

                    <Tabs defaultActiveKey="1"
                          animated={false}
                          tabBarStyle={tabBarStyle}
                          size="large"
                          className="lesson-tabs">

                        <TabPane tab={`My schedule`} key="1">
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
                                <div className="lesson-container">
                                <Table className="schedule-lesson-table"
                                       dataSource={this.state.lessonArray}
                                       columns={lessonColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                    // scroll={{ x: '100%', y: '100%' }}
                                    // pagination={false}
                                />
                                    <Button type="primary"
                                            className="add-lesson-button"
                                            onClick={this.showModal}>
                                        Add lesson</Button>
                                </div>
                            </div>
                        </TabPane>

                        <AddLessonForm
                            wrappedComponentRef={this.saveFormRef}
                            visible={this.state.visible}
                            onCancel={this.handleCancel}
                            onCreate={this.handleCreate}
                        />

                        <TabPane tab={`Pending reservations`} key="2">
                            {/*<div className="flex-container">*/}
                            {/*<div className="reservation-calendar">*/}
                            {/*<Alert className="date-alert"*/}
                            {/*message={`You selected date: ${this.state.selectedValue}`}/>*/}
                            {/*<Calendar value={this.state.value}*/}
                            {/*onSelect={this.onSelect}*/}
                            {/*onPanelChange={this.onPanelChange}*/}
                            {/*disabledDate={this.disabledDate}*/}
                            {/*fullscreen={false}*/}
                            {/*/>*/}
                            {/*</div>*/}
                            <Table className="reservation-table"
                                   dataSource={this.state.pendingReservationArray}
                                   columns={pendingReservationColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                            {/*</div>*/}

                        </TabPane>

                    </Tabs>
                </div>
            </div>);
    }
}

export default withRouter(Schedule);