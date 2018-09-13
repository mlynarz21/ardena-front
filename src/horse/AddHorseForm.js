import { Modal, Form, Input} from 'antd';
import * as React from "react";
import {ADD_TEXT, HORSE_TEXT, HORSE_NAME_TEXT, VALIDATION_TEXT, CANCEL_TEXT} from "../constants/Texts";
const FormItem = Form.Item;

const AddHorseForm = Form.create()(
    class extends React.Component {
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title={ADD_TEXT + HORSE_TEXT}
                    okText={ADD_TEXT}
                    cancelText={CANCEL_TEXT}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label={HORSE_NAME_TEXT}>
                            {getFieldDecorator('horseName', {
                                rules: [{ required: true, message: HORSE_NAME_TEXT + VALIDATION_TEXT }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            );
        }
    }
);

export default AddHorseForm;