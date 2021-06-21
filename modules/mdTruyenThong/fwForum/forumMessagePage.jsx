import React from 'react';
import { connect } from 'react-redux';
import { getForumCategories } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class ForumMessagePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
    }

    render() {
        const permission = this.getUserPermission('forum');

        return this.renderPage({
            icon: 'fa fa-comments',
            title: 'Forum',
            breadcrumb: ['Forum'],
            content: 'TODO',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumCategories };
export default connect(mapStateToProps, mapActionsToProps)(ForumMessagePage);