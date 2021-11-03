import React from 'react';
import { connect } from 'react-redux';
import { getNotificationPage, createNotification, updateNotification, deleteNotification } from './redux';
import { ajaxSelectUser } from 'modules/_default/fwUser/redux';
import { ajaxSelectCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormEditor, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import './style.scss';

const notificationTypes = [
    { id: 0, text: 'Cá nhân', icon: 'fa fa-user' },
    { id: 1, text: 'Chung', icon: 'fa fa-users' },
    { id: 2, text: 'Thi tốt nghiệp', icon: 'fa fa-graduation-cap' },
    { id: 3, text: 'Thi sát hạch', icon: 'fa fa-id-card' },
];

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.title.focus()));
    }

    onShow = (item) => {
        const { _id, type, user, course, title, content, abstract, createdDate, sentDate } = item || { title: '', content: '', abstract: '' };
        this.title.value(title);
        this.abstract.value(abstract);
        this.content.html(content);
        this.type.value(type || 1);
        this.user.value(user ? { id: user._id, text: `${user.lastname} ${user.firstname} ${user.identityCard ? '(' + user.identityCard + ')' : ''}` } : null);
        this.course.value(course);
        this.setState({
            _id, createdDate,
            isCourseShow: type ? type == 1 : true,
            title,
            sentDate
        });
    }

    onSubmit = () => {
        const { _id } = this.state,
            data = {
                title: this.title.value(),
                content: this.content.html(),
                abstract: this.abstract.value(),
                type: this.type.value(),
                course: this.course.value(),
                user: this.user.value(),
            };
        if (data.title) data.title = data.title.trim();
        if (data.abstract) data.abstract = data.abstract.trim();
        if (data.content) data.content = data.content.trim();
        if (data.type == 1) delete data.user;
        else delete data.course;
        if (data.title == '') {
            T.notify('Tiêu đề không được trống!', 'danger');
            this.title.focus();
        } else if (data.abstract == '') {
            T.notify('Mô tả ngắn gọn không được trống!', 'danger');
            this.content.focus();
        } else if (data.content == '') {
            T.notify('Nội dung không được trống!', 'danger');
            this.content.focus();
        } else if (!data.type) {
            T.notify('Bạn vui lòng chọn loại thông báo!', 'danger');
            this.type.focus();
        } else if (data.type == 1 && !data.course) {
            T.notify('Bạn vui lòng chọn khoá học!', 'danger');
            this.course.focus();
        } else if (data.type != 1 && !data.user) {
            T.notify('Bạn vui lòng chọn người dùng nhận thông báo!', 'danger');
            this.user.focus();
        } else if (_id) {
            this.props.update(_id, data, (data) => data.item && this.hide());
        } else {
            this.props.create(data, (data) => data.item && this.hide());
        }
    }

    onChangeType = (type) => {
        this.setState({
            isCourseShow: type == 1,
        });
    }

    render = () => {
        const { _id, createdDate, isCourseShow, sentDate } = this.state;
        const { readOnly } = this.props;
        return this.renderModal({
            title: this.state.title ? this.state.title : 'Thông báo mới',
            size: 'large',
            dataBackdrop: !readOnly ? 'static' : 'true',
            body: <>
                {_id && createdDate && (!readOnly ?
                    <p>Thời gian: {new Date(createdDate).getText()}</p> :
                    <p>Thời gian gửi: {new Date(sentDate).getText()}</p>)
                }
                <FormTextBox className={readOnly ? 'd-none' : ''} ref={e => this.title = e} label='Tiêu đề' readOnly={readOnly} />
                <div className='row'>
                    <FormSelect className='col-md-6' ref={e => this.type = e} label='Loại thông báo' data={notificationTypes} readOnly={readOnly} onChange={data => this.onChangeType(data.id)} />
                    <FormSelect className={'col-md-6 ' + (isCourseShow ? 'd-none' : '')} ref={e => this.user = e} label='Học viên' data={ajaxSelectUser} readOnly={readOnly} />
                    <FormSelect className={'col-md-6 ' + (isCourseShow ? '' : 'd-none')} ref={e => this.course = e} label='Khoá học' data={ajaxSelectCourse} readOnly={readOnly} />
                </div>
                <FormRichTextBox ref={e => this.abstract = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
                <FormEditor ref={e => this.content = e} label='Nội dung' uploadUrl='/user/upload?category=notification' readOnly={readOnly} />

            </>,
        });
    }
}

class NotificationPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getNotificationPage();
    }

    send = (e, item) => e.preventDefault() || item.sentDate || T.confirm('Gửi thông báo', `Bạn có chắc muốn gửi thông báo ${item.title}?`, true, isConfirm =>
        isConfirm && this.props.updateNotification(item._id, { sentDate: new Date() }));

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông báo', `Bạn có chắc muốn xoá thông báo ${item.title}?`, true, isConfirm =>
        isConfirm && this.props.deleteNotification(item._id));

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isCourseAdmin } = currentUser;
        const permission = this.getUserPermission('notification');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.notification && this.props.notification.page ?
            this.props.notification.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        if (!list) list = [];
        return this.renderPage({
            icon: 'fa fa-comment',
            title: 'Thông báo',
            breadcrumb: ['Thông báo'],
            content: <>
                <div className='tile'>
                    {list.length ?
                        <ul style={{ paddingLeft: 12, listStyleType: 'none' }}>
                            {list.map((item, index) => (
                                <li key={index} className='notification'>
                                    {(pageNumber - 1) * pageSize + index + 1}. &nbsp;
                                    {permission.write ?
                                        <a href='#' className={item.sentDate ? 'text-secondary' : 'text-primary'} onClick={e => e.preventDefault() || this.modal.show(item)}>
                                            {/* {item.title}. <small className='text-muted'>({new Date(item.createdDate).getText()})</small> */}
                                            <div className='d-flex align-items-start'>
                                                <i style={{ fontSize: '2rem' }} className={notificationTypes[item.type].icon}></i>
                                                <div className='pl-2'>
                                                    <span style={{ fontSize: '1rem' }}>{item.title} </span>
                                                    <p className='text-muted'>Loại thông báo: {notificationTypes[item.type].text}.<span className='pl-2'>Thời gian : {new Date(item.createdDate).getText()}</span></p>
                                                </div>
                                            </div>
                                        </a> :
                                        <a href='#' className='text-secondary' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                            <div className='d-flex align-items-start'>
                                                <i style={{ fontSize: '2rem' }} className={notificationTypes[item.type].icon}></i>
                                                <div className='pl-2'>
                                                    <span style={{ fontSize: '1rem' }}>{item.title} </span>
                                                    <p className='text-muted'>Loại thông báo: {notificationTypes[item.type].text}.<span className='pl-2'>Thời gian gửi: {new Date(item.sentDate).getText()}</span></p>
                                                </div>
                                            </div>
                                        </a>}
                                    {permission.write && !item.sentDate ? <a href='#' className='notification-button text-success' onClick={e => this.send(e, item)}><i className='fa fa-lg fa-paper-plane' /></a> : null}
                                    {permission.delete ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <Pagination name='pageNotification' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.props.getNotificationPage(pageNumber, pageSize)} />
                <NotificationModal ref={e => this.modal = e} create={this.props.createNotification} update={this.props.updateNotification} readOnly={!permission.write} />
            </>,
            onCreate: isCourseAdmin || permission.write ? () => this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, notification: state.framework.notification });
const mapActionsToProps = { getNotificationPage, createNotification, updateNotification, deleteNotification };
export default connect(mapStateToProps, mapActionsToProps)(NotificationPage);