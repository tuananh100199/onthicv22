import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormEditor } from 'view/component/AdminPage';
import { ForumStates, ForumStatesMapper, ForumButtons } from './index';

class ForumModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, state } = item || { title: '', content: '', state: 'waiting' };
        this.itemTitle.value(title);
        this.itemContent.value(content);
        this.itemState && this.itemState.value(state);
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
                T.notify('Tên chủ đề bị trống!', 'danger');
                this.itemTitle.focus();
            } else if (data.content == '') {
                T.notify('Nội dung chủ đề bị trống!', 'danger');
                this.itemContent.focus();
            } else if (this.itemState && data.state == null) {
                T.notify('Trạng thái chủ đề bị trống!', 'danger');
            } else {
                if ((this.itemContent.text() || '').split(' ').length > 200) {
                    T.notify('Nội dung của forum dài hơn 200 từ', 'danger');
                } else {
                    this.state._id ?
                        this.props.update(this.state._id, data, () => this.hide()) :
                        this.props.create(data, (data) => (data && data.item && this.props.history.push('/user/forum/message/' + data.item._id)) || this.hide());
                }
            }
        }
    }

    render = () => {
        const permission = this.props.permission;
        return this.renderModal({
            title: 'Chủ đề', size: 'extra-large',
            body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên' readOnly={false} />
                <FormEditor ref={e => this.itemContent = e} label='Nội dung (200 từ)' readOnly={false} uploadUrl='/user/upload?category=forum' />
                {permission.write ? <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={ForumStates} readOnly={false} /> : null}
            </>,
        });
    }
}

class ForumPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/forum', () => {
            const params = T.routeMatcher('/user/forum/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.setState({ _id: params._id }, () => this.getPage());
            } else {
                this.props.history.goBack();
            }
        });

        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    getPage = (pageNumber, pageSize, searchText, done) => {
        this.state._id && this.props.getForumPage(this.state._id, pageNumber, pageSize, searchText, done);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (item) => T.confirm('Chủ đề', `Bạn có chắc bạn muốn xóa chủ đề '${item.title}'?`, 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id));

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isCourseAdmin } = currentUser;
        const permission = this.getUserPermission('forum');
        const adminPermission = this.getUserPermission('system', ['settings']);
        const { category, page } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const backRoute = '/user/forum';
        const listForums = list && list.length ? list.map((item, index) => (
            <div key={index} className='tile'>
                <div style={{ display: 'inline-flex' }}>
                    <h4 className='tile-title'>
                        <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>{item.title}</Link>&nbsp;&nbsp;
                    </h4>
                    <small style={{ paddingTop: 10 }}>
                        ({item.user ? `${item.user.lastname} ${item.user.firstname}` : ''}
                        {item.modifiedDate ? ' - ' + (new Date(item.modifiedDate).getText()) : ''})&nbsp;&nbsp;
                        {permission.write && isCourseAdmin && item.state && ForumStatesMapper[item.state] ? <b style={{ color: ForumStatesMapper[item.state].color }}>{ForumStatesMapper[item.state].text}</b> : ''}
                    </small>
                </div>
                <ForumButtons state={item.state} permission={{ ...permission, forumOwner: adminPermission.settings, messageOwner: adminPermission.settings }} onChangeState={(state) => this.props.updateForum(item._id, { state })} onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} />

                <div className='tile-body' style={{ marginBottom: 20 }}>
                    <p dangerouslySetInnerHTML={{ __html: item.content }} />
                    {item.messages && item.messages.length ? (
                        <ul>
                            {item.messages.map((message, index) => (
                                <li key={index}>
                                    {message.user ? <p style={{ fontWeight: 'bold' }}>{message.user.lastname} {message.user.fistname} {message.createdDate ? '- ' + new Date(message.createdDate).getText() : ''}</p> : ''}
                                    <p style={{ marginLeft: 12 }}>{message.content}</p>
                                </li>))}
                        </ul>) : ''}
                </div>

                <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none', position: 'absolute', bottom: 0, right: 0, padding: 6, color: 'white', backgroundColor: '#1488db', borderBottomRightRadius: 3 }}>Đọc thêm...</Link>
            </div>)) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-users',
            title: category ? category.title : 'Forum',
            breadcrumb: [<Link key={0} to={backRoute}>Forum</Link>, category ? category.title : ''],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} category={category._id} permission={permission} history={this.props.history}
                    create={this.props.createForum} update={this.props.updateForum} />
            </> : '...',
            onCreate: permission.write && adminPermission.settings ? this.edit : null,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);