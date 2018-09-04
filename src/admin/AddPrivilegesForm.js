import {Select, DatePicker, TimePicker, Modal, Form, AutoComplete} from 'antd';
import * as React from "react";
import {getAdmins} from "../util/APIUtils";

const FormItem = Form.Item;

const AddPrivilegesForm = Form.create()(
    class extends React.Component {

        render() {
            const {dataSource,visible, onCancel, onCreate, form} = this.props;
            const {getFieldDecorator} = form;
            return (
                <Modal
                    visible={visible}
                    title="Add privileges"
                    okText="Add"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem className="user-picker" label="User">
                            {getFieldDecorator('user', {
                                rules: [{required: true, message: 'Please pick up the user!'}],
                            })(
                                <AutoComplete
                                    style={{ width: 300 }}
                                    dataSource={dataSource}
                                    placeholder="type here"
                                    filterOption={(inputValue, option) => option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
                                />
                            )}
                        </FormItem>
                    </Form>
                </Modal>
            );
        }
    }
);

export default AddPrivilegesForm;