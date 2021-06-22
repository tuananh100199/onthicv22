import React from 'react';
import { connect } from 'react-redux';
import { getForum, getForumMessagePage, createForumMessage, updateForumMessage, deleteForumMessage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { ForumStates, ForumStatesMapper } from './index';

class MessageModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemContent.focus()));
    }

    onShow = (item) => {
        const { _id, content, state } = item || { content: '', state: 'waiting' };
        this.itemContent.value(content);
        this.itemState.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        if (this.props.forum) {
            const data = {
                content: this.itemContent.value(),
                state: this.itemState ? this.itemState.value() : 'waiting',
                forum: this.props.forum,
            };
            console.log(data);
            if (data.content == '') {
                T.notify('Nội dung bài viết bị trống!', 'danger');
                this.itemContent.focus();
            } else if (this.itemState && data.state == null) {
                T.notify('Trạng thái bài viết bị trống!', 'danger');
            } else {
                if (data.content.length > 200) data.content = data.content.substring(0, 200);
                this.state._id ?
                    this.props.update(this.state._id, data, () => this.hide()) :
                    this.props.create(data, () => this.hide());
            }
        }
    }

    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Bài viết',
            body: <>
                <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung (200 từ)' readOnly={!permission.write} />
                {permission.write ? <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={ForumStates} readOnly={false} /> : null}
            </>,
        });
    }
}

class ForumMessagePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/forum', () => {
            const params = T.routeMatcher('/user/forum/message/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.setState({ _id: params._id }, () => this.props.getForum(params._id) || this.getPage());
            } else {
                this.props.history.push('/user/forum');
            }
        });

        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        if (this.state._id) {
            this.props.getForumMessagePage(this.state._id, pageNumber, pageSize, pageCondition, done);
        }
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForumMessage(item._id));

    render() {
        const permission = this.getUserPermission('forum');
        const createdDateStyle = { textDecoration: 'none', position: 'absolute', top: 0, right: 0, padding: 6, color: 'white', borderTopRightRadius: 3 };
        const { item: forum } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = forum && forum.page ? forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const listMessages = list && list.length ? list.map((item, index) => (
            <div key={index} className='tile'>
                <div className='tile-body'>
                    <p style={{ margin: '12px 0 0 0' }}>{item.content}</p>
                    <small className='bg-secondary' style={{ ...createdDateStyle, paddingRight: permission.write ? 92 : 0 }}>
                        {item.user ? item.user.firstname + ' ' + item.user.lastname : ''} -
                        {item.createdDate ? new Date(forum.createdDate).getText() : ''}&nbsp;&nbsp;
                        {permission.write && item.state && ForumStatesMapper[item.state] ? <b style={{ color: ForumStatesMapper[item.state].color }}>{ForumStatesMapper[item.state].text}</b> : ''}
                    </small>

                    {permission.write ?
                        <div className='btn-group btn-group-sm' style={{ position: 'absolute', right: 12, top: -12 }}>
                            <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}><i className='fa fa-lg fa-edit' /></a>
                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>
                        </div> : null}
                </div>
            </div>)) : <div className='tile'>Chưa có bài viết!</div>;

        const backRoute = forum && forum.category ? '/user/forum/' + forum.category._id : null;
        return this.renderPage({
            icon: 'fa fa-comments',
            title: forum ? <>{forum.title} <small style={{ fontSize: 13 }}>({forum.user ? `${forum.user.lastname} ${forum.user.firstname}` : ''} {forum.modifiedDate ? ' - ' + (new Date(forum.modifiedDate).getText()) : ''})</small></> : '...',
            breadcrumb1: ['Forum'],
            breadcrumb: [<Link key={0} to='/user/forum'>Forum</Link>, forum && forum.category ? <Link key={1} to={backRoute}>{forum.category.title}</Link> : '', forum ? forum.title : '...'],
            content: forum ? <>
                <div className='tile'>
                    <h4 style={{ marginTop: 8 }}>{forum.content}</h4>
                    <small className='bg-secondary' style={createdDateStyle}>{forum.createdDate ? new Date(forum.createdDate).getText() : ''}</small>
                </div>

                {listMessages}
                <Pagination name='pageForumMessage' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <MessageModal ref={e => this.modal = e} forum={forum._id} permission={permission} create={this.props.createForumMessage} update={this.props.updateForumMessage} getPage={this.getPage} />
            </> : '...',
            backRoute,
            onCreate: this.edit,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForum, getForumMessagePage, createForumMessage, updateForumMessage, deleteForumMessage };
export default connect(mapStateToProps, mapActionsToProps)(ForumMessagePage);