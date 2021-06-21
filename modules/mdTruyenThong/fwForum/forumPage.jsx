import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormSelect } from 'view/component/AdminPage';

const ForumStates = [{ id: 'approved', text: 'Đã duyệt' }, { id: 'waiting', text: 'Đang chờ duyệt' }, { id: 'reject', text: 'Từ chối' }];
class ForumModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, state } = item || { title: '', state: 'waiting' };
        this.itemTitle.value(title);
        this.itemState.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        if (this.props.category) {
            const data = {
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
                this.state._id ?
                    this.props.update(this.state._id, data, () => this.hide()) :
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

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        console.log(pageNumber, pageSize, pageCondition);
        this.state._id && this.props.getForumPage(this.state._id, pageNumber, pageSize, pageCondition, done);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Forum', 'Bạn có chắc bạn muốn xóa forum này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id));

    render() {
        const permission = this.getUserPermission('forum');
        const { category, page } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = page ?
            this.props.forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const listForums = list && list.length ? list.map((item, index) => (
            <div key={index} className='tile'>
                <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>
                    <h3 className='tile-title'>{item.title}</h3>
                </Link>
                {permission.write ?
                    <div className='btn-group btn-group-sm' style={{ position: 'absolute', right: 12, top: -12 }}>
                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}><i className='fa fa-lg fa-edit' /></a>
                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>
                    </div> : null}
            </div>)) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-comments',
            title: category ? `Forum: ${category.title}` : 'Forum',
            breadcrumb: [<Link key={0} to={backUrl}>Forum</Link>, category ? category.title : ''],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} category={category._id} permission={permission}
                    create={this.props.createForum} update={this.props.updateForum} />
            </> : '...',
            backRoute: backUrl,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);