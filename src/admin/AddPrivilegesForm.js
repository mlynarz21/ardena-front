import {Select, DatePicker, TimePicker, Modal, Form, AutoComplete} from 'antd';
import * as React from "react";
import {getAdmins} from "../util/APIUtils";
import {ADD_TEXT, CANCEL_TEXT, INPUT_TEXT, PRIVILEGES_TEXT, USER_TEXT, VALIDATION_TEXT} from "../constants/Texts";

const FormItem = Form.Item;

const AddPrivilegesForm = Form.create()(
    class extends React.Component {

        render() {
            const {dataSource,visible, onCancel, onCreate, form} = this.props;
            const {getFieldDecorator} = form;
            return (
                <Modal
                    visible={visible}
                    title={ADD_TEXT + PRIVILEGES_TEXT}
                    okText={ADD_TEXT}
                    cancelText={CANCEL_TEXT}
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem className="user-picker" label={USER_TEXT}>
                            {getFieldDecorator('user', {
                                rules: [{required: true, message: USER_TEXT + VALIDATION_TEXT}],
                            })(
                                <AutoComplete
                                    style={{ width: 300 }}
                                    dataSource={dataSource}
                                    placeholder={INPUT_TEXT}
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