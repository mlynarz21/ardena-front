import React, { Component } from 'react';
import {
    Link,
    withRouter
} from 'react-router-dom';
import './AppHeader.css';
import userIcon from '../user.svg';
import homeIcon from '../home.svg';
import horseIcon from '../horse.svg';
import adminIcon from '../admin.svg';
import scheduleIcon from '../schedule.svg';
import myRidesIcon from '../myRides.svg';
import { Layout, Menu, Dropdown} from 'antd';
import {isAdmin, isInstructor} from "../constants";
import {APP_NAME, LOGIN_TEXT, LOGOUT_TEXT, PROFILE_TEXT, SIGNUP_TEXT} from "../constants/Texts";
const Header = Layout.Header;
    
class AppHeader extends Component {
    constructor(props) {
        super(props);
        this.handleMenuClick = this.handleMenuClick.bind(this);
    }

    handleMenuClick({key}) {
        if (key === "logout") {
            this.props.onLogout();
        }
    }

    render() {
        let menuItems;
        let adminItems;
        if (this.props.currentUser) {
            if (localStorage.getItem(isInstructor)==='true') {
                menuItems = [
                    <Menu.Item key="/">
                        <Link to="/">
                            <img src={homeIcon} alt="home" className="home-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/lessons">
                        <Link to="/lessons">
                            <img src={myRidesIcon} alt="myRides" className="myRides-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/schedule">
                        <Link to="/schedule">
                            <img src={scheduleIcon} alt="schedule" className="schedule-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/horses">
                        <Link to="/horses">
                            <img src={horseIcon} alt="horse" className="horse-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/profile" className="profile-menu">
                        <ProfileDropdownMenu
                            currentUser={this.props.currentUser}
                            handleMenuClick={this.handleMenuClick}/>
                    </Menu.Item>
                ];
            } else {
                menuItems = [
                    <Menu.Item key="/">
                        <Link to="/">
                            <img src={homeIcon} alt="home" className="home-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/lessons">
                        <Link to="/lessons">
                            <img src={myRidesIcon} alt="myRides" className="myRides-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/profile" className="profile-menu">
                        <ProfileDropdownMenu
                            currentUser={this.props.currentUser}
                            handleMenuClick={this.handleMenuClick}/>
                    </Menu.Item>
                ];
            }
            if (localStorage.getItem(isAdmin)==='true') {
                menuItems.splice(menuItems.length-1, 1);

                adminItems = [
                    <Menu.Item key="/admin">
                        <Link to="/admin">
                            <img src={adminIcon} alt="admin" className="admin-icon"/>
                        </Link>
                    </Menu.Item>,
                    <Menu.Item key="/profile" className="profile-menu">
                        <ProfileDropdownMenu
                            currentUser={this.props.currentUser}
                            handleMenuClick={this.handleMenuClick}/>
                    </Menu.Item>
                ];
                menuItems = [...menuItems, ...adminItems]
            }
        } else {
            menuItems = [
                <Menu.Item key="/login">
                    <Link to="/login">{LOGIN_TEXT}</Link>
                </Menu.Item>,
                <Menu.Item key="/signup">
                    <Link to="/signup">{SIGNUP_TEXT}</Link>
                </Menu.Item>
            ];
        }

        return (
            <Header className="app-header">
                <div className="container">
                    <div className="app-title">
                        <Link to="/">{APP_NAME}</Link>
                    </div>
                    <Menu
                        className="app-menu"
                        mode="horizontal"
                        selectedKeys={[this.props.location.pathname]}
                        style={{lineHeight: '64px'}}>
                        {menuItems}
                    </Menu>
                </div>
            </Header>
        );
    }
}

function ProfileDropdownMenu(props) {
    const dropdownMenu = (
        <Menu onClick={props.handleMenuClick} className="profile-dropdown-menu">
            <Menu.Item key="user-info" className="dropdown-item" disabled>
                <div className="user-full-name-info">
                    {props.currentUser.name}
                </div>
                <div className="username-info">
                    @{props.currentUser.username}
                </div>
            </Menu.Item>
            <Menu.Divider/>
            <Menu.Item key="profile" className="dropdown-item">
                <Link to={`/users/${props.currentUser.username}`}>{PROFILE_TEXT}</Link>
            </Menu.Item>
            <Menu.Item key="logout" className="dropdown-item">
                {LOGOUT_TEXT}
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown
            overlay={dropdownMenu}
            trigger={['click']}
            getPopupContainer={() => document.getElementsByClassName('profile-menu')[0]}>
            <a className="ant-dropdown-link">
                <img src={userIcon} alt="user" className="user-icon"/>
            </a>
        </Dropdown>
    );
}


export default withRouter(AppHeader);