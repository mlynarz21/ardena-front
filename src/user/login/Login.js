import React, { Component } from 'react';
import { login } from '../../util/APIUtils';
import './Login.css';
import { Link } from 'react-router-dom';
import { isAdmin ,isInstructor, ACCESS_TOKEN } from '../../constants';

import { Form, Input, Button, Icon, notification } from 'antd';
import {
    APP_NAME, ENTER_TEXT, ERROR_TEXT, LOGIN_TEXT, OR_TEXT, PASSWORD_TEXT, REGISTER_NOW_TEXT, SAMPLE_PASSWORD,
    SAMPLE_USERNAME,
    UNAUTHORIZED_LOGIN_TEXT,
    USERNAME_EMAIL_TEXT
} from "../../constants/Texts";
const FormItem = Form.Item;

class Login extends Component {
    render() {
        const AntWrappedLoginForm = Form.create()(LoginForm)
        return (
            <div className="login-container">
                <h1 className="page-title">Login</h1>
                <div className="login-content">
                    <AntWrappedLoginForm onLogin={this.props.onLogin} />
                </div>
            </div>
        );
    }
}

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();   
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const loginRequest = Object.assign({}, values);
                login(loginRequest)
                .then(response => {
                    localStorage.setItem(ACCESS_TOKEN, response.accessToken);
                    localStorage.setItem(isInstructor, response.roles.map(role => role.name).includes('ROLE_INSTRUCTOR'));
                    localStorage.setItem(isAdmin, response.roles.map(role => role.name).includes('ROLE_ADMIN'));
                    this.props.onLogin();
                }).catch(error => {
                    if(error.status === 401) {
                        notification.error({
                            message: APP_NAME,
                            description: UNAUTHORIZED_LOGIN_TEXT
                        });                    
                    } else {
                        notification.error({
                            message: APP_NAME,
                            description: error.message || ERROR_TEXT
                        });                                            
                    }
                });
            }
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
                <FormItem>
                    {getFieldDecorator('usernameOrEmail', {
                        rules: [{ required: true, message: ENTER_TEXT + USERNAME_EMAIL_TEXT}],
                    })(
                    <Input 
                        prefix={<Icon type="user" />}
                        size="large"
                        name="usernameOrEmail" 
                        placeholder={SAMPLE_USERNAME} />
                    )}
                </FormItem>
                <FormItem>
                {getFieldDecorator('password', {
                    rules: [{ required: true, message: ENTER_TEXT + PASSWORD_TEXT }],
                })(
                    <Input 
                        prefix={<Icon type="lock" />}
                        size="large"
                        name="password" 
                        type="password" 
                        placeholder={SAMPLE_PASSWORD}  />
                )}
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" size="large" className="login-form-button">{LOGIN_TEXT}</Button>
                    {OR_TEXT} <Link to="/signup">{REGISTER_NOW_TEXT}</Link>
                </FormItem>
            </Form>
        );
    }
}


export default Login;