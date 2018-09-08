import {Modal, Form, Input, Select} from 'antd';
import * as React from "react";
import AutoComplete from "antd/es/auto-complete/index";
import {LevelOptions} from "../constants";
import {INPUT_TEXT} from '../constants/Texts';

const FormItem = Form.Item;
const Option = Select.Option;

const EditLesson = Form.create()(
    class extends React.Component {
        render() {
            const { dataSource, visible, onCancel, onCreate, form, lesson } = this.props;
            const { getFieldDecorator } = form;

            return (
                <Modal
                    visible={visible}
                    title="Edit Lesson"
                    okText="Edit"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label="Instructor">
                            {getFieldDecorator('instructor', {
                                rules: [{
                                    required: true,
                                    message: `Instructor name is required` }],
                                    initialValue: lesson.instructor.username+' ('+lesson.instructor.name+')'
                            })(
                                <AutoComplete
                                    style={{ width: 300 }}
                                    dataSource={dataSource}
                                    placeholder={INPUT_TEXT}
                                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                />
                            )}
                        </FormItem>
                        <FormItem label="Lesson level">
                            {getFieldDecorator('lessonLevel', {
                                rules: [{ required: true, message: 'Lesson level is required' }],
                            })
                                (
                                <Select style={{width: 120}} defaultValue={lesson.lessonLevel}>
                                    {
                                        LevelOptions.map(element => {
                                            return <Option value={element}> {element}</Option>
                                        })
                                    }
                                </Select>
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            );
        }
    }
);

export default EditLesson;