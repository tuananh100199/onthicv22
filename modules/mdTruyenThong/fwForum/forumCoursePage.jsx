import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import { getCourse } from 'modules/mdDaoTao/fwCourse/redux';
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
                course: this.props.courseId,
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
                        this.props.create(data, (data) => (data && data.item && this.props.history.push(`/user/course/${this.props.courseId}/forum/${data.item._id}/message`)) || this.hide());
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
            </>,
        });
    }
}

class ForumPage extends AdminPage {
    state = {};
    componentDidMount() {
        const params = T.routeMatcher('/user/course/:_courseId/forum/:_categoryId').parse(window.location.pathname),
                courseId = params._courseId,
                forumCategoryId = params._categoryId;
            const user = this.props.system ? this.props.system.user : null,
                { _id, isLecturer,isTrustLecturer, isCourseAdmin } = user;
         T.ready((isLecturer || isCourseAdmin) ? '/user/course': `/user/hoc-vien/khoa-hoc/${courseId}`, () => { 
            if (forumCategoryId) {
                this.setState({ userId: _id, isLecturer, isTrustLecturer, isCourseAdmin, courseId, forumCategoryId }, () => this.getPage());
                if((isLecturer || isCourseAdmin) ){
                    const course = this.props.course ? this.props.course.item : null;
                    if (!course) {
                        this.props.getCourse(params._id, data => {
                            if (data.error) {
                                T.notify('Lấy khóa học bị lỗi!', 'danger');
                                this.props.history.push('/user/course/' + params._id);
                            }
                        });
                    }
                }
            } else {
                this.props.history.goBack();
            }
        });
        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    getPage = (pageNumber, pageSize, searchText, done) => {
        this.state.forumCategoryId && this.props.getForumPage(this.state.forumCategoryId, pageNumber, pageSize, searchText, this.state.courseId, done);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (item) => T.confirm('Chủ đề', `Bạn có chắc bạn muốn xóa chủ đề '${item.title}'?`, 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id));

    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { userId, isLecturer, isTrustLecturer, isCourseAdmin } = this.state;
        const adminPermission = this.getUserPermission('system', ['settings']);
        let forumAdmin = adminPermission && adminPermission.settings || isCourseAdmin;
        const { category, page } = this.props.forum || {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = page || { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const courseBackRoute = '/user/course/' + this.state.courseId,
            categoryBackRoute = '/user/course/' + this.state.courseId + '/forum',
            userBackRoute = `/user/hoc-vien/khoa-hoc/${this.state.courseId}`;

        const listForums = list && list.length ? list.map((item, index) => {
            const forumOwner = forumAdmin || (isLecturer && isTrustLecturer && item && item.user && (userId == item.user._id));
            return <div key={index} className='tile'>
                <div style={{ display: 'inline-flex' }}>
                    <h4 className='tile-title'>
                        <Link to={`/user/course/${this.state.courseId}/forum/${item._id}/message`} style={{ textDecoration: 'none' }}>{item.title}</Link>&nbsp;&nbsp;
                    </h4>
                    <small style={{ paddingTop: 10 }}>
                        ({item.user ? `${item.user.lastname} ${item.user.firstname}` : ''}
                        {item.modifiedDate ? ' - ' + (new Date(item.modifiedDate).getText()) : ''})&nbsp;&nbsp;
                        {forumOwner && item.state && ForumStatesMapper[item.state] ? <b style={{ color: ForumStatesMapper[item.state].color }}>{ForumStatesMapper[item.state].text}</b> : ''}
                    </small>
                </div>
                <ForumButtons state={item.state} permission={{ forumOwner }} onChangeState={(state) => this.props.updateForum(item._id, { state })} onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} />

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

                <Link to={`/user/course/${this.state.courseId}/forum/${item._id}/message`} style={{ textDecoration: 'none', position: 'absolute', bottom: 0, right: 0, padding: 6, color: 'white', backgroundColor: '#1488db', borderBottomRightRadius: 3 }}>Đọc thêm...</Link>
            </div>;
        }) : <div className='tile'>Chưa có bài viết!</div>;

        return this.renderPage({
            icon: 'fa fa-users',
            title: category ? category.title : 'Forum',
            breadcrumb: this.state.isLecturer || this.state.isCourseAdmin ? 
            [<Link key={0} to='/user/course'>Khóa học</Link>, this.state.courseId ? <Link key={0} to={courseBackRoute}>{courseItem.name}</Link> : '',<Link key={0} to={categoryBackRoute}>Danh mục</Link>, category ? category.title : 'Danh sách'] : 
            [<Link key={0} to={userBackRoute}>Khóa học của tôi</Link>, <Link key={0} to={categoryBackRoute}>Forum</Link>, category ? category.title : 'Danh sách'],
            content: category ? <>
                {listForums}
                <Pagination name='pageForum' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} courseId={this.state.courseId} category={category._id} forumCreator={forumAdmin || isLecturer && isTrustLecturer} history={this.props.history}
                    create={this.props.createForum} update={this.props.updateForum} />
            </> : '...',
            backRoute: categoryBackRoute,
            onCreate: forumAdmin || isLecturer && isTrustLecturer ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum, course: state.trainning.course });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);