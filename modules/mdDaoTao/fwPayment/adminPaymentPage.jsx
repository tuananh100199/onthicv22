import React from 'react';
import { connect } from 'react-redux';
import { getPaymentPage } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';

class SmsModal extends AdminModal {
    sender = '';
    body = ''; 
    timeReceived = '';

    onShow = ({sender, body, timeReceived}) => {
        this.sender = sender;
        this.body = body;
        this.timeReceived = timeReceived;
    };

    render = () => this.renderModal({
        title: 'Thông tin SMS Banking đã được xử lý',
        size: 'large',
        body: <>
            <label className='col-md-12'>Tên ngân hàng nhận: <b>{this.sender}</b></label>
            <label className='col-md-12'>Nội dung SMS: <b>{this.body}</b></label>
            <label className='col-md-12'>Thời gian nhận: <b>{this.timeReceived}</b></label>
        </>,
    });
}

class PaymentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/payment');
        // T.ready(() => T.showSearchBox());
        this.props.getPaymentPage(1, 50, undefined);
        // T.onSearch = (searchText) => this.props.getPrePaymentPage(undefined, undefined, searchText ? { searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    render() {
        // const permission = this.getUserPermission('-payment', ['read', 'write', 'delete', 'import']),
        //     permissionUser = this.getUserPermission('user', ['read']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.payment && this.props.payment.page ?
            this.props.payment.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr> 
                 <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã chứng từ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian nhận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số chứng từ</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Diễn giải</th>
                    <th style={{ width: 'auto' }} nowrap='true'>TK nợ</th>
                    <th style={{ width: 'auto' }} nowrap='true'>TK có</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số tiền(VNĐ)</th>
                    <th style={{ width: 'auto' }}  nowrap='true'>Đối tượng nợ</th>
                    <th style={{ width: 'auto' }}  nowrap='true'>Đối tượng có</th>
                    <th style={{ width: 'auto' }}  nowrap='true'>SMS Banking</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell content={item.type} />
                    <TableCell content={item.timeReceived ? T.dateToText(item.timeReceived):''} />
                    <TableCell content={item.code} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={`${item.lastname} ${item.firstname}`} />
                    <TableCell content={item.content} />
                    <TableCell content={item.debitAccount} />
                    <TableCell content={item.creditAccount} />
                    <TableCell type='number' content={item.moneyAmount} />
                    <TableCell content={item.debitObject} />
                    <TableCell content={item.creditObject} />
                    <TableCell type='buttons'>
                        {item.sms ?
                            <a className='btn btn-success' href='#' onClick={(e) => {
                                e.preventDefault(); 
                                this.modal.show(item.sms);
                            }}>
                                <i className='fa fa-lg fa-comments-o' />
                            </a> : null}
                    </TableCell>
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Thu công nợ',
            breadcrumb: ['Thu công nợ'],
            content: <>
                <div className='tile'>{table}</div>
                <SmsModal ref={e => this.modal = e}/>
                <Pagination name='adminPayment' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPaymentPage} />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, payment: state.trainning.payment });
const mapActionsToProps = { getPaymentPage };
export default connect(mapStateToProps, mapActionsToProps)(PaymentPage);
