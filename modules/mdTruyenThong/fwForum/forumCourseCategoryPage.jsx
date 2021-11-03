import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
import { getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import SectionForumCourseCategory from './SectionForumCourseCategory';

class ForumCategoryPage extends AdminPage {
    state = {};
    componentDidMount() {
        const params = T.routeMatcher('/user/course/:courseId/forum').parse(window.location.pathname),
        courseId = params.courseId;
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user,
            admin = isLecturer || isCourseAdmin;
         T.ready(admin ? '/user/course': `/user/hoc-vien/khoa-hoc/${courseId}`, () => { 
            if (courseId) {
                this.setState({ courseId, admin },() => this.props.getForumCategories(courseId));
                if(admin){
                    const course = this.props.course ? this.props.course.item : null;
                    if (!course) {
                        this.props.getCourse(params._id, data => {
                            if (data.error) {
                                T.notify('Lấy khóa học bị lỗi!', 'danger');
                                this.props.history.push('/user/course/' + params._id);
                            }
                        });
                    }
                }
            } else {
                this.props.history.goBack();
            }
        });
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${this.state.courseId}`,
        userBackRoute = `/user/hoc-vien/khoa-hoc/${this.state.courseId}`;

        return this.renderPage({
            icon: 'fa fa-users',
            title: `Forum khóa học: ${item.name ? item.name : ''}`,
            breadcrumb: this.state.admin ? [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Danh mục'] : [<Link key={0} to={userBackRoute}>Khóa học của tôi</Link>, 'Forum'],
            content: <SectionForumCourseCategory courseId={this.state.courseId} />,
            backRoute: this.state.admin ? backRoute : userBackRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum, course: state.trainning.course });
const mapActionsToProps = { getForumCategories, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);