import React from 'react';
import { connect } from 'react-redux';
import { getPaymentPage, exportBankBaoCao } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormDatePicker, CirclePageButton } from 'view/component/AdminPage';

class SmsModal extends AdminModal {
    onShow = ({sender, body, timeReceived}) => {
        this.setState({sender, body, timeReceived});
    };

    render = () => {
        const {sender, body, timeReceived} = this.state;
        return this.renderModal({
        title: 'Thông tin SMS Banking đã được xử lý',
        size: 'large',
        body: <>
            <label className='col-md-12'>Tên ngân hàng nhận: <b>{sender}</b></label>
            <label className='col-md-12'>Nội dung SMS: <b>{body}</b></label>
            <label className='col-md-12'>Thời gian nhận: <b>{timeReceived ? T.dateToText(timeReceived): ''}</b></label>
            </>,
        });
    }
}

class PaymentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/payment');
        this.props.getPaymentPage(1, 50, undefined);
    }

    handleFilterByDate = () => {
        const dateStart = this.dateStartDate ? this.dateStartDate.value() : '';
        const dateEnd = this.dateEndDate ? this.dateEndDate.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getPaymentPage(1, 50, {dateStart, dateEnd}, data => {
                this.setState({ isSearching: false, dateStart: dateStart, dateEnd: dateEnd, data});
            });
        }
    }

    render() {
        const {dateStart, dateEnd} = this.state;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.payment && this.props.payment.page ?
            this.props.payment.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        console.log(list);
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
                    <th style={{ width: 'auto' }}  nowrap='true'>SMS Banking ( Nhân viên nhập dữ liệu )</th>
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
                    {!item.userImport ? 
                    <TableCell type={'buttons'} style={{ textAlign: 'center' }}>
                        {item.sms ?
                            <a className='btn btn-success' href='#' onClick={(e) => {
                                e.preventDefault(); 
                                this.modal.show(item.sms);
                            }}>
                                <i className='fa fa-lg fa-comments-o' />
                            </a> : null}
                    </TableCell> : 
                    <TableCell style={{ whiteSpace: 'nowrap', textAlign:'center' }} content={`${item.userImport.lastname} ${item.userImport.firstname}`} />
                    }
                    
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Thu công nợ',
            breadcrumb: ['Thu công nợ'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <div className='col-md-6'>
                            <h3 className='tile-title'>Thống kê doanh thu theo ngày</h3>
                            <div className='tile-body row'>
                                <FormDatePicker ref={e => this.dateStartDate = e} label='Thời gian bắt đầu (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                                <FormDatePicker ref={e => this.dateEndDate = e} label='Thời gian kết thúc (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                                <div className='m-auto col-md-2'>
                                    <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByDate}>
                                        <i className='fa fa-filter' /> Lọc
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                        
                    {table}
                </div>
                <SmsModal ref={e => this.modal = e}/>
                <Pagination name='adminPayment' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPaymentPage} />
                <CirclePageButton type='export' onClick={() => exportBankBaoCao(dateStart, dateEnd)} />
                <CirclePageButton type='import' style={{ right: '70px', backgroundColor: 'red', borderColor: 'red' }} onClick={() => this.props.history.push('/user/payment/import')} /> 
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, payment: state.trainning.payment });
const mapActionsToProps = { getPaymentPage };
export default connect(mapStateToProps, mapActionsToProps)(PaymentPage);
