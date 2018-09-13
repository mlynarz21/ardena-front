import { Select, DatePicker, TimePicker, Modal, Form} from 'antd';
import * as React from "react";
import {LevelOptions} from "../../constants";
import moment from "moment";
import {
    ADD_TEXT, CANCEL_TEXT, LESSON_DATE_TEXT, LESSON_LEVEL_TEXT, LESSON_TEXT, LESSON_TIME_TEXT,
    VALIDATION_TEXT
} from "../../constants/Texts";

const FormItem = Form.Item;
const Option = Select.Option;

const AddLessonForm = Form.create()(

    class extends React.Component {

        disabledDate(current) {
            return current && current < moment().endOf('day').subtract(1, 'd');
        }

        render() {
            const format = 'HH:mm';
            const {visible, onCancel, onCreate, form} = this.props;
            const {getFieldDecorator} = form;

            return (
                <Modal
                    visible={visible}
                    title={ADD_TEXT + LESSON_TEXT}
                    okText={ADD_TEXT}
                    cancelText={CANCEL_TEXT}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <div className="flex-container">
                            <FormItem className="date-picker" label={LESSON_DATE_TEXT}>
                                {getFieldDecorator('date', {
                                    rules: [{required: true, message: LESSON_DATE_TEXT + VALIDATION_TEXT}],
                                })(
                                    <DatePicker
                                        disabledDate={this.disabledDate}
                                    />
                                )}
                            </FormItem>
                            <FormItem style={{marginLeft: 20}} className="time-picker" label={LESSON_TIME_TEXT}>
                                {getFieldDecorator('time', {
                                    rules: [{required: true, message: LESSON_TIME_TEXT + VALIDATION_TEXT}],
                                })(
                                    <TimePicker
                                        minuteStep={30}
                                        format={format}/>
                                )}
                            </FormItem>
                        </div>
                        <FormItem className="level-picker" label={LESSON_LEVEL_TEXT}>
                            {getFieldDecorator('level', {
                                rules: [{required: true, message: LESSON_LEVEL_TEXT + VALIDATION_TEXT}],
                            })(
                                <Select style={{width: 120}}>
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

export default AddLessonForm;