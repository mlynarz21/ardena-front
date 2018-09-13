import React, { Component } from 'react';
import './Schedule.css';
import {Button, Popconfirm, Table, Tabs, Calendar, Alert, Divider, Icon, Input, Badge} from 'antd';
import LoadingIndicator  from '../../common/LoadingIndicator';
import NotFound from '../../common/NotFound';
import ServerError from '../../common/ServerError';
import * as moment from "moment";
import {
    acceptReservation, addLesson, addPass, cancelReservation, deleteLesson, getAllUsers, getLessonsByDateAndInstructor, getLessonsByInstructor,
    getPendingReservationsByInstructor,
    getUnpaidReservationsByInstructor, payForReservation, updateUserLevel
} from "../../util/APIUtils";
import {notification} from "antd/lib/index";
import AddLessonForm from "./AddLessonForm";
import {Link, withRouter} from 'react-router-dom';
import EditableTableSelect from "../../EditableTables/EditableTableSelect";
import {
    formatDateTimeShort, formatDateToDMY, getIsoStringFromDate,
    getIsoStringFromDateAndTime
} from "../../util/Helpers";
import {
    ACCEPT_TEXT,
    ACTION_TEXT, ADD_PASS_NOTIFICATION_TEXT, ADD_PASS_TEXT,
    APP_NAME, CANCEL_TEXT, DATE_TEXT, DELETE_LESSON_TEXT, DELETE_TEXT, ERROR_TEXT, INPUT_TEXT, LESSON_LEVEL_TEXT,
    MY_SCHEDULE_TEXT,
    NO_TEXT, PASS_TEXT, PAY_CASH_TEXT, PENDING_PAYMENTS_TEXT, PENDING_RESERVATIONS_TEXT,
    RESERVATION_ACCEPT_TEXT,
    RESERVATION_CANCEL_TEXT, RESERVATION_PAY_CASH_TEXT, RESERVATION_PAY_PASS_TEXT, RIDER_LEVEL_TEXT,
    RIDER_NAME_TEXT, RIDERS_TEXT, SELECTED_DATE_TEXT,
    UNAUTHORIZED_TEXT, USERNAME_TEXT,
    YES_TEXT
} from "../../constants/Texts";

const TabPane = Tabs.TabPane;

class Schedule extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: moment().subtract(1, 'd'),
            selectedValue: "",
            lessonArray: [],
            lessonByDateArray: [],
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
                    lessonByDateArray: response
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
        this.loadLessonArrayByDate({date: getIsoStringFromDate(value)});
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
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadPendingReservationArray();
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

    confirmDeletion(lessonId) {
        deleteLesson(lessonId).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadLessonArray();
            if (this.state.selectedValue !== "")
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

    confirmAccept(reservationId) {
        acceptReservation(reservationId).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/schedule");
            this.loadPendingReservationArray();
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

    payReservation(reservationId, data){
        payForReservation(reservationId, data).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadPendingPaymentArray();
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

    addPassToUser(userId, data){
        addPass(userId, data).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadPendingPaymentArray();
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

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }

            addLesson({
                lessonLevel: values.level,
                date: getIsoStringFromDateAndTime(values.date,  values.time.format('HH'), values.time.format('mm')),
            }).then(response => {
                notification.success({
                    message: APP_NAME,
                    description: response.message,
                });
                this.props.history.push("/schedule");
                this.loadLessonArray();
                if (this.state.selectedValue !== "")
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

            form.resetFields();
            this.setState({visible: false});
        });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };

    handleSave = (row) => {
        updateUserLevel(row.id,
            {name:row.name, username:row.username, level:row.level}).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.loadUserArray()
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

        let handleSearch = (selectedKeys, confirm) => () => {
            confirm();
            this.setState({userFilterText: selectedKeys[0]===undefined ? " " : selectedKeys[0]});
        };

        let handleReset = clearFilters => () => {
            clearFilters();
            this.setState({userFilterText: ''});
        };

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
            width: '20%',
            render: (text, record) => (
                <Link className="lesson-link" to={`/lessons/${record.id}`}>
                    {record.id}
                </Link>)
        }, {
            title: LESSON_LEVEL_TEXT,
            dataIndex: 'lessonLevel',
            key: 'lessonLevel',
            width: '25%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '30%',
            render: (text, record) => (
                formatDateTimeShort(record.date)
            )
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title={DELETE_LESSON_TEXT} onConfirm={() => {
                    this.confirmDeletion(record.id)
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{DELETE_TEXT}</a>
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
            title: RIDER_NAME_TEXT,
            key: 'name',
            width: '25%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.rider.username}`}>
                   {record.rider.name}
                </Link>)
        }, {
            title: LESSON_LEVEL_TEXT,
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '20%',
            render: (text, record) => (
                formatDateTimeShort(record.lesson.date)
            )
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <div>
                    <Popconfirm placement="left" title={RESERVATION_ACCEPT_TEXT} onConfirm={() => {
                        this.confirmAccept(record.id)
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a>{ACCEPT_TEXT} </a>
                    </Popconfirm>
                    <Divider type="vertical"/>
                    <Popconfirm placement="left" title={RESERVATION_CANCEL_TEXT} onConfirm={() => {
                        this.confirmCancel(record.id)
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a> {CANCEL_TEXT}</a>
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
            title: RIDER_NAME_TEXT,
            key: 'rider',
            width: '25%',
            dataIndex: 'rider.name',
            filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={(input) => {
                            this.searchInput = input;
                        }}
                        placeholder={INPUT_TEXT}
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
            title: LESSON_LEVEL_TEXT,
            dataIndex: 'lesson.lessonLevel',
            key: 'lessonLevel',
            width: '15%'
        }, {
            title: DATE_TEXT,
            key: 'date',
            width: '20%',
            render: (text, record) => (
                formatDateTimeShort(record.lesson.date)
            )
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <div>
                    <Popconfirm placement="left" title={RESERVATION_PAY_PASS_TEXT} onConfirm={() => {
                        this.payReservation(record.id,{status: "Paid_pass"});
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a>{PASS_TEXT}</a>
                    </Popconfirm>
                    <Divider type="vertical"/>
                    <Popconfirm placement="left" title={RESERVATION_PAY_CASH_TEXT} onConfirm={() => {
                        this.payReservation(record.id,{status: "Paid_cash"});
                    }}
                                okText={YES_TEXT} cancelText={NO_TEXT}>
                        <a>{PAY_CASH_TEXT}</a>
                    </Popconfirm>
                </div>)
        }];

        const userColumns = [{
            title: 'Id',
            key: 'id',
            width: '15%',
            dataIndex: 'id'
        }, {
            title: RIDER_NAME_TEXT,
            key: 'name',
            width: '25%',
            dataIndex: 'name',
            filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={(input) => {
                            this.searchInput = input;
                        }}
                        placeholder={INPUT_TEXT}
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
            title: RIDER_LEVEL_TEXT,
            dataIndex: 'level',
            key: 'level',
            width: '15%',
            editable: true
        }, {
            title: USERNAME_TEXT,
            dataIndex: 'username',
            key: 'username',
            width: '20%'
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <Popconfirm placement="left" title={ADD_PASS_NOTIFICATION_TEXT} onConfirm={() => {
                    this.addPassToUser(record.id, {noOfRidesPermitted: 10})
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{ADD_PASS_TEXT}</a>
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

                        <TabPane tab={MY_SCHEDULE_TEXT} key="1">
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
                                <div className="lesson-container">
                                    <Table className="schedule-lesson-table"
                                           dataSource={this.state.selectedValue===""?this.state.lessonByDateArray:this.state.lessonByDateArray}
                                           columns={lessonColumns}
                                           rowKey='id'
                                           rowClassName="lesson-row"
                                        // scroll={{ x: '100%', y: '100%' }}
                                        // pagination={false}
                                    />
                                    <Button type="primary"
                                            className={
                                                this.state.lessonByDateArray.length > 0
                                                && this.state.selectedValue===""
                                                || this.state.lessonByDateArray.length > 0 ? 'add-lesson-button' : 'add-lesson-button-no-data'}
                                            onClick={this.showModal}>
                                        Add lesson</Button>
                                </div>
                            </div>
                        </TabPane>

                        <TabPane tab={PENDING_RESERVATIONS_TEXT} key="2">
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

                        <TabPane tab={PENDING_PAYMENTS_TEXT} key="3">
                            <Table className="pending-payments-table"
                                   dataSource={this.state.pendingPaymentArray}
                                   columns={pendingPaymentColumns}
                                   rowKey='id'
                                   rowClassName="lesson-row"
                                // scroll={{ x: '100%', y: '100%' }}
                                // pagination={false}
                            />
                        </TabPane>

                        <TabPane tab={RIDERS_TEXT} key="4">
                            <EditableTableSelect
                                className="users-table"
                                dataSource={this.state.userArray}
                                columns={userColumns}
                                handleSave={this.handleSave}>
                            </EditableTableSelect>

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