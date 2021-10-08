import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
// import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import SectionForumCategory from './SectionForumCategory';

class ForumCategoryPage extends AdminPage {
    state = {};
    componentDidMount() {

        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:course/forum'),
            params = route.parse(window.location.pathname);
        if (params && params.course) {
            T.ready('/user/hoc-vien/khoa-hoc/' + params.course);
            this.setState({ course: params.course });
        } else {
            this.props.history.goBack();
        }
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-comments',
            title: 'Forum',
            breadcrumb: ['Forum'],
            content: this.state.course ? <SectionForumCategory course={this.state.course} /> : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);