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
import EditableTable from "./EditableTable";

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
        }
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
    }

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

    getPrivilageRequest = () => {
        return this.state.activeKey===1 ? {name:"ROLE_INSTRUCTOR"} : {name:"ROLE_ADMIN"}
    }

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            const username = values.user.split(" ")[0]

            console.log(username);
            console.log(this.state.activeKey);

            this.addPrivileges(username,this.getPrivilageRequest());

            form.resetFields();
            this.setState({visible: false});
        });
    };

    addPrivileges(username, role) {
        addUserRole(username, role).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/admin");
            this.loadAdminArray();
            this.loadInstructorArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
        });
    }

    removePrivileges(userId, role) {
        removeUserRole(userId, role).then(response => {
            notification.success({
                message: 'Ardena',
                description: response.message,
            });
            this.props.history.push("/admin");
            this.loadAdminArray();
            this.loadInstructorArray();
        }).catch(error => {
            notification.error({
                message: 'Ardena',
                description: error.message || 'Sorry! Something went wrong. Please try again!'
            });
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
            title: 'name',
            key: 'name',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.username}`}>
                    {record.name}
                </Link>)
        }, {
            title: 'username',
            dataIndex: 'username',
            key: 'username',
            width: '30%'
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to remove admin from this user?" onConfirm={() => {
                    this.removePrivileges(record.id, {"name": "ROLE_ADMIN"})
                }}
                            okText="Yes" cancelText="No">
                    <a>Remove</a>
                </Popconfirm>)
        }];

        const instructorColumns = [{
            title: 'Id',
            key: 'id',
            width: '20%',
            dataIndex: "id"
        }, {
            title: 'name',
            key: 'name',
            width: '30%',
            render: (text, record) => (
                <Link className="user-link" to={`/users/${record.username}`}>
                    {record.name}
                </Link>)
        }, {
            title: 'username',
            dataIndex: 'username',
            key: 'username',
            width: '30%'
        }, {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to remove instructor from this user?" onConfirm={() => {
                    this.removePrivileges(record.id, ({"name": "ROLE_INSTRUCTOR"}))
                }}
                            okText="Yes" cancelText="No">
                    <a>Remove</a>
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

                        <TabPane tab={`Instructors`} key="1">
                            <div className="instructor-container">
                                <Table className="instructor-table"
                                       dataSource={this.state.instructorArray}
                                       columns={instructorColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                    // scroll={{ x: '100%', y: '100%' }}
                                    // pagination={false}
                                />
                                <Button type="primary"
                                        className={this.state.instructorArray.length > 0 ? 'add-privileges-button' : 'add-privileges-button-no-data'}
                                        onClick={this.showModal}>
                                    Add instructors</Button>
                            </div>
                        </TabPane>
                        <TabPane tab={`Admins`} key="2">
                            <div className="admin-container">
                                <Table className="admin-table"
                                       dataSource={this.state.adminArray}
                                       columns={adminColumns}
                                       rowKey='id'
                                       rowClassName="lesson-row"
                                    // scroll={{ x: '100%', y: '100%' }}
                                    // pagination={false}
                                />

                                <Button type="primary"
                                        className={this.state.adminArray.length > 0 ? 'add-privileges-button' : 'add-privileges-button-no-data'}
                                        onClick={this.showModal}>
                                    Add admins</Button>
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