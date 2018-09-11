import React, { Component } from 'react';
import { createEvent } from '../util/APIUtils';
import { MAX_CHOICES, POLL_QUESTION_MAX_LENGTH, POLL_CHOICE_MAX_LENGTH } from '../constants';
import './NewEvent.css';
import { Form, Input, Button, Icon, Select, Col, notification } from 'antd';
import moment from "moment";

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
            options: [{
                text: ''
            }]
        };
        this.addOption = this.addOption.bind(this);
        this.removeOption = this.removeOption.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
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
            eventDate: moment().add(1,'d').toISOString()
        };

        createEvent(eventData)
        .then(response => {
            this.props.history.push("/");
        }).catch(error => {
            if(error.status === 401) {
                this.props.handleLogout('/login', 'error', 'You have been logged out. Please login');
            } else {
                notification.error({
                    message: 'Ardena',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });              
            }
        });
    }

    validateDescription = (questionText) => {
        if(questionText.length === 0) {
            return {
                validateStatus: 'error',
                errorMsg: 'Please enter your description!'
            }
        // } else if (questionText.length > POLL_QUESTION_MAX_LENGTH) {
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
    }

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
                errorMsg: 'Please enter option!'
            }
        } else if (optionText.length > POLL_CHOICE_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Option is too long (Maximum ${POLL_CHOICE_MAX_LENGTH} characters allowed)`
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
        }

        this.setState({
            options: options
        });
    }

    isFormInvalid() {
        if(this.state.description.validateStatus !== 'success') {
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
        this.state.options.forEach((option, index) => {
            optionViews.push(<EventOption key={index} option={option} optionNumber={index} removeOption={this.removeOption} handleOptionChange={this.handleOptionChange}/>);
        });

        return (
            <div className="new-event-container">
                <h1 className="page-title">Create Event</h1>
                <div className="new-event-content">
                    <Form onSubmit={this.handleSubmit} className="create-event-form">
                        <FormItem validateStatus={this.state.description.validateStatus}
                                  help={this.state.description.errorMsg} className="event-form-row">
                        <TextArea 
                            placeholder="Enter your question"
                            style = {{ fontSize: '16px' }} 
                            autosize={{ minRows: 3, maxRows: 6 }} 
                            name = "question"
                            value = {this.state.description.text}
                            onChange = {this.handleDescriptionChange} />
                        </FormItem>
                        {optionViews}
                        <FormItem className="event-form-row">
                            <Button type="dashed" onClick={this.addOption} disabled={this.state.options.length === MAX_CHOICES}>
                                <Icon type="plus" /> Add option
                            </Button>
                        </FormItem>
                        <FormItem className="event-form-row">
                            <Button type="primary" 
                                htmlType="submit" 
                                size="large" 
                                disabled={this.isFormInvalid()}
                                className="create-event-form-button">Create Event</Button>
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
                placeholder = {'Option ' + (props.optionNumber + 1)}
                size="large"
                value={props.option.text}
                className={ props.optionNumber > 0 ? "optional-option": null}
                onChange={(event) => props.handleOptionChange(event, props.optionNumber)} />

            {
                props.optionNumber > 0 ? (
                <Icon
                    className="dynamic-delete-button"
                    type="close"
                    disabled={props.optionNumber < 1}
                    onClick={() => props.removeOption(props.optionNumber)}
                /> ): null
            }    
        </FormItem>
    );
}


export default NewEvent;