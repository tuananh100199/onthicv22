import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { getBankByStudent } from 'modules/_default/fwBank/redux';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AdminPage, TableCell, renderTable, FormCheckbox, AdminModal, FormTextBox } from 'view/component/AdminPage';


const previousRoute = '/user';

class PaymentInfoModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemBankName.focus()));
    }

    onShow = (item) => {
        const { code, nameBank, accounts, contentSyntax } = item || { code: '', nameBank: '', accounts: {}, contentSyntax: '' };
        this.itemBankName.value(code + ' - ' + nameBank);
        this.itemAccounts.value(accounts && accounts.number ? accounts.number : '');
        this.itemAccountsUser.value(accounts && accounts.holder ? accounts.holder : '');
        this.itemFee.value(this.props.fee ? T.numberDisplay(this.props.fee) + ' đồng' : 0);
        this.itemContentSyntax.value(contentSyntax);
        this.setState(item);
    }

    render = () => this.renderModal({
        title: 'Thanh toán học phí',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <FormTextBox ref={e => this.itemBankName = e} type='text' label='Tên ngân hàng' readOnly={this.props.readOnly} />
                    <div className='d-flex justify-content-between'>
                        <FormTextBox ref={e => this.itemAccounts = e} type='text' label='Số tài khoản' readOnly={this.props.readOnly} />
                        <CopyToClipboard text={this.props.accountsNumber ? this.props.accountsNumber : ''}
                            onCopy={() => T.notify('Đã copy', 'success')}>
                            <span><i className='fa fa-clone'></i></span>
                        </CopyToClipboard>
                    </div>
                    <FormTextBox ref={e => this.itemAccountsUser = e} type='text' label='Chủ tài khoản' readOnly={this.props.readOnly} />
                    <div className='d-flex justify-content-between'>
                        <FormTextBox ref={e => this.itemFee = e} type='text' label='Số tiền' readOnly={this.props.readOnly} />
                        <CopyToClipboard text={this.props.fee ? this.props.fee : 0}
                            onCopy={() => T.notify('Đã copy', 'success')}>
                            <span><i className='fa fa-clone'></i></span>
                        </CopyToClipboard>
                    </div>
                    <div className='d-flex justify-content-between'>
                        <FormTextBox ref={e => this.itemContentSyntax = e} type='text' label='Cú pháp chuyển khoản' readOnly={this.props.readOnly} />
                        <CopyToClipboard text={this.props.contentSyntax ? this.props.contentSyntax : ''}
                            onCopy={() => T.notify('Đã copy', 'success')}>
                            <span><i className='fa fa-clone'></i></span>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>),
    });
}
class UserPaymentInfo extends AdminPage {
    state = { name: '...', soTienThanhToan: 0 };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/cong-no/chinh-thuc'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item && data.student) {
                        this.setState({ ...data.item, ngayDuKienThiSatHach: data.student.ngayDuKienThiSatHach, hocPhiPhaiDong: data.student.courseFee, hocPhiDaDong: data.student.hocPhiDaDong, hocPhiMienGiam: data.student.discount, ngayHetHanNopHocPhi: data.student.ngayHetHanNopHocPhi, soLanDong: data.student.coursePayment, lichSuDongTien: data.student.lichSuDongTien });
                        this.props.getBankByStudent({ active: true }, (item) => {
                            if (item) {
                                this.setState({
                                    contentSyntax: item.contentSyntax && item.contentSyntax.replace('{cmnd}', data.student.identityCard).replace('{ten_loai_khoa_hoc}', data.student.courseType.title),
                                    code: item.code, nameBank: item.name,
                                    accounts: item.accounts.find(({ active }) => active == true),
                                });
                            }
                        });
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    onCheck = (value, fee) => {
        if (value) {
            this.setState(prevState => ({
                soTienThanhToan: prevState.soTienThanhToan + fee
            }));
        } else {
            this.setState(prevState => ({
                soTienThanhToan: prevState.soTienThanhToan - fee
            }));
        }
    }

    payment = (e) => e.preventDefault() || console.log('test');

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        const { hocPhiPhaiDong, hocPhiMienGiam, soLanDong, ngayHetHanNopHocPhi, soTienThanhToan, lichSuDongTien } = this.state;
        const list = [],
            numOfPayments = soLanDong ? soLanDong.numOfPayments : 1;
        const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        const hocPhiConLai = hocPhiPhaiDong && hocPhiPhaiDong.fee && hocPhiPhaiDong.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((hocPhiMienGiam && hocPhiMienGiam.fee) ? hocPhiMienGiam.fee : 0);
        for (let i = 1; i <= numOfPayments; i++) {
            if (lichSuDongTien && lichSuDongTien[i - 1]) {
                list.push({ name: 'Thanh toán học phí lần ' + i, fee: lichSuDongTien[i - 1].fee, ngayThanhToan: lichSuDongTien[i - 1].date });
            } else {
                list.push({ name: 'Thanh toán học phí lần ' + i, fee: (hocPhiConLai ? hocPhiConLai : 0) / (numOfPayments - (lichSuDongTien ? lichSuDongTien.length : 0)) });
            }

        }
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày dự kiến hết hạn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chọn thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>In phiếu thu</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.ngayThanhToan ? T.dateToText(item.ngayThanhToan, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={T.dateToText(ngayHetHanNopHocPhi, 'dd/mm/yyyy')} />
                    <TableCell type={item.ngayThanhToan ? 'text' : 'link'} onClick={() => { }} style={{ textAlign: 'center' }} content={item.ngayThanhToan ? 'Đã thanh toán' : <FormCheckbox ref={e => this[index] = e} onChange={value => this.onCheck(value, item.fee)} />} />
                    <TableCell type='link' onClick={() => console.log('first')} style={{ textAlign: 'center' }} content={<i className='fa fa-print' aria-hidden='true'></i>} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Học phí chính thức: ' + (this.state.name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Học phí'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin học phí</h3>
                        <div className='tile-body row'>
                            <label className='col-md-6'>Học phí phải đóng:  <b>{hocPhiPhaiDong ? T.numberDisplay(hocPhiPhaiDong.fee) + ' đồng' : ''}</b></label>
                            {this.state.hocPhiMienGiam ? <label className='col-md-6'>Học phí miễn giảm: <b>{T.numberDisplay(hocPhiMienGiam.fee) + ' đồng'}</b></label> : null}
                            <label className='col-md-6'>Học phí đã đóng:  <b>{this.state.hocPhiDaDong ? T.numberDisplay(hocPhiDaDong) + ' đồng' : ''}</b></label>
                            <label className='col-md-6'>Học phí còn lại:  <b>{hocPhiConLai ? (hocPhiConLai + ' đồng') : ''}</b></label>
                            {this.state.ngayHetHanNopHocPhi ? <label className='col-md-6'>Ngày hết hạn nộp học phí: <b>{T.dateToText(ngayHetHanNopHocPhi, 'dd/mm/yyyy')}</b></label> : null}
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Thanh toán</h3>
                        {table}
                        <div className='d-flex justify-content-between'>
                            <p>Số tiền thanh toán: <b>{T.numberDisplay(soTienThanhToan)} đồng</b></p>
                            <button className={'btn ' + (soTienThanhToan != 0 ? 'btn-success' : 'btn-secondary')} style={{ textAlign: 'right' }}
                                onClick={() => (soTienThanhToan == 0) ? T.alert('Vui lòng chọn số tiền muốn thanh toán', 'error', false, 8000) : this.modal.show(this.state)}
                            >Thanh toán</button>
                        </div>
                    </div>
                    <PaymentInfoModal fee={soTienThanhToan} accountsNumber={this.state.accounts && this.state.accounts.number} contentSyntax={this.state.contentSyntax} readOnly={true} ref={e => this.modal = e} />
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent, getBankByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserPaymentInfo);
