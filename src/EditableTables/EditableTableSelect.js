import {Table, Select, Form} from 'antd';
import React, { Component } from 'react';
import {LevelOptions} from "../constants/index";
import {VALIDATION_TEXT} from "../constants/Texts";

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
const Option = Select.Option;

class EditableCell extends Component {
    state = {
        editing: false,
    }

    componentDidMount() {
        if (this.props.editable) {
            document.addEventListener('click', this.handleClickOutside, true);
        }
    }

    componentWillUnmount() {
        if (this.props.editable) {
            document.removeEventListener('click', this.handleClickOutside, true);
        }
    }

    toggleEdit = () => {
        const editing = !this.state.editing;
        this.setState({editing}, () => {
            if (editing) {
                this.input.focus();
            }
        });
    }

    handleClickOutside = (e) => {
        const {editing} = this.state;
        if (editing && this.cell !== e.target && !this.cell.contains(e.target)) {
            this.save(e);
        }
    }

    save = () => {
        const {record, handleSave} = this.props;
        this.form.validateFields((error, values) => {
            if (error) {
                return;
            }
            this.toggleEdit();
            console.log(values);
            handleSave({...record, ...values});
        });
    }

    render() {
        const {editing} = this.state;
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            ...restProps,
        } = this.props;
        return (
            <td ref={node => (this.cell = node)} {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>
                        {(form) => {
                            this.form = form;
                            return (
                                editing ? (
                                    <FormItem style={{margin: 0}}>
                                        {form.getFieldDecorator(dataIndex, {
                                            rules: [{
                                                required: true,
                                                message: `${title} ${VALIDATION_TEXT}`,
                                            }],
                                        })(
                                            <Select
                                                onSelect={this.save}

                                                ref={node => (this.input = node)}
                                                style={{width: 120}}>
                                                {
                                                    LevelOptions.map(element => {
                                                        return <Option value={element}> {element}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </FormItem>
                                ) : (
                                    <div
                                        className="editable-cell-value-wrap"
                                        style={{paddingRight: 24}}
                                        onClick={this.toggleEdit}
                                    >
                                        {restProps.children}
                                    </div>
                                )
                            );
                        }}
                    </EditableContext.Consumer>
                ) : restProps.children}
            </td>
        );
    }
}


class EditableTableSelect extends Component {
    constructor(props) {
        super(props);
        this.columns = this.props.columns

        this.state = {
            dataSource: this.props.dataSource
        };
    }

    componentWillReceiveProps(nextProps) {
        if(this.props != nextProps) {
            this.setState({
                dataSource: nextProps.dataSource
            });
        }
    }

    render() {
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.props.handleSave,
                }),
            };
        });
        return (
            <div>
                <Table
                    className={`${this.props.className }`}
                    components={components}
                    rowClassName={() => 'editable-row'}
                    dataSource={this.state.dataSource}
                    columns={columns}
                    rowKey='id'
                />
            </div>
        );
    }
}

export default EditableTableSelect