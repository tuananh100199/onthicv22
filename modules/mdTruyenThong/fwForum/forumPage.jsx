import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormEditor, FormCheckbox } from 'view/component/AdminPage';
import { ForumStates, ForumStatesMapper, ForumButtons } from './index';
const dataFilterType = [
    { id: 0, text: 'Tất cả', condition: {} },
    { id: 1, text: 'Đang chờ duyệt', condition: { state: 'waiting' } }
];
class ForumModal extends AdminModal {
    state = {isVideo:false};
    componentDidMount() {
        $(this.modal).modal({ backdrop: 'static', keyboard: false, show: false });
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, state,video } = item || { title: '', content: '', state: 'waiting',video:{} };
        this.itemTitle.value(title);
        this.itemContent.value(content);
        this.itemState && this.itemState.value(state);
        this.itemActiveVideo.value(video.active||false);
        this.itemLinkVideo.value(video.link||'');
        this.setState({ _id,isVideo:video.active });
    }

    onSubmit = () => {
        if (this.props.category) {
            const data = {
                title: this.itemTitle.value(),
                content: this.itemContent.value(),
                state: this.itemState ? this.itemState.value() : 'waiting',
                category: this.props.category,
                video:{
                    active:this.itemActiveVideo.value() ?1:0,
                    link:this.itemLinkVideo.value(),
                }
            };
            if (data.title == '') {
                T.notify('Tên chủ đề bị trống!', 'danger');
                this.itemTitle.focus();
            } else if (data.content == '') {
                T.notify('Nội dung chủ đề bị trống!', 'danger');
                this.itemContent.focus();
            } else if (this.itemState && data.state == null) {
                T.notify('Trạng thái chủ đề bị trống!', 'danger');
            } else if ( data.video.active && data.video.link=='') {
                T.notify('Link video bị trống!', 'danger');
                this.itemLinkVideo.focus();
            } else {
                if ((this.itemContent.text() || '').split(' ').length > 200) {
                    T.notify('Nội dung của forum dài hơn 200 từ', 'danger');
                } else {
                    if (this.state._id) {
                        if (this.props.forumCreator) {
                            this.props.update(this.state._id, data, { filterType: this.state.filterType && this.state.filterType.condition }, () => this.hide());
                        } else {
                            this.props.update(this.state._id, data, { filterType: this.state.filterType && this.state.filterType.condition }, () => {
                                this.hide();
                                T.alert('Bạn vui lòng chờ Quản trị viên duyệt thay đổi thông tin forum của bạn. Cảm ơn', 'success', false);
                            });
                        }
                    } else {
                        if (this.props.forumCreator) {
                            this.props.create(data, (data) => (data && data.item && this.props.history.push(`/user/forum/message/${data.item._id}`)) || this.hide());
                        } else {
                            this.props.create(data, () => {
                                T.alert('Bạn vui lòng chờ Quản trị viên duyệt forum mới của bạn. Cảm ơn', 'success', false) || this.hide();
                            });
                        }
                    }
                }
            }
        }
    }

    render = () => {
        const forumCreator = this.props.forumCreator;
        return this.renderModal({
            title: 'Chủ đề', size: 'extra-large',
            body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên' readOnly={false} />
                <FormEditor ref={e => this.itemContent = e} label='Nội dung (200 từ)' readOnly={false} uploadUrl='/user/upload?category=forum' />
                {forumCreator ? <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={ForumStates} readOnly={false} /> : null}
                <div className="row">
                    <FormCheckbox ref={e => this.itemActiveVideo = e} className='col-md-2' label='Thêm video' readOnly={false} onChange={isVideo=>this.setState({isVideo})}/>
                    <div className="col-md-10" style={{display:this.state.isVideo?'block':'none'}}>
                        <FormTextBox ref={e => this.itemLinkVideo = e} label='Link video' readOnly={false} />
                    </div>
                </div>
            </>,
        });
    }
}

class ForumPage extends AdminPage {
    state = {};
    componentDidMount() {
        const user = this.props.system ? this.props.system.user : null,
            { _id, isLecturer, isTrustLecturer, isCourseAdmin } = user;
        T.ready('/user/forum', () => {
            const params = T.routeMatcher('/user/forum/:_id').parse(window.location.pathname),
            forumCategoryId = params._id;
            if (params && params._id) {
                this.setState({ userId: _id, isLecturer, isTrustLecturer, isCourseAdmin, forumCategoryId }, () => this.getPage() || this.filterType && this.filterType.value(0));
            } else {
                this.props.history.goBack();
            }
        });
        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    onSearch = ({ pageNumber, pageSize, searchText, filterType }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (filterType == undefined) filterType = this.state.filterType;
        const condition = { categoryId: this.state.forumCategoryId, searchText, filterType: filterType.condition };
        this.setState({ isSearching: true }, () => this.props.getForumPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ condition, searchText, filterType, isSearching: false });
            done && done(page);
        }));
    }

    getPage = (pageNumber, pageSize, searchText, done) => {
        this.state.forumCategoryId && this.props.getForumPage(pageNumber, pageSize, { categoryId: this.state.forumCategoryId, searchText }, done);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (item) => T.confirm('Chủ đề', `Bạn có chắc bạn muốn xóa chủ đề '${item.title}'?`, 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id, { filterType: this.state.filterType && this.state.filterType.condition }));

    handleOnChangeActive = (_id, active) => {
        if (active == 'true') {
            this.props.updateForum(_id, { active: true }, { filterType: this.state.filterType && this.state.filterType.condition });
        } else {
            this.props.updateForum(_id, { active: false }, { filterType: this.state.filterType && this.state.filterType.condition });
        }
    }

    render() {
        const { userId, isLecturer, isTrustLecturer, isCourseAdmin } = this.state;
        const adminPermission = this.getUserPermission('system', ['settings']);
        let forumAdmin = adminPermission && adminPermission.settings || isCourseAdmin;
        const permission = this.getUserPermission('forum');
        const { category, page } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const backRoute = '/user/forum';
        const header =  forumAdmin ? <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Trạng thái:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.filterType = e} data={dataFilterType} onChange={value => this.onSearch({ filterType: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </> : null;
        const listForums = list && list.length ? list.map((item, index) => {
            const forumOwner = forumAdmin || (isLecturer && (isTrustLecturer || item.state == 'approved') && item && item.user && (userId == item.user._id));
            return <div key={index} className='tile'>
                <div style={{ display: 'inline-flex' }}>
                    <h4 className='tile-title'>
                        <Link to={`/user/forum/message/${item._id}`} style={{ textDecoration: 'none' }}>{item.title}</Link>&nbsp;&nbsp;
                    </h4>
                    <small style={{ paddingTop: 10 }}>
                        ({item.user ? `${item.user.lastname} ${item.user.firstname}` : ''}
                        {item.modifiedDate ? ' - ' + (new Date(item.modifiedDate).getText()) : ''})&nbsp;&nbsp;
                        {isLecturer && item.state && ForumStatesMapper[item.state] ? <b style={{ color: ForumStatesMapper[item.state].color }}>{ForumStatesMapper[item.state].text}</b> : ''}
                    </small>
                </div>
                <ForumButtons isForumPage={true} active={item.active} state={item.state} permission={{ forumOwner, forumAdmin }} onChangeState={(state) => this.props.updateForum(item._id, { state }, { filterType: this.state.filterType && this.state.filterType.condition })} onChangeActive={(active) => this.handleOnChangeActive(item._id, active)} onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} />

                <div className='tile-body' style={{ marginBottom: 20 }}>
                    <p className='limit-line' dangerouslySetInnerHTML={{ __html: item.content }} />
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
            </div>;
        }) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-users',
            title: category ? category.title : 'Diễn đàn',
            header: header,
            breadcrumb: [<Link key={0} to={backRoute}>Diễn đàn</Link>, category ? category.title : ''],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} category={category._id} permission={permission} forumCreator={forumAdmin || isLecturer && isTrustLecturer} history={this.props.history}
                    create={this.props.createForum} update={this.props.updateForum} filterType={this.state.filterType} />
            </> : '...',
            onCreate: forumAdmin || isLecturer ? this.edit : null,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);