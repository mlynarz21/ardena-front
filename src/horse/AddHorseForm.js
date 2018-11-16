import {Modal, Form, Input, Select} from 'antd';
import * as React from "react";
import {
    ADD_TEXT, HORSE_TEXT, HORSE_NAME_TEXT, VALIDATION_TEXT, CANCEL_TEXT,
    LESSON_LEVEL_TEXT, HORSE_LEVEL_TEXT
} from "../constants/Texts";
import {LevelOptions} from "../constants";
const FormItem = Form.Item;
const Option = Select.Option;

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
                        <FormItem className="level-picker" label={HORSE_LEVEL_TEXT}>
                            {getFieldDecorator('horseLevel', {
                                rules: [{required: true, message: HORSE_LEVEL_TEXT + VALIDATION_TEXT}],
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

export default AddHorseForm;