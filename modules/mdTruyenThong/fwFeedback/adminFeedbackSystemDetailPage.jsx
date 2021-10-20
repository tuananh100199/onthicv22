import React from 'react';
import { connect } from 'react-redux';
import FeedbackSection from './FeedbackDetailSection';
import { AdminPage } from 'view/component/AdminPage';

const backRoute = '/user/feedback/system';
class AdminFeedbackSystemDetailPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backRoute, () => {
            const params = T.routeMatcher(`${backRoute}/:_id`).parse(window.location.pathname);
            if (params && params._id) {
                this.setState({ _id: params._id });
                // this.props.getFeedback(params._id, data => {
                //     if (data.error) {
                //         T.notify('Lấy phản hồi bị lỗi!', 'danger');
                //         this.props.history.push(backRoute);
                //     }
                // });
            } else {
                this.props.history.push(backRoute);
            }
        });
    }

    render() {
        const { _id } = this.state;
        return this.renderPage({
            icon: 'fa fa-comments-o',
            title: 'Phản hồi chi tiết',
            breadcrumb: ['Phản hồi chi tiết'],
            content: _id && <FeedbackSection _id={_id} />,
        });
    }
}

const mapStateToProps = () => ({});
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(AdminFeedbackSystemDetailPage);
