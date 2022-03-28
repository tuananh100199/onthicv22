import React from 'react';
import { connect } from 'react-redux';
import { getCourse} from '../redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackLecturerSection';
import { AdminPage } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class LecturerCourseFeedback extends AdminPage {
    state = { type: 'course' };
    componentDidMount() {
        const route = T.routeMatcher('/user/course/:_id/feedback-lecturer'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/course', () => {
                this.props.getCourse(_id, data => {
                    if (data.error) {
                        this.props.history.goBack();
                    } else {
                        const course = data.item.active && data.item;
                        this.setState({ name: course.name });
                    }
                });
            });
        } else {
            this.props.history.goBack();
        }
    }

    // onChange = (value, type) => {
    //     if (value) {
    //         this.setState({ type });
    //         if (this['teacher']) this[type == 'course' ? 'teacher' : 'course'].value(false);
    //     }
    // }
    render() {
        const { name, courseId, type } = this.state;
        const userPageLink = '/user/course/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Phản hồi khóa học: ' + name,
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Phản hồi khóa học'],
            content: <>
                {courseId && <FeedbackSection type={type} _refId={courseId} title={'khóa học'} />}
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerCourseFeedback);
