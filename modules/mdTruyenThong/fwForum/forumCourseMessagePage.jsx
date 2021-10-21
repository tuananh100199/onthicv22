import React from 'react';
import { connect } from 'react-redux';
import { getForum, getForumMessagePage, createForumMessage, updateForumMessage, deleteForumMessage } from './redux';
import { getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { ForumStates, ForumStatesMapper, ForumButtons } from './index';

class CourseMessageModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemContent.focus()));
    }

    onShow = (item) => {
        const { _id, content, state } = item || { content: '', state: 'waiting' };
        this.itemContent.value(content);
        this.itemState && this.itemState.value(state);
        this.setState({ _id });
    }

    onSubmit = () => {
        if (this.props.forum) {
            const data = {
                content: this.itemContent.value(),
                state: this.itemState ? this.itemState.value() : 'waiting',
                forum: this.props.forum,
            };
            if (data.content == '') {
                T.notify('Nội dung bài viết bị trống!', 'danger');
                this.itemContent.focus();
            } else if (this.itemState && data.state == null) {
                T.notify('Trạng thái bài viết bị trống!', 'danger');
            } else {
                if (data.content.length > 200) data.content = data.content.substring(0, 200);
                new Promise(resolve => this.state._id ? this.props.update(this.state._id, data, resolve) : this.props.create(data, resolve)).then(() => {
                    this.hide();
                    if (!(this.props.permission && this.props.permission.forumOwner)) T.alert('Bạn vui lòng chờ Quản trị viên duyệt bài của bạn. Cảm ơn', 'success', false);
                });
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Bài viết',
            body: <>
                <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung (200 từ)' readOnly={false} />
                {this.props.permission && this.props.permission.forumOwner ? <FormSelect ref={e => this.itemState = e} label='Trạng thái' data={ForumStates} readOnly={false} /> : null}
            </>,
        });
    }
}

class ForumCourseMessagePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/forum/:_forumId/message').parse(window.location.pathname),
                forumId = params._forumId;
            if (forumId) {
                this.setState({ forumId }, () => this.props.getForum(forumId) || this.getPage());
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.goBack();
            }
        });
        // TODO: Hiển thị thanh tìm kiếm
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    getPage = (pageNumber, pageSize, pageCondition, done) => {
        this.state.forumId && this.props.getForumMessagePage(this.state.forumId, pageNumber, pageSize, pageCondition, done);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (item) => T.confirm('Bài viết', 'Bạn có chắc bạn muốn xóa bài viết này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForumMessage(item._id));

    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        const adminPermission = this.getUserPermission('system', ['settings']);
        const { user } = this.props.system,
            { isLecturer, isTrustLecturer, isCourseAdmin } = user;
        const createdDateStyle = { textDecoration: 'none', position: 'absolute', top: 0, left: 0, padding: '6px 12px', color: 'white', borderTopLeftRadius: 3, borderBottomRightRadius: 3 };
        const { item: forum } = this.props.forum || {};
        const forumOwner = adminPermission && adminPermission.settings || isCourseAdmin || (isLecturer && isTrustLecturer && user && forum && forum.user && (user._id == forum.user._id));
        const { pageNumber, pageSize, pageTotal, totalItem, list } = forum && forum.page ? forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const backRoute = forum && forum.category ? '/user/course/' + courseItem._id + '/forum/' + forum.category._id : null;
        const courseBackRoute = '/user/course/' + courseItem._id;
        const categoryBackRoute = '/user/course/' + courseItem._id + '/forum';
        const forumBackRoute = forum && forum.category ? '/user/course/' + courseItem._id + '/forum/' + forum.category._id : null;

        return this.renderPage({
            icon: 'fa fa-comments',
            title: forum ? <>{forum.title} <small style={{ fontSize: 13 }}>({forum.user ? `${forum.user.lastname} ${forum.user.firstname}` : ''} {forum.modifiedDate ? ' - ' + (new Date(forum.modifiedDate).getText()) : ''})</small></> : '...',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, courseItem._id ? <Link key={0} to={courseBackRoute}>{courseItem.name}</Link> : '', <Link key={0} to={categoryBackRoute}> Danh mục </Link>, forum ? <Link key={0} to={forumBackRoute}>{forum.title}</Link> : 'Bài viết', 'Nội dung'],
            content: forum ? <>
                <div className='tile'>
                    {/* <small className='bg-secondary' style={createdDateStyle}>
                        {forum.user ? `${forum.user.lastname} ${forum.user.firstname}` : ''} -&nbsp;
                        {new Date(forum.modifiedDate || forum.createdDate).getText()}
                    </small> */}
                    <h4 style={{ marginTop: 8 }}>{forum.content}</h4>
                </div>

                {list && list.length ?
                    list.map((item, index) =>
                        <div key={index} className='tile' style={{ marginLeft: 20 }}>
                            <div className='tile-body'>
                                <small className='bg-secondary' style={{ ...createdDateStyle }}>
                                    {item.user ? item.user.lastname + ' ' + item.user.firstname : ''} -&nbsp;
                                    {new Date(item.createdDate).getText()}&nbsp;&nbsp;
                                    {forumOwner && item.state && ForumStatesMapper[item.state] ? <b style={{ color: ForumStatesMapper[item.state].color }}>{ForumStatesMapper[item.state].text}</b> : ''}
                                </small>
                                <p style={{ margin: '12px 0 0 0' }}>{item.content}</p>
                                <ForumButtons state={item.state} permission={{ forumOwner, messageOwner: user && item && item.user && user._id == item.user._id }} onChangeState={(state) => this.props.updateForumMessage(item._id, { state })} onEdit={() => this.modal.show(item)} onDelete={() => this.delete(item)} />
                            </div>
                        </div>) :
                    <div className='tile' style={{ marginLeft: 20 }}>Chưa có bài viết!</div>}
                <Pagination name='pageForumMessage' style={{ marginLeft: '70px' }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} />
                <CourseMessageModal ref={e => this.modal = e} forum={forum._id} permission={{ forumOwner }} create={this.props.createForumMessage} update={this.props.updateForumMessage} getPage={this.getPage} />
            </> : '...',
            backRoute: backRoute,
            onCreate: this.edit,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum, course: state.trainning.course });
const mapActionsToProps = { getForum, getForumMessagePage, createForumMessage, updateForumMessage, deleteForumMessage, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(ForumCourseMessagePage);