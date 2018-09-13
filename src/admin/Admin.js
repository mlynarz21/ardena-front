import React, { Component } from 'react';
import './Admin.css';
import {Button, Popconfirm, Table, Tabs} from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import withRouter from "react-router-dom/es/withRouter";
import {Link} from "react-router-dom";
import {
    addUserRole, getAdmins, getAllUsers, getInstructors,
    removeUserRole
} from "../util/APIUtils";
import {notification} from "antd/lib/index";
import AddPrivilegesForm from "./AddPrivilegesForm";
import EditableTable from "../EditableTables/EditableTable";
import moment from "moment";
import {
    ACTION_TEXT, ADD_TEXT, ADMIN_REMOVAL_TEXT, ADMINS_TEXT, APP_NAME, ERROR_TEXT, INSTRUCTOR_REMOVAL_TEXT,
    INSTRUCTORS_TEXT,
    NAME_TEXT, NO_TEXT,
    REMOVE_TEXT,
    UNAUTHORIZED_TEXT,
    USERNAME_TEXT, YES_TEXT
} from "../constants/Texts";

const TabPane = Tabs.TabPane;

class Admin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            adminArray: [],
            instructorArray: [],
            userArray: [],
            visible: false,
            activeKey: 1
        };
    }

    componentDidMount() {
        this.loadAdminArray();
        this.loadInstructorArray();
        this.loadUserArray();
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

    loadAdminArray() {
        getAdmins().then(response => {
            this.setState(
                {
                    isLoading: false,
                    adminArray: response
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

    onChange = (key) => {
        this.setState({ activeKey: key });
    };

    showModal = () => {
        this.setState({visible: true});
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };

    handleCancel = () => {
        const form = this.formRef.props.form;
        this.setState({visible: false});
        form.resetFields();
    };

    getPrivilegeRequest = () => {
        return this.state.activeKey===1 ? {name:"ROLE_INSTRUCTOR"} : {name:"ROLE_ADMIN"}
    };

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const username = values.user.split(" ")[0];

            this.addPrivileges(username,this.getPrivilegeRequest());

            form.resetFields();
            this.setState({visible: false});
        });
    };

    addPrivileges(username, role) {
        addUserRole(username, role).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/admin");
            this.loadAdminArray();
            this.loadInstructorArray();
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

    removePrivileges(userId, role) {
        removeUserRole(userId, role).then(response => {
            notification.success({
                message: APP_NAME,
                description: response.message,
            });
            this.props.history.push("/admin");
            this.loadAdminArray();
            this.loadInstructorArray();
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

        const adminColumns = [{
            title: 'Id',
            key: 'id',
            width: '20%',
            dataIndex: "id"
        }, {
            title: NAME_TEXT,
            key: 'name',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.username}`}>
                    {record.name}
                </Link>)
        }, {
            title: USERNAME_TEXT,
            dataIndex: 'username',
            key: 'username',
            width: '30%'
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title={ADMIN_REMOVAL_TEXT} onConfirm={() => {
                    this.removePrivileges(record.id, {"name": "ROLE_ADMIN"})
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{REMOVE_TEXT}</a>
                </Popconfirm>)
        }];

        const instructorColumns = [{
            title: 'Id',
            key: 'id',
            width: '20%',
            dataIndex: "id"
        }, {
            title: NAME_TEXT,
            key: 'name',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.username}`}>
                    {record.name}
                </Link>)
        }, {
            title: USERNAME_TEXT,
            dataIndex: 'username',
            key: 'username',
            width: '30%'
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title={INSTRUCTOR_REMOVAL_TEXT} onConfirm={() => {
                    this.removePrivileges(record.id, ({"name": "ROLE_INSTRUCTOR"}))
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{REMOVE_TEXT}</a>
                </Popconfirm>)
        }];

        return (
                <div className="tab-panel">

                    <Tabs defaultActiveKey="1"
                          animated={false}
                          tabBarStyle={tabBarStyle}
                          size="large"
                          className="lesson-tabs"
                          onChange={this.onChange}>

                        <TabPane tab={INSTRUCTORS_TEXT} key="1">
                            <div className="instructor-container">
                                <Table className="instructor-table"
                                       dataSource={this.state.instructorArray}
                                       columns={instructorColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                />
                                <Button type="primary"
                                        className={this.state.instructorArray.length > 0 ? 'add-privileges-button' : 'add-privileges-button-no-data'}
                                        onClick={this.showModal}>
                                    {ADD_TEXT} {INSTRUCTORS_TEXT}</Button>
                            </div>
                        </TabPane>
                        <TabPane tab={ADMINS_TEXT} key="2">
                            <div className="admin-container">
                                <Table className="admin-table"
                                       dataSource={this.state.adminArray}
                                       columns={adminColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                />

                                <Button type="primary"
                                        className={this.state.adminArray.length > 0 ? 'add-privileges-button' : 'add-privileges-button-no-data'}
                                        onClick={this.showModal}>
                                    {ADD_TEXT} {ADMINS_TEXT}</Button>
                            </div>
                        </TabPane>

                    </Tabs>

                <AddPrivilegesForm
                    wrappedComponentRef={this.saveFormRef}
                    dataSource={this.state.userArray.map ( x => x.username+" ("+x.name+")")}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                />
            </div>);
    }
}

export default withRouter(Admin);