import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, getForum, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, TableCell, FormSelect, renderTable } from 'view/component/AdminPage';

const backUrl = '/user/forum';
class ForumPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backUrl, () => {
            const params = T.routeMatcher('/user/forum/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getForumPage(params._id);
            } else {
                this.props.history.push(backUrl);
            }
        });

        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    render() {
        const { category, page } = this.props.forum || {};
        console.log('category', category);
        return this.renderPage({
            icon: 'fa fa-comments',
            title: category ? `Forum: ${category.title}` : 'Forum',
            breadcrumb: [<Link key={0} to={backUrl}>Forum</Link>, category ? category.title : ''],
            content: 'TODO',
            backRoute: backUrl,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, getForum, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);