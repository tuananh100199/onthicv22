import React from 'react';
import { connect } from 'react-redux';
import { getAllChats } from './redux';
// import { debounce } from 'lodash';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import T from 'view/js/common';
import SectionChat from './sectionChat';

const previousRoute = '/user';
class UserAllChat extends AdminPage {
    state = { clientId: null, oldMessage: [], isLoadingAll: true };
    componentDidMount() {
        const route = T.routeMatcher('/user/chat/:_id'),
            courseId = route.parse(window.location.pathname)._id,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            T.ready('/user/hoc-vien/khoa-hoc/' + courseId, () => {
                this.props.getAllChats(courseId, null, data => {
                    this.setState({ oldMessage: data.chats.sort(() => -1), isLoadingAll: false });
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const { isLoadingAll, oldMessage, courseId } = this.state;
        return (
            !isLoadingAll && <SectionChat oldMessageAll={oldMessage} courseId={courseId}></SectionChat>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllChats };
export default connect(mapStateToProps, mapActionsToProps)(UserAllChat);