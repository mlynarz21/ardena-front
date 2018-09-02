import React, { Component } from 'react';
import './Lesson.css';
import { Popconfirm, Table, Tabs} from 'antd';
import LoadingIndicator  from '../common/LoadingIndicator';
import NotFound from '../common/NotFound';
import ServerError from '../common/ServerError';
import {getLesson} from "../util/APIUtils";

const TabPane = Tabs.TabPane;

class Lesson extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            lesson : null
        }
    }

    componentDidMount() {
        const lessonId = this.props.match.params.lessonId;
        this.loadLesson(lessonId);
    }

    loadLesson(lessonId) {
        getLesson(lessonId).then(response => {
            this.setState(
                {
                    isLoading: false,
                    lesson: response
                }
            )
        })
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

        const reservationColumns = [{
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            width: '25%'
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '25%'
        },{
            title: 'Rider Name',
            dataIndex: 'rider.name',
            key: 'rider',
            width: '25%'
        },{
            title: 'Horse',
            dataIndex: 'horse',
            key: 'horse',
            width: '15%'
        }, {
            title: 'Action',
            key: 'action',
            width: '10%',
            render: (text, record) => (
                <Popconfirm placement="left" title={record.rider.username}
                            okText="Yes" cancelText="No">
                    <a>Reserve</a>
                </Popconfirm>)
        }];

        return (
            <div className="lesson-container">

                <Table className="reservations-table"
                       dataSource={this.state.lesson.reservations}
                       columns={reservationColumns}
                       rowKey='id'
                       rowClassName="lesson-row"
                    // scroll={{ x: '100%', y: '100%' }}
                    // pagination={false}
                />

            </div>);
    }
}

export default Lesson;