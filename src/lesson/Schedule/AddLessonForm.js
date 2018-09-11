import { Select, DatePicker, TimePicker, Modal, Form} from 'antd';
import * as React from "react";
import {LevelOptions} from "../../constants";
import moment from "moment";

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
                    title="Add new lesson"
                    okText="Add"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <div className="flex-container">
                            <FormItem className="date-picker" label="Lesson date">
                                {getFieldDecorator('date', {
                                    rules: [{required: true, message: 'Please pick the date!'}],
                                })(
                                    <DatePicker
                                        disabledDate={this.disabledDate}
                                    />
                                )}
                            </FormItem>
                            <FormItem style={{marginLeft: 20}} className="time-picker" label="Lesson hour">
                                {getFieldDecorator('time', {
                                    rules: [{required: true, message: 'Please pick the time!'}],
                                })(
                                    <TimePicker
                                        minuteStep={15}
                                        format={format}/>
                                )}
                            </FormItem>
                        </div>
                        <FormItem className="level-picker" label="Lesson level">
                            {getFieldDecorator('level', {
                                rules: [{required: true, message: 'Please pick lesson level!'}],
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