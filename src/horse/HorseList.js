import React, { Component } from 'react';
import LoadingIndicator  from '../common/LoadingIndicator';
import './HorseList.css';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {addHorse, getAllHorses, deleteHorse } from '../util/APIUtils';
import {Button, Modal, Table } from 'antd';
import {notification} from "antd/lib/index";
import AddHorseForm from "./AddHorseForm";

class HorseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            horseArray: [],
            visible: false,
            buttonClass : ""
        }
    }

    componentDidMount() {
        this.loadHorseArray()
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

    showModal = () => {
        this.setState({visible: true});
    };

    handleCancel = () => {
        this.setState({visible: false});
    };

    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            addHorse({
                horseName: values.horseName
            }).then(response => {
                notification.success({
                    message: 'Ardena',
                    description: response.message,
                });
                this.props.history.push("/horses");
                this.loadHorseArray()
            }).catch(error => {
                notification.error({
                    message: 'Ardena',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });

            form.resetFields();
            this.setState({visible: false});

            this.loadHorseArray();
        });
    };

    saveFormRef = (formRef) => {
        this.formRef = formRef;
    };

    render() {

        const confirm = Modal.confirm;

        if (this.state.isLoading) {
            return <LoadingIndicator/>;
        }

        if (this.state.notFound) {
            return <NotFound/>;
        }

        if (this.state.serverError) {
            return <ServerError/>;
        }
        const columns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '25%'
        }, {
            title: 'Horse Name',
            dataIndex: 'horseName',
            key: 'horseName',
            width: '50%'
        }, {
            title: 'Action',
            key: 'action',
            width: '25%',
            render: (text, record) => (<span onClick={
                () =>
                    confirm({
                        title: 'Do you want to delete this object?',
                        content: record.horseName,
                        onOk: () => {
                            deleteHorse(record.id).then(response => {
                                notification.success({
                                    message: 'Ardena',
                                    description: response.message,
                                });
                                this.props.history.push("/horses");
                                this.loadHorseArray()
                            }).catch(error => {
                                notification.error({
                                    message: 'Ardena',
                                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                                });
                            })
                        },
                        onCancel() {
                            console.log('Cancel');
                        },
                    })
            }>
                <a>Delete</a> </span>)
        }];

        return (
            <div className="horse-list">

                <AddHorseForm
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                />

                <Table className="horse-table"
                       dataSource={this.state.horseArray}
                       columns={columns}
                       rowKey='id'
                       bordered
                       rowClassName="horse-row"
                    // scroll={{ x: '100%', y: '100%' }}
                    // pagination={false}
                />

                <Button type="primary"
                        className={this.state.horseArray.length>0 ? 'add-horse-button' : 'add-horse-button-no-data'}
                        onClick={this.showModal}>
                    Add horse</Button>

            </div>);
    }
}

export default HorseList;