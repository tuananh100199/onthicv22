import React from 'react';
import { connect } from 'react-redux';
import { getAllChats } from './redux';
import { AdminPage } from 'view/component/AdminPage';
import './chat.scss';
import SectionChat from './sectionChat';

const previousRoute = '/user';
class AdminAllChat extends AdminPage {
    state = { clientId: null, oldMessage: [], isLoadingAll: true };
    componentDidMount() {
        const courseId = this.props.courseId,
            user = this.props.system.user;
        this.setState({ courseId, user });
        if (courseId) {
            this.props.getAllChats(courseId, null, data => {
                this.setState({
                    oldMessage: data.chats,
                    isLoadingAll: false
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
export default connect(mapStateToProps, mapActionsToProps)(AdminAllChat);
