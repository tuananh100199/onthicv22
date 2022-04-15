import React from 'react';
import { connect } from 'react-redux';
import { importPayment } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormFileBox, FormDatePicker, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import {getCourseFeeAll} from 'modules/_default/fwCourseFee/redux';
import {getCoursePaymentAll} from 'modules/_default/fwCoursePayment/redux';
import {getDiscountAll} from 'modules/_default/fwDiscount/redux';
class EditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }
    onShow = (item) => {
        let { id,code, name, type, timeReceived, content, debitAccount, creditAccount, moneyAmount, debitObject, creditObject } = item || {name: '', type: '', content: '', debitAccount: '', creditAccount: '', moneyAmount: '', debitObject: '', creditObject: ''};
        this.setState({ id: id});
        this.itemName.value(name);
        this.itemCode.value(code);
        this.itemType.value(type);
        this.itemTimeReceive.value(timeReceived);
        this.itemContent.value(content);
        this.itemDebitAccount.value(debitAccount);
        this.itemCreditAccount.value(creditAccount);
        this.itemMoneyAmount.value(moneyAmount);
        this.itemDebitObject.value(debitObject);
        this.itemCreditObject.value(creditObject);
    }

    onSubmit = () => {
        const data = {
            id: this.state.id,
            type: this.itemType.value(),
            timeReceived:  this.itemTimeReceive.value(),
            code: this.itemCode.value(),
            name: this.itemName.value(),
            content: this.itemContent.value(),
            debitAccount: this.itemDebitAccount.value(),
            creditAccount: this.itemCreditAccount.value(),
            moneyAmount:  this.itemMoneyAmount.value(),
            debitObject: this.itemDebitObject.value(),
            creditObject: this.itemCreditObject.value(),
        };
        if (data.name == '') {
            T.notify('Họ và tên không được trống!', 'danger');
            this.itemName.focus();
        } else if (data.type == '') {
            T.notify('Mã chứng từ không được trống!', 'danger');
            this.itemType.focus();
        } else if (data.content == '') {
            T.notify('Diễn giải không được trống!', 'danger');
            this.itemContent.focus();
        } else if (data.moneyAmount == '') {
            T.notify('Số tiền không được trống!', 'danger');
            this.itemMoneyAmount.focus();
        } else if (data.creditObject == '') {
            T.notify('Mã số học viên không được trống!', 'danger');
            this.itemCreditObject.focus();
        } else {
            this.props.edit(this.state.id, data);
            T.notify('Cập nhật thông tin thu công nợ thành công!', 'success');
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa thông tin thu công nợ',
        size: 'large',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemType = e} className='col-md-4' label='Mã chứng từ' readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemTimeReceive = e} className='col-md-4' label='Thời gian nhận' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemCode = e} className='col-md-4' label='Số chứng từ' readOnly={this.props.readOnly}  />
                <FormTextBox ref={e => this.itemName = e} className='col-md-6' label='Họ tên học viên' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemContent = e} className='col-md-6' label='Diễn giải' readOnly={this.props.readOnly}  />
                <FormTextBox ref={e => this.itemDebitAccount = e} className='col-md-6' label='TK Nợ' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemCreditAccount = e} className='col-md-6' label='TK Có' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemMoneyAmount = e} type='number' className='col-md-4' label='Số tiền (VNĐ)' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemDebitObject = e} className='col-md-4' label='Đối tượng nợ' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemCreditObject = e} className='col-md-4' label='Đối tượng có' readOnly={this.props.readOnly}  />

            </div>),
    });
}

class ImportPage extends AdminPage {
    fileBox = React.createRef();
    state = {courseType:''};
    componentDidMount() {
        T.ready('/user/payment');
    }

    onUploadSuccess = (data) => {
        this.setState(data);
    }

    edit = (e, item) => e.preventDefault() || this.modalEdit.show(item);

    editPayment = (studentId, changes) => {
        this.setState(prevState => ({
            data: prevState.data.map(data => data.id === studentId ? changes : data)
        }));
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thu công nợ ứng viên', `Bạn có chắc bạn muốn xóa thông tin thu công nợ của ứng viên <strong>${item.name}</strong>?`, true, isConfirm =>
        isConfirm && this.setState(prevState => ({
            data: prevState.data.filter(data => data.id !== item.id)
        }))
    );

    onReUpload = () => {
        T.confirm('Upload lại file excel', 'Bạn có chắc bạn muốn upload lại file excel ứng viên này?', true, isConfirm => isConfirm && this.setState({ data: [] }));
    }

    save = () => {
        T.confirm('Lưu thông tin thu công nợ', 'Bạn có chắc bạn muốn lưu file danh sách thu công nợ này?', true, isConfirm => isConfirm && this.props.importPayment(this.state.data, data => {
            if (data.error) {
                T.notify('Import thu công nợ bị lỗi!', 'danger');
            } else {
                if (data.studentError && data.studentError.length) {
                    T.alert(`Không tìm thấy học viên có CMND/CCCD:  ${data.studentError.reduce((a, b) => `${b.error + ', ' + a}`, ' ')}!`, 'error', false, 8000);
                }
                this.props.history.push('/user/payment');
            }
        }));
    }

    render() {
        const permission = this.getUserPermission('payment', ['read', 'write', 'delete', 'import']),
            readOnly = !permission.write;
        const listStudent = this.state.data ? this.state.data : [];
        const table = renderTable({
            getDataSource: () => listStudent,
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
                        <TableCell type='number' content={index + 1} />
                        <TableCell content={item.type} />
                        <TableCell content={item.timeReceived ? T.dateToText(item.timeReceived):''} />
                        <TableCell content={item.code} />
                        <TableCell style={{ whiteSpace: 'nowrap' }} content={item.name} />
                        <TableCell content={item.content} />
                        <TableCell content={item.debitAccount} />
                        <TableCell content={item.creditAccount} />
                        <TableCell type='number' content={item.moneyAmount} />
                        <TableCell content={item.debitObject} />
                        <TableCell content={item.creditObject} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr >),
            });

        const filebox = (
            <div className='tile'>
                <h3 className='tile-title'>Import danh sách thu công nợ</h3>
                <FormFileBox ref={e => this.fileBox = e} uploadType='PaymentFile'
                    onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button className='btn btn-primary' type='button'>
                        <a href='/download/BAO CAO THU CONG NO.xlsx' style={{ textDecoration: 'none', color: 'white' }}><i className='fa-fw fa-lg fa fa-download' /> Tải xuống file mẫu</a>
                    </button>
                </div>
            </div >
        );
        const list = (
            <div>
                <div className='tile row'>
                    <div className='col-md-12'>
                        <h3 className='tile-title'>Danh sách ứng viên</h3>
                        <div className='tile-body' style={{ overflowX: 'auto' }}>
                            {table}
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-danger' type='button' style={{ marginRight: 10 }} onClick={this.onReUpload}>
                                <i className='fa fa-fw fa-lg fa-cloud-upload' /> Upload lại
                            </button>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>

                </div>
                <EditModal ref={e => this.modalEdit = e} readOnly={readOnly} edit={this.editPayment} />
            </div>
        );
        const isUpload = this.state.data && this.state.data.length;
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Nhập công nợ từ phần mềm kế toán bằng Excel',
            breadcrumb: [<Link key={0} to='/user/payment'>Thu công nợ</Link>, 'Nhập công nợ từ phần mềm kế toán bằng Excel'],
            content: <>
                <div style={{display:isUpload?'none':'block'}}>{filebox}</div>
                {/* {this.state.data && this.state.data.length ? list : filebox} */}
                <div style={{display:!isUpload?'none':'block'}}>{list}</div>

            </>,
            backRoute: '/user/payment',
        });
    }
}
const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { importPayment,getCourseFeeAll,getCoursePaymentAll,getDiscountAll };
export default connect(mapStateToProps, mapActionsToProps)(ImportPage);