import React, { Component } from 'react';
import LoadingIndicator  from '../common/LoadingIndicator';
import './HorseList.css';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {addHorse, getAllHorses, deleteHorse, updateHorse} from '../util/APIUtils';
import {Popconfirm, Button} from 'antd';
import {notification} from "antd/lib/index";
import AddHorseForm from "./AddHorseForm";
import EditableTable from "../EditableTables/EditableTable";
import {
    ACTION_TEXT, ADD_TEXT, APP_NAME, DELETE_HORSE_TEXT, DELETE_TEXT, ERROR_TEXT, HORSE_NAME_TEXT, HORSE_TEXT, NO_TEXT,
    UNAUTHORIZED_TEXT, YES_TEXT
} from "../constants/Texts";

class HorseList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            horseArray: [],
            visible: false,
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
                message: APP_NAME,
                description: response.message,
            });
            this.loadHorseArray()
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
                    message: APP_NAME,
                    description: response.message,
                });
                this.loadHorseArray()
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
                message: APP_NAME,
                description: response.message,
            });
            this.loadHorseArray()
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

        const horseColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '25%'
        }, {
            title: HORSE_NAME_TEXT,
            dataIndex: 'horseName',
            key: 'horseName',
            width: '50%',
            editable: true
        }, {
            title: ACTION_TEXT,
            key: 'action',
            width: '25%',
            render: (text, record) => (
                <Popconfirm placement="left" title={DELETE_HORSE_TEXT} onConfirm={() => {
                    this.delete(record.id)
                }}
                            okText={YES_TEXT} cancelText={NO_TEXT}>
                    <a>{DELETE_TEXT}</a>
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

                <EditableTable
                    className="horse-table"
                    dataSource={this.state.horseArray}
                    columns={horseColumns}
                    handleSave={this.handleSave}>
                </EditableTable>

                <Button type="primary"
                        className={this.state.horseArray.length>0 ? 'add-horse-button' : 'add-horse-button-no-data'}
                        onClick={this.showModal}>
                    {ADD_TEXT} {HORSE_TEXT}
                </Button>

            </div>);
    }
}

export default HorseList;