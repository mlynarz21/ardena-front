import React, { Component } from 'react';
import './NotFound.css';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import {BACK_TEXT, NOT_FOUND_TEXT} from "../constants/Texts";

class NotFound extends Component {
    render() {
        return (
            <div className="page-not-found">
                <h1 className="title">
                    404
                </h1>
                <div className="desc">
                    {NOT_FOUND_TEXT}
                </div>
                <Link to="/"><Button className="go-back-btn" type="primary" size="large">{BACK_TEXT}</Button></Link>
            </div>
        );
    }
}

export default NotFound;