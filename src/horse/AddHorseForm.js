import { Modal, Form, Input} from 'antd';
import * as React from "react";
const FormItem = Form.Item;

const AddHorseForm = Form.create()(
    class extends React.Component {
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Add new Horse"
                    okText="Add"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label="Horse name">
                            {getFieldDecorator('horseName', {
                                rules: [{ required: true, message: 'Please input the horse name!' }],
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