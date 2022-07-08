import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
// import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import SectionForumCategory from './SectionForumCategory';

class ForumCategoryPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        this.props.getForumCategories(null);
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Diễn đàn',
            breadcrumb: ['Diễn đàn'],
            content: <SectionForumCategory />,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);