import React from 'react';
import { connect } from 'react-redux';
import { getNotificationPage, createNotification, updateNotification, deleteNotification } from './redux';

import { ajaxSelectUser } from 'modules/_default/fwUser/redux';
import { ajaxSelectCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import './style.scss';

const notificationTypes = [
    { id: 0, text: 'Thông báo cá nhân' },
    { id: 1, text: 'Thông báo chung' },
];

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.title.focus()));
    }

    onShow = (item) => {
        const { _id, type, user, course, title, content, createdDate } = item || { title: '', content: '' };
        this.title.value(title);
        this.content.value(content);
        this.type.value(type || 1);
        this.user.value(user);
        this.course.value(course);
        this.setState({ _id, createdDate });
    }

    onSubmit = () => {
        const { _id } = this.state,
            data = {
                title: this.title.value(),
                content: this.content.value(),
                type: this.type.value(),
                course: this.course.value(),
            };
        if (data.title) data.title = data.title.trim();
        if (data.content) data.content = data.content.trim();

        if (data.title == '') {
            T.notify('Tiêu đề không được trống!', 'danger');
            this.title.focus();
        } else if (data.content == '') {
            T.notify('Nội dung không được trống!', 'danger');
            this.content.focus();
        } else if (!data.type) {
            T.notify('Bạn vui lòng chọn loại thông báo!', 'danger');
        } else if (!data.course) {
            T.notify('Bạn vui lòng chọn khoá học!', 'danger');
        } else if (_id) {
            this.props.update(_id, data, (data) => data.item && this.hide());
        } else {
            this.props.create(data, (data) => data.item && this.hide());
        }
    }

    render = () => {
        const { _id, createdDate } = this.state;
        const { readOnly } = this.props;
        return this.renderModal({
            title: 'Danh mục',
            body: <>
                {_id && createdDate ? <p>Thời gian: {new Date(createdDate).getText()}</p> : null}
                <FormTextBox ref={e => this.title = e} label='Tiêu đề' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.content = e} label='Nội dung' readOnly={readOnly} />
                <FormSelect ref={e => this.type = e} label='Loại thông báo' data={notificationTypes} readOnly={readOnly} />
                <FormSelect ref={e => this.user = e} label='Học viên' data={ajaxSelectUser} readOnly={readOnly} />
                <FormSelect ref={e => this.course = e} label='Khoá học' data={ajaxSelectCourse} readOnly={readOnly} />
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
                                            {item.title}. <small className='text-muted'>({new Date(item.createdDate).getText()})</small>
                                        </a> :
                                        <a href='#' onClick={e => e.preventDefault() || this.modal.show(item)}>{item.title}</a>}
                                    {permission.write && !item.sentDate ? <a href='#' className='notification-button text-success' onClick={e => this.send(e, item)}><i className='fa fa-lg fa-paper-plane' /></a> : null}
                                    {permission.delete ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <Pagination name='pageNotification' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getNotificationPage} />
                <NotificationModal ref={e => this.modal = e} create={this.props.createNotification} update={this.props.updateNotification} />
            </>,
            onCreate: () => isCourseAdmin || permission.write ? this.modal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, notification: state.framework.notification });
const mapActionsToProps = { getNotificationPage, createNotification, updateNotification, deleteNotification };
export default connect(mapStateToProps, mapActionsToProps)(NotificationPage);