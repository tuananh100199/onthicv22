import React from 'react';
import { connect } from 'react-redux';
import { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe, exportSubscribeToExcel } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal } from 'view/component/AdminPage';

class AdminSubscribeModal extends AdminModal {
    state = {};
    modal = React.createRef();

    show = (item) => {
        this.setState(item);
        $(this.modal.current).modal('show');
    }

    render = () => {

        const { email, createdDate } = this.state;
        const renderDataModal = {
            title: 'Thông tin đăng ký nhận tin',
            body: <>
                <label>Email: <b>{email}</b></label><br />
                <label>Ngày đăng ký nhận tin: <b>{new Date(createdDate).getText()}</b></label><br />
            </>
        };
        return this.renderModal(renderDataModal);
    }
}

class SubscribePage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        T.ready();
        this.props.getSubscribePage();
        T.onSearch = (searchText) => this.props.getSubscribePage(1, 25, searchText);
    }

    showSubscribe = (e, _id) => {
        e.preventDefault();
        this.props.getSubscribe(_id, subscribe => this.modal.current.show(subscribe));
    }

    changeRead = (item) => this.props.updateSubscribe(item._id, { read: !item.read });

    delete = (e, item) => {
        T.confirm('Xoá đăng ký nhận tin', 'Bạn có chắc muốn xoá đăng ký nhận tin này?', true, isConfirm => isConfirm && this.props.deleteSubscribe(item._id));
        e.preventDefault();
    }
    exportSubscribe = (e) => {
        this.props.exportSubscribeToExcel();
    }

    render() {
        const permission = this.getUserPermission('subscribe');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.subscribe && this.props.subscribe.page ?
            this.props.subscribe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có đăng ký nhận tin!';
        if (this.props.subscribe && this.props.subscribe.page && this.props.subscribe.page.list && this.props.subscribe.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '70%' }}>Email</th>
                            <th style={{ width: '30%' }}>Ngày đăng ký</th>
                            {permission.read || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.subscribe.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => permission.read && this.showSubscribe(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.email}</a>
                                </td>
                                <td nowrap='true'>{new Date(item.createdDate).getText()}</td>
                                {permission.read || permission.delete ?
                                    <td>
                                        <div className='btn-group'>
                                            {permission.read ?
                                                <a className='btn btn-primary' href='#' onClick={e => this.showSubscribe(e, item._id)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a> : null}
                                            {permission.delete ?
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a> : null}
                                        </div>
                                    </td> : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        const renderData = {
            icon: 'fa fa-envelope-o',
            title: 'Đăng ký nhận tin',
            breadcrumb: ['Đăng ký nhận tin'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageContact' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSubscribePage} />
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Xuất Excel' onClick={e => this.exportSubscribe(e)}>
                    <i className='fa fa-file-excel-o' />
                </button>
                <AdminSubscribeModal ref={this.modal} />
            </>,
        };
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, subscribe: state.subscribe });
const mapActionsToProps = { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe, exportSubscribeToExcel };
export default connect(mapStateToProps, mapActionsToProps)(SubscribePage);