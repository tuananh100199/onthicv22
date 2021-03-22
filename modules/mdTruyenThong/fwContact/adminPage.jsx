import React from 'react';
import { connect } from 'react-redux';
import { getContactPage, getContact, updateContact, deleteContact } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import AdminContactModal from 'view/component/AdminContactModal';
import Pagination from 'view/component/Pagination';

class ContactPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getContactPage();
    }

    showContact = (e, contactId) => e.preventDefault() || this.props.getContact(contactId, contact => this.modal.show(contact));

    changeRead = (item) => this.props.updateContact(item._id, { read: !item.read });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá liên hệ', 'Bạn có chắc muốn xoá liên hệ này?', true, isConfirm =>
        isConfirm && this.props.deleteContact(item._id));

    render() {
        const permission = this.getUserPermission('contact');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.contact && this.props.contact.page ?
            this.props.contact.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = renderTable({
            getDataSource: () => this.props.contact && this.props.contact.page && this.props.contact.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '60%' }}>Chủ đề</th>
                    <th style={{ width: '40%' }}>Tên & Email</th>
                    <th style={{ width: 'auto' }}>Ngày gửi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' onClick={e => this.showContact(e, item._id)} style={item.read ? readStyle : unreadStyle} content={item.subject} />
                    <TableCell type='text' content={<>{item.name}<br />{item.email}</>} />
                    <TableCell type='date' content={item.createdDate} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete}>
                        <a className='btn btn-primary' href='#' onClick={e => this.showContact(e, item._id)}>
                            <i className='fa fa-lg fa-envelope-open-o' />
                        </a>
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Liên hệ',
            breadcrumb: ['Liên hệ'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageContact' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getContactPage} />
                <AdminContactModal ref={e => this.modal = e} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ contact: state.contact });
const mapActionsToProps = { getContactPage, getContact, updateContact, deleteContact };
export default connect(mapStateToProps, mapActionsToProps)(ContactPage);