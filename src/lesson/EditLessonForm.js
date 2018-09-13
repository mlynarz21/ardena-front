import {Modal, Form, Input, Select} from 'antd';
import * as React from "react";
import AutoComplete from "antd/es/auto-complete/index";
import {LevelOptions} from "../constants";
import {
    CANCEL_TEXT, EDIT_TEXT, INPUT_TEXT, INSTRUCTOR_TEXT, LESSON_LEVEL_TEXT, LESSON_TEXT,
    VALIDATION_TEXT
} from '../constants/Texts';

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
                    title={EDIT_TEXT + LESSON_TEXT}
                    okText={EDIT_TEXT}
                    cancelText={CANCEL_TEXT}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label={INSTRUCTOR_TEXT}>
                            {getFieldDecorator('instructor', {
                                rules: [{
                                    required: true,
                                    message: INSTRUCTOR_TEXT + VALIDATION_TEXT }],
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
                        <FormItem label={LESSON_LEVEL_TEXT}>
                            {getFieldDecorator('lessonLevel', {
                                rules: [{ required: true, message: LESSON_LEVEL_TEXT + VALIDATION_TEXT }],
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