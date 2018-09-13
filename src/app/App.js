import React, { Component } from 'react';
import './App.css';
import {
  Route,
  withRouter,
  Switch
} from 'react-router-dom';

import { getCurrentUser } from '../util/APIUtils';
import {isInstructor, ACCESS_TOKEN, isAdmin} from '../constants';

import EventList from '../event/EventList';
import NewEvent from '../event/NewEvent';
import Login from '../user/login/Login';
import Signup from '../user/signup/Signup';
import Profile from '../user/profile/Profile';
import AppHeader from '../common/AppHeader';
import NotFound from '../common/NotFound';
import LoadingIndicator from '../common/LoadingIndicator';
import PrivateRoute from '../common/PrivateRoute';
import HorseList from '../horse/HorseList';
import LessonList from '../lesson/LessonList/LessonList';

import { Layout, notification } from 'antd';
import Schedule from "../lesson/Schedule/Schedule";
import Lesson from "../lesson/Lesson";
import Admin from "../admin/Admin";
import {APP_NAME, LOGIN_NOTIFICATION_TEXT, LOGOUT_NOTIFICATION_TEXT} from "../constants/Texts";
const { Content } = Layout;

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            isInstructor: false,
            isAdmin: false
        };
        this.handleLogout = this.handleLogout.bind(this);
        this.loadCurrentUser = this.loadCurrentUser.bind(this);
        this.handleLogin = this.handleLogin.bind(this);

        notification.config({
            placement: 'topRight',
            top: 70,
            duration: 3,
        });
    }

    loadCurrentUser() {
        this.setState({
            isLoading: true
        });
        getCurrentUser()
            .then(response => {
                this.setState({
                    currentUser: response,
                    isAuthenticated: true,
                    isLoading: false,
                    isInstructor: localStorage.getItem(isInstructor)==='true',
                    isAdmin: localStorage.getItem(isAdmin)==='true'
                });
            }).catch(error => {
            this.setState({
                isLoading: false
            });
        });
    }

    componentWillMount() {
        this.loadCurrentUser();
    }

    handleLogout(redirectTo = "/", notificationType = "success", description = LOGOUT_NOTIFICATION_TEXT) {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(isInstructor);
        localStorage.removeItem(isAdmin);

        this.setState({
            currentUser: null,
            isAuthenticated: false,
            isInstructor : false,
            isAdmin : false
        });

        this.props.history.push(redirectTo);

        notification[notificationType]({
            message: APP_NAME,
            description: description,
        });
    }

    handleLogin() {
        notification.success({
            message: APP_NAME,
            description: LOGIN_NOTIFICATION_TEXT,
        });
        this.loadCurrentUser();
        this.props.history.push("/");
    }

    render() {
        if (this.state.isLoading) {
            return <LoadingIndicator/>
        }
        return (
            <Layout className="app-container">
                <AppHeader isAuthenticated={this.state.isAuthenticated}
                           currentUser={this.state.currentUser}
                           onLogout={this.handleLogout}/>

                <Content className="app-content">
                    <div className="container">
                        <Switch>
                            <Route exact path="/"
                                   render={(props) => <EventList isAuthenticated={this.state.isAuthenticated}
                                                                currentUser={this.state.currentUser}
                                                                handleLogout={this.handleLogout} {...props} />}>
                            </Route>
                            <PrivateRoute
                                authenticated={this.state.isInstructor}
                                path="/horses"
                                component={HorseList}>
                            </PrivateRoute>
                            <PrivateRoute
                                authenticated={this.state.isAdmin}
                                path="/admin"
                                component={Admin}>
                            </PrivateRoute>
                            <PrivateRoute
                                authenticated={this.state.isAuthenticated}
                                path="/lessons/:lessonId"
                                component={Lesson}>
                            </PrivateRoute>
                            <PrivateRoute
                                authenticated={this.state.isAuthenticated}
                                path="/lessons"
                                component={LessonList}>
                            </PrivateRoute>
                            <PrivateRoute
                                authenticated={this.state.isInstructor}
                                path="/schedule"
                                component={Schedule}>
                            </PrivateRoute>

                            <Route path="/login"
                                   render={(props) => <Login onLogin={this.handleLogin} {...props} />}>
                            </Route>

                            <Route path="/signup" component={Signup}>
                            </Route>

                            <Route path="/users/:username"
                                   render={(props) => <Profile
                                       isAuthenticated={this.state.isAuthenticated}
                                       currentUser={this.state.currentUser} {...props}
                                   />}>
                            </Route>
                            <PrivateRoute
                                authenticated={this.state.isAuthenticated}
                                path="/event/new"
                                component={NewEvent}
                                handleLogout={this.handleLogout}>
                            </PrivateRoute>
                            <Route
                                component={NotFound}>
                            </Route>
                        </Switch>
                    </div>
                </Content>
            </Layout>
        );
    }
}

export default withRouter(App);
