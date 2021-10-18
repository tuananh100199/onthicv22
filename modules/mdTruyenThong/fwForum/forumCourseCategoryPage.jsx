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
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:courseId/forum').parse(window.location.pathname),
            courseId = params.courseId;
            if (courseId) {
                this.setState({ courseId },() => this.props.getForumCategories(courseId));
                
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.goBack();
            }
        });
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Forum khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Forum'],
            content: <SectionForumCourseCategory courseId={this.state.courseId} />,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum, course: state.trainning.course });
const mapActionsToProps = { getForumCategories, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);