import React from 'react';
import { connect } from 'react-redux';
import { getContactPage, getContact, updateContact, deleteContact } from './redux.jsx';
import AdminContactModal from '../../view/component/AdminContactModal.jsx';
import Pagination from '../../view/component/Pagination.jsx';

class ContactPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getContactPage();
        T.ready();
    }

    showContact = (e, contactId) => {
        e.preventDefault();
        this.props.getContact(contactId, contact => this.modal.current.show(contact));
    }

    changeRead = (item) => this.props.updateContact(item._id, { read: !item.read });

    delete = (e, item) => {
        T.confirm('Delete contact', 'Are you sure want to delete this contact?', true, isConfirm => isConfirm && this.props.deleteContact(item._id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.contact && this.props.contact.page ?
            this.props.contact.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có liên hệ!';
        if (this.props.contact && this.props.contact.page && this.props.contact.page.list && this.props.contact.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '60%' }}>Subject</th>
                            <th style={{ width: '40%' }}>Name & Email</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.contact.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.showContact(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.subject}</a>
                                    <br />
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>{item.name}<br />{item.email}</td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showContact(e, item._id)}>
                                            <i className='fa fa-lg fa-envelope-open-o' />
                                        </a>
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa fa-envelope-o' /> Liên hệ</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageContact' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getContactPage} />
                <AdminContactModal ref={this.modal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ contact: state.contact });
const mapActionsToProps = { getContactPage, getContact, updateContact, deleteContact };
export default connect(mapStateToProps, mapActionsToProps)(ContactPage);