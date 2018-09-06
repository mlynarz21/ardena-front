import React, { Component } from 'react';
import './Schedule.css';
import {Button, Popconfirm, Table, Tabs, Calendar, Alert, Divider, Icon, Input} from 'antd';
import LoadingIndicator  from '../../common/LoadingIndicator';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import * as moment from "moment";
import {
    acceptReservation, addLesson, addPass, cancelReservation,
    deleteLesson, getAllUsers, getLessonsByDateAndInstructor, getLessonsByInstructor,
    getPendingReservationsByInstructor,
    getUnpaidReservationsByInstructor, payForReservation
} from "../../util/APIUtils";
import {notification} from "antd/lib/index";
import AddLessonForm from "./AddLessonForm";
import {Link, withRouter} from 'react-router-dom';

const TabPane = Tabs.TabPane;

class Schedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: moment().subtract(1, 'd'),
            selectedValue: "",
            lessonArray: [],
            pendingReservationArray: [],
            visible: false,
            pendingPaymentArray: [],
            userArray: [],
            userFilterText: ''
        }
    }

    componentDidMount() {
        this.loadLessonArray();
        this.loadPendingReservationArray();
        this.loadPendingPaymentArray();
        this.loadUserArray();
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

    loadPendingPaymentArray() {
        getUnpaidReservationsByInstructor().then(response => {
            this.setState(
                {
                    isLoading: false,
                    pendingPaymentArray: response
                }
            )
        })
    }

    loadUserArray() {
        getAllUsers().then(response => {
            this.setState(
                {
                    isLoading: false,
                    userArray: response
                }
            )
        })
    }

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        const form = this.formRef.props.form;
        this.setState({visible: false});
        form.resetFields();
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
        return value.valueOf() <= moment().subtract(1, 'd');
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

    payReservation(reservationId, data){
        payForReservation(reservationId, data).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.loadPendingPaymentArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        })
    }

    addPassToUser(userId, data){
        addPass(userId, data).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.loadPendingPaymentArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        })
    }

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addLesson({
                lessonLevel: values.level,
                date: values.date.format('YYYY-MM-DD') + " " + values.time.format('HH:mm'),
            }).then(response => {
                notification.success({
                    message: 'Ardena',
                    description: response.message,
                });
                this.props.history.push("/schedule");
                if (this.state.selectedValue === "")
                    this.loadLessonArray();
                else this.loadLessonArrayByDate({date: this.state.selectedValue + ' 00:00'})
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

        let handleSearch = (selectedKeys, confirm) => () => {
            confirm();
            this.setState({userFilterText: selectedKeys[0]===undefined ? " " : selectedKeys[0]});
        }

        let handleReset = clearFilters => () => {
            clearFilters();
            this.setState({userFilterText: ''});
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
                    {record.id}
                </Link>)
        }, {
            title: 'Lesson level',
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
                    {record.id}
                </Link>)
        }, {
            title: 'Rider name',
            key: 'name',
            width: '25%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.rider.username}`}>
                   {record.rider.name}
                </Link>)
        }, {
            title: 'Lesson level',
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: 'Date',
            dataIndex: 'lesson.date',
            key: 'date',
            width: '20%'
        }, {
            title: 'Action',
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <div>
                    <Popconfirm placement="left" title="Want to accept this reservation?" onConfirm={() => {
                        this.confirmAccept(record.id)
                    }}
                                okText="Yes" cancelText="No">
                        <a>Accept </a>
                    </Popconfirm>
                    <Divider type="vertical"/>
                    <Popconfirm placement="left" title="Want to cancel this lesson?" onConfirm={() => {
                        this.confirmCancel(record.id)
                    }}
                                okText="Yes" cancelText="No">
                        <a> Cancel</a>
                    </Popconfirm>
                </div>)
        }];

        const pendingPaymentColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '15%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.lesson.id}`}>
                    {record.id}
                </Link>)
        }, {
            title: 'Rider name',
            key: 'rider',
            width: '25%',
            dataIndex: 'rider.name',
            filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={(input) => {
                            this.searchInput = input;
                        }}
                        placeholder="Search name"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={handleSearch(selectedKeys, confirm)}
                    />
                    <Button type="primary" onClick={handleSearch(selectedKeys, confirm)}>Search</Button>
                    <Button onClick={handleReset(clearFilters)}>Reset</Button>
                </div>
            ),
            onFilter: (value, record) => record.rider.name.toLowerCase().includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => {
                        this.searchInput.focus();
                    });
                }
            },
            render: (text, record) => {
                const {userFilterText} = this.state.userFilterText;
                return userFilterText ? (
                    <span>
                        {text.split(new RegExp(`(?<=${userFilterText})|(?=${userFilterText})`, 'i')).map((fragment, i) => (
                            fragment.toLowerCase() === userFilterText.toLowerCase()
                                ? <span key={i} className="highlight">{fragment}</span> : fragment
                        ))}
                    </span>) : <Link className="user-link" to={`/users/${record.rider.username}`}>{text}</Link>;
            }
        }, {
            title: 'Lesson level',
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: 'Date',
            dataIndex: 'lesson.date',
            key: 'date',
            width: '20%'
        }, {
            title: 'Action',
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <div>
                    <Popconfirm placement="left" title="Want to pay for this lesson? (pass)" onConfirm={() => {
                        this.payReservation(record.id,{status: "Paid_pass"});
                    }}
                                okText="Yes" cancelText="No">
                        <a>Pay with pass</a>
                    </Popconfirm>
                    <Divider type="vertical"/>
                    <Popconfirm placement="left" title="Want to pay for this lesson? (cash)" onConfirm={() => {
                        this.payReservation(record.id,{status: "Paid_cash"});
                    }}
                                okText="Yes" cancelText="No">
                        <a>Pay with cash</a>
                    </Popconfirm>
                </div>)
        }];

        const userColumns = [{
            title: 'Id',
            key: 'id',
            width: '15%',
            dataIndex: 'id'
        }, {
        //     title: 'Name',
        //     key: 'name',
        //     width: '25%',
        //     render: (text, record) => (
        //         <Link className="user-link" to={`/users/${record.username}`}>
        //             <a>{record.name}</a>
        //         </Link>)
        // }, {
            title: 'Rider name',
            key: 'name',
            width: '25%',
            dataIndex: 'name',
            filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={(input) => {
                            this.searchInput = input;
                        }}
                        placeholder="Search name"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={handleSearch(selectedKeys, confirm)}
                    />
                    <Button type="primary" onClick={handleSearch(selectedKeys, confirm)}>Search</Button>
                    <Button onClick={handleReset(clearFilters)}>Reset</Button>
                </div>
            ),
            onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: (visible) => {
                if (visible) {
                    setTimeout(() => {
                        this.searchInput.focus();
                    });
                }
            },
            render: (text, record) => {
                const {userFilterText} = this.state.userFilterText;
                return userFilterText ? (
                    <span>
                        {text.split(new RegExp(`(?<=${userFilterText})|(?=${userFilterText})`, 'i')).map((fragment, i) => (
                            fragment.toLowerCase() === userFilterText.toLowerCase()
                                ? <span key={i} className="highlight">{fragment}</span> : fragment
                        ))}
                    </span>) : <Link className="user-link" to={`/users/${record.username}`}>{text}</Link>;
            }
        }, {
            title: 'Rider level',
            dataIndex: 'level',
            key: 'level',
            width: '15%'
        }, {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: '20%'
        }, {
            title: 'Action',
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want add pass to this user?" onConfirm={() => {
                    this.addPassToUser(record.id, {noOfRidesPermitted: 10})
                }}
                            okText="Yes" cancelText="No">
                    <a>Add pass</a>
                </Popconfirm>)
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
                                           scroll={{ x: '100%' }}
                                        // scroll={{ x: '100%', y: '100%' }}
                                        // pagination={false}
                                    />
                                    <Button type="primary"
                                            className={this.state.lessonArray.length > 0 ? 'add-lesson-button' : 'add-lesson-button-no-data'}
                                            onClick={this.showModal}>
                                        Add lesson</Button>
                                </div>
                            </div>
                        </TabPane>

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
                                   scroll={{ x: '100%' }}
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                            {/*</div>*/}

                        </TabPane>

                        <TabPane tab={`Pending payments`} key="3">
                            <Table className="pending-payments-table"
                                   dataSource={this.state.pendingPaymentArray}
                                   columns={pendingPaymentColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                   scroll={{ x: '100%' }}
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                        </TabPane>

                        <TabPane tab={`Riders`} key="4">
                            <Table className="users-table"
                                   dataSource={this.state.userArray}
                                   columns={userColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                   scroll={{ x: '100%' }}
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                        </TabPane>
                    </Tabs>

                    <AddLessonForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                    />

                </div>
            </div>);
    }
}

export default withRouter(Schedule);