import React from 'react';
import { connect } from 'react-redux';
import { getNotificationPage, updateNotification, deleteNotification } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class NotificationPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getNotificationPage();
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông báo', 'Bạn có chắc muốn xoá thông báo này?', true, isConfirm =>
        isConfirm && this.props.deleteNotification(item._id));

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isCourseAdmin } = currentUser;
        const permission = this.getUserPermission('notification');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.notification && this.props.notification.page ?
            this.props.notification.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { whiteSpace: 'nowrap', textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { whiteSpace: 'nowrap', textDecorationLine: 'none', fontWeight: 'bold' };
        let table = renderTable({
            getDataSource: () => this.props.notification && this.props.notification.page && this.props.notification.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Ngày gửi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} style={item.read || permission.write ? readStyle : unreadStyle} />
                    <TableCell type='date' content={item.createdDate} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete}>
                        TODO: Gửi
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-comment',
            title: 'Thông báo',
            breadcrumb: ['Thông báo'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageNotification' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getNotificationPage} />
            </>,
            onCreate: () => isCourseAdmin || permission.write ? this.modal.show() : null, //TODO
        });
    }
}

const mapStateToProps = state => ({ system: state.system, notification: state.framework.notification });
const mapActionsToProps = { getNotificationPage, updateNotification, deleteNotification };
export default connect(mapStateToProps, mapActionsToProps)(NotificationPage);