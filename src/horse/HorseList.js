import React, { Component } from 'react';
import LoadingIndicator  from '../common/LoadingIndicator';
import './HorseList.css';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {addHorse, getAllHorses, deleteHorse, updateHorse} from '../util/APIUtils';
import {Popconfirm, Button, Modal, Table } from 'antd';
import {notification} from "antd/lib/index";
import AddHorseForm from "./AddHorseForm";
import EditableTable from "../admin/EditableTable";
import EditableTable2 from "../admin/EditableTableAuto";

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

    delete(horseId) {
        deleteHorse(horseId).then(response => {
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

    handleSave = (row) => {
        updateHorse(row.id,
            {horseName:row.horseName}).then(response => {
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

        const horseColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '25%'
        }, {
            title: 'Horse Name',
            dataIndex: 'horseName',
            key: 'horseName',
            width: '50%',
            editable: true
        }, {
            title: 'Action',
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <Popconfirm placement="left" title="Want to delete this horse?" onConfirm={() => {
                    this.delete(record.id)
                }}
                            okText="Yes" cancelText="No">
                    <a>Delete</a>
                </Popconfirm>)
        }];

        return (
            <div className="horse-list">

                <AddHorseForm
                    wrappedComponentRef={this.saveFormRef}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    onCreate={this.handleCreate}
                />

                {/*<Table className="horse-table"*/}
                       {/*dataSource={this.state.horseArray}*/}
                       {/*columns={horseColumns}*/}
                       {/*rowKey='id'*/}
                       {/*bordered*/}
                       {/*rowClassName="horse-row"*/}
                       {/*scroll={{ x: '100%' }}*/}
                    {/*// scroll={{ x: '100%', y: '100%' }}*/}
                    {/*// pagination={false}*/}
                {/*/>*/}

                <EditableTable
                    className="horse-table"
                    dataSource={this.state.horseArray}
                    columns={horseColumns}
                    handleSave={this.handleSave}
                ></EditableTable>

                <Button type="primary"
                        className={this.state.horseArray.length>0 ? 'add-horse-button' : 'add-horse-button-no-data'}
                        onClick={this.showModal}>
                    Add horse</Button>

            </div>);
    }
}

export default HorseList;