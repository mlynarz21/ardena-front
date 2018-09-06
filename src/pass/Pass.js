import React, { Component } from 'react';
import './Pass.css';
import HorseStamp from "./HorseStamp";
import horseStamp from '../horseStamp.svg';
import {getPass} from "../util/APIUtils";
import LoadingIndicator from "../common/LoadingIndicator";
import NotFound from "../common/NotFound";
import ServerError from "../common/ServerError";
import {formatDateTime} from "../util/Helpers";
import {notification} from "antd/lib/index";

class Pass extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            pass: null
        }
    }

    componentDidMount() {
        this.loadPass();
    }

    loadPass() {
        getPass().then(response => {
            this.setState(
                {
                    isLoading: false,
                    pass: response
                }
            )
        }).catch(() => {
            this.setState(
                {
                    isLoading: false,
                }
            )
        });
    }

    render() {
        if (this.state.isLoading) {
            return <LoadingIndicator/>;
        }

        if (this.state.notFound) {
            return <NotFound/>;
        }

        if (this.state.serverError) {
            return <ServerError/>;
        }

        if (this.state.pass===null) {
            return (
                <div className="no-pass-found">
                    <span>No valid passes found</span>
                </div>);
        }

        return (
            <div className="pass-container">
                <div className="pass-content">
                    <div className="pass-header">
                        <span className="pass-expiry-date">
                                {"Valid until " + formatDateTime(this.state.pass.expirationDate)}
                         </span>
                    </div>
                    <div className="stamp-container">
                        {Array.from(new Array(this.state.pass.noOfRidesPermitted), (stamp, i) => i < this.state.pass.usedRides ? (
                            <HorseStamp horseStamp={horseStamp} ></HorseStamp>) : (<HorseStamp></HorseStamp>))}
                    </div>
                </div>
            </div>
        )
    }
}


export default Pass;