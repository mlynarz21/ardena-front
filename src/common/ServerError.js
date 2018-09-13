import React, { Component } from 'react';
import './ServerError.css';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import {BACK_TEXT, SERVER_ERROR_TEXT} from "../constants/Texts";

class NotFound extends Component {
    render() {
        return (
            <div className="server-error-page">
                <h1 className="server-error-title">
                    500
                </h1>
                <div className="server-error-desc">
                    {SERVER_ERROR_TEXT}
                </div>
                <Link to="/"><Button className="server-error-go-back-btn" type="primary" size="large">{BACK_TEXT}</Button></Link>
            </div>
        );
    }
}

export default NotFound;