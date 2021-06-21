import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';

const ForumStates = [{ id: 'approved', text: 'Đã duyệt' }, { id: 'waiting', text: 'Đang chờ duyệt' }, { id: 'reject', text: 'Từ chối' }];
class ForumModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
        this.itemState.value(null);
    }

    onSubmit = () => {
        if (this.props.currentUser && this.props.category) {
            const data = {
                user: this.props.currentUser._id,
                title: this.itemTitle.value(),
                state: this.itemState ? this.itemState.value() : 'waiting',
                category: this.props.category,
            };
            if (data.title == '') {
                T.notify('Tên forum bị trống!', 'danger');
                this.itemTitle.focus();
            } else if (data.state == null) {
                T.notify('Trạng thái forum bị trống!', 'danger');
                this.itemTitle.focus();
            } else {
                this.props.create(data, () => this.hide());
            }
        }
    }

    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Forum mới',
            body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên forum' readOnly={!permission.write} />
                {permission.write ? <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={ForumStates} readOnly={false} /> : null}
            </>,
        });
    }
}

const backUrl = '/user/forum';
class ForumPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backUrl, () => {
            const params = T.routeMatcher('/user/forum/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.setState({ _id: params._id }, () => this.getPage());
            } else {
                this.props.history.push(backUrl);
            }
        });

        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    create = (e) => e.preventDefault() || this.modal.show();

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        console.log(pageNumber, pageSize, pageCondition);
        this.state._id && this.props.getForumPage(this.state._id, pageNumber, pageSize, pageCondition, done);
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('forum');
        const { category, page } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = page ?
            this.props.forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const listForums = list && list.length ? list.map((item, index) => (
            <div key={index} className='tile'>
                <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>
                    <h3 className='tile-title'>{item.title}</h3>
                </Link>
            </div>)) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-comments',
            title: category ? `Forum: ${category.title}` : 'Forum',
            breadcrumb: [<Link key={0} to={backUrl}>Forum</Link>, category ? category.title : ''],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} currentUser={currentUser} category={category._id} permission={permission} create={this.props.createForum} />
            </> : '...',
            backRoute: backUrl,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);