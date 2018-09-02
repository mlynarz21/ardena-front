import { Select, DatePicker, TimePicker, Modal, Form} from 'antd';
import * as React from "react";
import * as moment from "moment/moment";

const FormItem = Form.Item;
const Option = Select.Option;

const AddLessonForm = Form.create()(
    class extends React.Component {

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
                                    <DatePicker/>
                                )}
                            </FormItem>
                            <FormItem className="time-picker" label="Lesson hour">
                                {getFieldDecorator('time', {
                                    rules: [{required: true, message: 'Please pick the time!'}],
                                })(
                                    <TimePicker minuteStep={15} format={format}/>

                                )}
                            </FormItem>
                        </div>
                        <FormItem className="level-picker" label="Lesson level">
                            {getFieldDecorator('level', {
                                rules: [{required: true, message: 'Please pick lesson level!'}],
                            })(
                                <Select defaultValue="Basic" style={{width: 120}}>
                                    <Option value="Basic">Basic</Option>
                                    <Option value="Medium">Medium</Option>
                                    <Option value="Advanced">Advanced</Option>
                                    <Option value="Sport">Sport</Option>
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