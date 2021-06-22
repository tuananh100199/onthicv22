import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';

const ForumStates = [{ id: 'approved', text: 'Đã duyệt' }, { id: 'waiting', text: 'Đang chờ duyệt' }, { id: 'reject', text: 'Từ chối' }];
class ForumModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, state } = item || { title: '', content: '', state: 'waiting' };
        this.itemTitle.value(title);
        this.itemContent.value(content);
        this.itemState.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        if (this.props.category) {
            const data = {
                title: this.itemTitle.value(),
                content: this.itemContent.value(),
                state: this.itemState ? this.itemState.value() : 'waiting',
                category: this.props.category,
            };
            if (data.title == '') {
                T.notify('Tên forum bị trống!', 'danger');
                this.itemTitle.focus();
            } else if (data.content == '') {
                T.notify('Nội dung forum bị trống!', 'danger');
                this.itemContent.focus();
            } else if (data.state == null) {
                T.notify('Trạng thái forum bị trống!', 'danger');
            } else {
                if (data.conent.length > 200) data.conent = data.conent.substring(0, 200);
                this.state._id ?
                    this.props.update(this.state._id, data, (data) => (data && data.item && this.props.history.push('/user/forum/message/' + data.item._id)) || this.hide()) :
                    this.props.create(data, (data) => (data && data.item && this.props.history.push('/user/forum/message/' + data.item._id)) || this.hide());
            }
        }
    }

    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Forum mới',
            body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên' readOnly={!permission.write} />
                <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung (200 từ)' readOnly={!permission.write} />
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
        const listForums = list && list.length ? list.map((item, index) => {
            return (
                <div key={index} className='tile'>
                    <div style={{ display: 'inline-flex' }}>
                        <h4 className='tile-title'>
                            <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>{item.title}</Link>&nbsp;&nbsp;
                        </h4>
                        <small style={{ paddingTop: 10 }}>
                            ({item.user ? `${item.user.lastname} ${item.user.firstname}` : ''}
                            {item.modifiedDate ? ' - ' + (new Date(item.modifiedDate).getText()) : ''})
                        </small>
                    </div>
                    {permission.write ?
                        <div className='btn-group btn-group-sm' style={{ position: 'absolute', right: 12, top: -12 }}>
                            <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}><i className='fa fa-lg fa-edit' /></a>
                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>
                        </div> : null}

                    <div className='tile-body' style={{ marginBottom: 20 }}>
                        <h5 style={{ fontWeight: 'normal' }}>{item.content}</h5>
                        {item.messages && item.messages.length ? (
                            <ul>
                                {item.messages.map((message, index) => (
                                    <li key={index}>
                                        {message.user ? <p style={{ fontWeight: 'bold' }}>{message.user.lastname} {message.user.fistname} {message.createdDate ? '- ' + new Date(message.createdDate).getText() : ''}</p> : ''}
                                        <p style={{ marginLeft: 12 }}>{message.content}</p>
                                    </li>))}
                            </ul>) : ''}
                    </div>

                    {/* <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>Đọc thêm...</Link>
                    </div> */}
                    <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none', position: 'absolute', bottom: 0, right: 0, padding: 6, color: 'white', backgroundColor: '#1488db', borderBottomRightRadius: 3 }}>Đọc thêm...</Link>
                </div>);
        }) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-comments',
            title: category ? `Forum: ${category.title}` : 'Forum',
            breadcrumb: [<Link key={0} to={backUrl}>Forum</Link>, category ? category.title : ''],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} category={category._id} permission={permission} history={this.props.history}
                    create={this.props.createForum} update={this.props.updateForum} />
            </> : '...',
            backRoute: backUrl,
            onCreate: this.edit,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);