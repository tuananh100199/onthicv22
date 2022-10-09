import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import FeedbackSection from 'modules/mdTruyenThong/fwFeedback/FeedbackUserSection';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class UserCourseFeedback extends AdminPage {
    state = { type: 'course' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/phan-hoi'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        this.props.history.goBack();
                    } else {
                        const course = data.item.active && data.item;
                        if (data.teacher) {
                            this.setState({ teacher: data.teacher });
                            this.course.value(true);
                        }
                        this.setState({ name: course.name });
                    }
                });
            });
        } else {
            this.props.history.goBack();
        }
    }

    onChange = (value, type) => {
        if (value) {
            this.setState({ type });
            if (this['teacher']) this[type == 'course' ? 'teacher' : 'course'].value(false);
        }
    }
    render() {
        const { name, courseId, teacher, type } = this.state, backRoute = '/user/hoc-vien/khoa-hoc/' + courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Phản hồi khóa học: ' + name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học của tôi</Link>, 'Phản hồi khóa học'],
            content: <>
                {teacher && <div className='tile' style={{ display: 'flex' }}>
                    <FormCheckbox ref={e => this.course = e} onChange={value => this.onChange(value, 'course')} label='Phản hồi khóa học' />
                    &nbsp; &nbsp;
                    <FormCheckbox ref={e => this.teacher = e} onChange={value => this.onChange(value, 'teacher')} label={`Phản hồi giáo viên ${teacher.lastname} ${teacher.firstname}`} />
                </div>}
                {courseId && <FeedbackSection type={type} _refId={courseId} title={type == 'teacher' ? 'giáo viên' : 'khóa học'} />}
            </>,
            onBack: () => this.props.history.goBack(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseFeedback);
