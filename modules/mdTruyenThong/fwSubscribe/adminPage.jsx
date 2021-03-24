import React from 'react';
import { connect } from 'react-redux';
import { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe, exportSubscribeToExcel } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';

class AdminSubscribeModal extends AdminModal {
    state = {};

    onShow = (item) => this.setState(item);

    render = () => this.renderModal({
        title: 'Thông tin đăng ký nhận tin',
        body: <>
            <label>Email: <b>{this.state.email}</b></label><br />
            <label>Ngày đăng ký nhận tin: <b>{new Date(this.state.createdDate).getText()}</b></label><br />
        </>
    });
}

class SubscribePage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getSubscribePage();
        T.onSearch = (searchText) => this.props.getSubscribePage(1, 50, searchText);
    }

    showSubscribe = (e, item) => e.preventDefault() || this.props.getSubscribe(item._id, subscribe => this.modal.show(subscribe));

    changeRead = (item) => this.props.updateSubscribe(item._id, { read: !item.read });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá đăng ký nhận tin', 'Bạn có chắc muốn xoá đăng ký nhận tin này?', true, isConfirm =>
        isConfirm && this.props.deleteSubscribe(item._id));

    exportSubscribe = (e) => {
        this.props.exportSubscribeToExcel();
    }

    render() {
        const permission = this.getUserPermission('subscribe');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.subscribe && this.props.subscribe.page ?
            this.props.subscribe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = renderTable({
            getDataSource: () => this.props.subscribe && this.props.subscribe.page && this.props.subscribe.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }}>Email</th>
                    <th style={{ width: '30%' }}>Ngày đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <td>
                        <a href='#' onClick={e => permission.read && this.showSubscribe(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.email}</a>
                    </td>
                    <TableCell type='date' content={item.createdDate} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showSubscribe} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Đăng ký nhận tin',
            breadcrumb: ['Đăng ký nhận tin'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageContact' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getSubscribePage} />
                {permission.write ?
                    <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} data-toggle='tooltip' title='Xuất Excel' onClick={e => this.exportSubscribe(e)}>
                        <i className='fa fa-file-excel-o' />
                    </button> : null}
                <AdminSubscribeModal ref={e => this.modal = e} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subscribe: state.subscribe });
const mapActionsToProps = { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe, exportSubscribeToExcel };
export default connect(mapStateToProps, mapActionsToProps)(SubscribePage);