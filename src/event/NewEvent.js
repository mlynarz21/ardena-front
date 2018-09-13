import React, { Component } from 'react';
import { createEvent } from '../util/APIUtils';
import { MAX_OPTIONS, POLL_QUESTION_MAX_LENGTH, POLL_CHOICE_MAX_LENGTH } from '../constants';
import './NewEvent.css';
import {Form, Input, Button, Icon, Select, notification, DatePicker} from 'antd';
import moment from "moment";
import {
    ENTER_TEXT, OPTION_TEXT, PICK_TEXT, DESCRIPTION_TEXT, TIME_TEXT,
    VALIDATE_OPTION_TEXT, VALIDATE_DESCRIPTION_TEXT, VALIDATE_DATETIME_TEXT, OPTION_TOO_LONG_TEXT, EVENT_TEXT,
    CREATE_TEXT, ADD_TEXT, APP_NAME, ERROR_TEXT, UNAUTHORIZED_TEXT
} from "../constants/Texts";

const Option = Select.Option;
const FormItem = Form.Item;
const { TextArea } = Input

class NewEvent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: {
                text: ''
            },
            options: [],
            dateTime: [{
                text:''
            }]
        };
        this.addOption = this.addOption.bind(this);
        this.removeOption = this.removeOption.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
        this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }

    addOption(event) {
        const options = this.state.options.slice();
        this.setState({
            options: options.concat([{
                text: ''
            }])
        });
    }

    removeOption(optionNumber) {
        const options = this.state.options.slice();
        this.setState({
            options: [...options.slice(0, optionNumber), ...options.slice(optionNumber+1)]
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(moment());
        const eventData = {
            description: this.state.description.text,
            options: this.state.options.map(option => {
                return {text: option.text}
            }),
            eventDate: moment(this.state.dateTime.text).toISOString()
        };

        createEvent(eventData)
        .then(response => {
            this.props.history.push("/");
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', UNAUTHORIZED_TEXT);
            } else {
                notification.error({
                    message: APP_NAME,
                    description: error.message || ERROR_TEXT
                });              
            }
        });
    }

    validateDateTime = (dateTime) => {
        if(dateTime === null) {
            return {
                validateStatus: 'error',
                errorMsg: ENTER_TEXT+VALIDATE_DATETIME_TEXT
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    };

    handleDateTimeChange(value) {
        this.setState({
            dateTime: {
                text: value,
                ...this.validateDateTime(value)
            }
        });
    };

    validateDescription = (descriptionText) => {
        if(descriptionText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: ENTER_TEXT+VALIDATE_DESCRIPTION_TEXT
            }
        // } else if (descriptionText.length > POLL_QUESTION_MAX_LENGTH) {
        //     return {
        //         validateStatus: 'error',
        //         errorMsg: `Question is too long (Maximum ${POLL_QUESTION_MAX_LENGTH} characters allowed)`
        //     }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    };

    handleDescriptionChange(event) {
        const value = event.target.value;
        this.setState({
            description: {
                text: value,
                ...this.validateDescription(value)
            }
        });
    }

    validateOption = (optionText) => {
        if(optionText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: ENTER_TEXT+VALIDATE_OPTION_TEXT
            }
        } else if (optionText.length > POLL_CHOICE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: OPTION_TOO_LONG_TEXT
            }    
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null
            }
        }
    }

    handleOptionChange(event, index) {
        const options = this.state.options.slice();
        const value = event.target.value;

        options[index] = {
            text: value,
            ...this.validateOption(value)
        };

        this.setState({
            options: options
        });
    }

    isFormInvalid() {
        if(this.state.description.validateStatus !== 'success') {
            return true;
        }

        if(this.state.dateTime.validateStatus !== 'success') {
            return true;
        }
    
        for(let i = 0; i < this.state.options.length; i++) {
            const option = this.state.options[i];
            if(option.validateStatus !== 'success') {
                return true;
            }
        }
    }

    render() {
        const optionViews = [];

        {
            this.state.options!==null ? this.state.options.forEach((option, index) => {
                optionViews.push(<EventOption key={index} option={option} optionNumber={index} removeOption={this.removeOption} handleOptionChange={this.handleOptionChange}/>);
            }) : null
        }

        return (
            <div className="new-event-container">
                <h1 className="page-title">{CREATE_TEXT}{EVENT_TEXT}</h1>
                <div className="new-event-content">
                    <Form onSubmit={this.handleSubmit} className="create-event-form">
                        <FormItem validateStatus={this.state.description.validateStatus}
                                  help={this.state.description.errorMsg} className="event-form-row">
                        <TextArea 
                            placeholder={ENTER_TEXT+DESCRIPTION_TEXT}
                            style = {{ fontSize: '16px' }} 
                            autosize={{ minRows: 3, maxRows: 6 }} 
                            name = "question"
                            value = {this.state.description.text}
                            onChange = {this.handleDescriptionChange} />
                        </FormItem>
                        <FormItem validateStatus={this.state.dateTime.validateStatus}
                                  help={this.state.dateTime.errorMsg} className="event-form-row">
                            <DatePicker
                                style={{ width: "100%" }}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                placeholder={PICK_TEXT+TIME_TEXT}
                                onChange={this.handleDateTimeChange}
                            />
                        </FormItem>
                        {optionViews}
                        <FormItem className="event-form-row">
                            <Button type="dashed" onClick={this.addOption} disabled={this.state.options.length === MAX_OPTIONS}>
                                <Icon type="plus" /> {ADD_TEXT}{OPTION_TEXT}
                            </Button>
                        </FormItem>
                        <FormItem className="event-form-row">
                            <Button type="primary" 
                                htmlType="submit" 
                                size="large" 
                                disabled={this.isFormInvalid()}
                                className="create-event-form-button">{CREATE_TEXT}{EVENT_TEXT}</Button>
                        </FormItem>
                    </Form>
                </div>    
            </div>
        );
    }
}

function EventOption(props) {
    return (
        <FormItem validateStatus={props.option.validateStatus}
                  help={props.option.errorMsg} className="event-form-row">
            <Input
                placeholder={OPTION_TEXT + (props.optionNumber + 1)}
                size="large"
                value={props.option.text}
                className={"optional-option"}
                onChange={(event) => props.handleOptionChange(event, props.optionNumber)}/>

            <Icon
                className="dynamic-delete-button"
                type="close"
                onClick={() => props.removeOption(props.optionNumber)}
            />

        </FormItem>
    );
}


export default NewEvent;