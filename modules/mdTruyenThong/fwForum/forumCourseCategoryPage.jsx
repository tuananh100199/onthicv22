import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
// import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import SectionForumCourseCategory from './SectionForumCourseCategory';

class ForumCategoryPage extends AdminPage {
    state = {};
    componentDidMount() {
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/forum').parse(window.location.pathname),
        courseId = params.courseId;
        if (courseId) {
            T.ready('/user/hoc-vien/khoa-hoc/' + courseId); // TODO
            this.setState({ courseId });
        } else {
            this.props.history.goBack();
        }
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Forum khóa học',
            breadcrumb: ['Forum khóa học'],
            content: <SectionForumCourseCategory courseId={this.state.courseId} />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);