import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackDetailSection';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class AdminFeedbackSystemDetailPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/feedback/:_feedbackId').parse(window.location.pathname);
            if (params && params._feedbackId && params._id) {
                this.setState({_feedbackId: params._feedbackId });
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push(`/user/course/${params._id}/feedback`);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course');
            }
        });
    }

    render() {
        const permission = this.getUserPermission('feedback');
        const item = this.props.course && this.props.course.item || {};
        const backRoute = `/user/course/${item._id}/feedback`;
        const { _feedbackId } = this.state;
        return this.renderPage({
            icon: 'fa fa-heartbeat',
            title: 'Phản hồi chi tiết: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={1} to={`/user/course/${item._id}`}>{item.name}</Link> : '',
            _feedbackId ? <Link key={2} to={backRoute}>Phản hồi</Link>:'' ,'Phản hồi chi tiết'],
            content: _feedbackId && <FeedbackSection permission={permission} _id={_feedbackId} />,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackSystemDetailPage);
