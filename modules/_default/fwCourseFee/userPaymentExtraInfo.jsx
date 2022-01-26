import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { getBankByStudent } from 'modules/_default/fwBank/redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getCourseFeeByStudent } from './redux';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';


const previousRoute = '/user';

class PaymentInfoModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemBankName.focus()));
    }

    onShow = (item) => {
        const { code, nameBank, accounts, contentSyntaxExtra } = item || { code: '', nameBank: '', accounts: {}, contentSyntax: '' };
        this.itemBankName.value(code + ' - ' + nameBank);
        this.itemAccounts.value(accounts && accounts.number ? accounts.number : '');
        this.itemAccountsUser.value(accounts && accounts.holder ? accounts.holder : '');
        this.itemFee.value(this.props.fee ? T.numberDisplay(this.props.fee) + ' đồng' : 0);
        this.itemContentSyntaxExtra.value(contentSyntaxExtra);
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
                        <FormTextBox ref={e => this.itemContentSyntaxExtra = e} type='text' label='Cú pháp chuyển khoản' readOnly={this.props.readOnly} />
                        <CopyToClipboard text={this.props.contentSyntaxExtra ? this.props.contentSyntaxExtra : ''}
                            onCopy={() => T.notify('Đã copy', 'success')}>
                            <span><i className='fa fa-clone'></i></span>
                        </CopyToClipboard>
                    </div>
                </div>
            </div>),
    });
}

class UserPaymentInfo extends AdminPage {
    state = { name: '...', soTienThanhToan: 0, cart: [] };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/cong-no/tang-them'),
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
                        this.setState({
                            ...data.item,
                            cart: data.student.cart ? data.student.cart.item : [],
                            student: data.student
                        });
                        this.props.getBankByStudent({ active: true }, (item) => {
                            if (item) {
                                this.setState({
                                    defaultContentSyntaxExtra: item.contentSyntaxExtra,
                                    contentSyntaxExtra: item.contentSyntaxExtra && item.contentSyntaxExtra.replace('{cmnd}', data.student.identityCard).replace('{ten_loai_khoa_hoc}', data.student.courseType.title).replace('{ma_giao_dich}', data.student.cart ? data.student.cart.transactionId : ''),
                                    code: item.code, nameBank: item.name,
                                    accounts: item.accounts.find(({ active }) => active == true),
                                });
                                this.props.getCourseFeeByStudent({ courseType: data.item.courseType._id });
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

    addToCart = (item, quantity) => {
        const cart = this.state.cart;
        const { studentId, defaultContentSyntaxExtra, courseName, identityCard } = this.state.student;
        T.confirm('Thêm vào danh sách mua gói', 'Bạn có chắc thêm ' + quantity + ' gói ' + item.name + ' vào danh sách thanh toán không?', true, isConfirm => {
            if (isConfirm) {
                const index = cart.findIndex(courseFee => courseFee._id == item._id);
                if (index == -1) {
                    item.quantity = parseInt(quantity);
                    item.fees = item.fee * parseInt(quantity);
                    cart.push(item);
                } else {
                    cart[index].quantity = cart[index].quantity + parseInt(quantity);
                    cart[index].fees = cart[index].fee * cart[index].quantity;
                }
                let transactionId = this.makeId(5);
                this.setState({
                    cart,
                    contentSyntaxExtra: defaultContentSyntaxExtra && defaultContentSyntaxExtra.replace('{cmnd}', identityCard).replace('{ten_loai_khoa_hoc}', courseName).replace('{ma_giao_dich}', transactionId),
                }, () => {
                    this.props.updateStudent(studentId, { cart: { transactionId, item: cart } });
                });
            }
        });
    };

    delete = (e, { item }) => {
        e.preventDefault();
        const { studentId, defaultContentSyntaxExtra, courseName, identityCard } = this.state.student;
        let cart = this.state.cart;
        T.confirm('Xóa khỏi danh sách thanh toán', 'Bạn có chắc bạn muốn xóa gói học này?', true, isConfirm => {
            if (isConfirm) {
                cart = cart.filter(courseFee => courseFee._id != item._id);
                let transactionId = this.makeId(5);
                this.setState({
                    cart,
                    contentSyntaxExtra: defaultContentSyntaxExtra && defaultContentSyntaxExtra.replace('{cmnd}', identityCard).replace('{ten_loai_khoa_hoc}', courseName).replace('{ma_giao_dich}', transactionId),
                }, () => {
                    this.props.updateStudent(studentId, { cart: { transactionId, item: cart } });
                });
            }
        });
    }

    makeId = (length) => {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        const { cart } = this.state;
        const soTienThanhToan = cart && cart.length ? cart.map(item => item.fees).reduce((prev, next) => parseInt(prev) + parseInt(next)) : 0;
        const listCourseFee = this.props.courseFee && this.props.courseFee.list;
        const listCourseFeeExtra = listCourseFee && listCourseFee.length ? listCourseFee.filter(courseFee => courseFee.feeType && courseFee.feeType.official == false) : [];
        const table = renderTable({
            getDataSource: () => listCourseFeeExtra,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chọn thanh toán</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.feeType ? item.feeType.title : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.description} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<FormTextBox ref={e => this[index] = e} type='number' readOnly={false}>1</FormTextBox>} />
                    <TableCell type='link' onClick={() => this.addToCart(item, this[index].value())} style={{ textAlign: 'center' }} content={<i className='fa fa-shopping-cart' aria-hidden='true'></i>} />
                </tr>),
        });

        const tableUser = renderTable({
            getDataSource: () => cart,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.feeType ? item.feeType.title : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.description} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.quantity} />
                    <TableCell type='buttons' content={{ item, index }} permission={{ delete: true }} onDelete={this.delete} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Học phí tăng thêm: ' + (this.state.name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Học phí'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Chọn gói</h3>
                        {table}
                    </div>

                    {cart && cart.length ? <div className='tile'>
                        <h3 className='tile-title'>Thanh toán</h3>
                        {tableUser}
                        <div className='d-flex justify-content-between'>
                            <p>Số tiền thanh toán: <b>{T.numberDisplay(soTienThanhToan)} đồng</b></p>
                            <button className={'btn ' + (soTienThanhToan != 0 ? 'btn-success' : 'btn-secondary')} style={{ textAlign: 'right' }}
                                onClick={() => (soTienThanhToan == 0) ? T.alert('Vui lòng chọn số tiền muốn thanh toán', 'error', false, 8000) : this.modal.show(this.state)}
                            >Thanh toán</button>
                        </div>
                    </div> : null}

                    {/* {this.state.code ? <div className='tile'>
                        <h3 className='tile-title'>Thanh toán</h3>
                        <div className='tile-body row'>
                            <label className='col-md-12'>Tên ngân hàng: <b>{this.state.code + ' - ' + this.state.nameBank}</b></label>
                            <label className='col-md-12'>Số tài khoản: <b>{this.state.accounts && this.state.accounts.number}</b></label>
                            <label className='col-md-12'>Người sỡ hữu tài khoản: <b>{this.state.accounts && this.state.accounts.holder}</b></label>
                            <label className='col-md-12'>Học phí: <b>{courseFee ? T.numberDisplay(courseFee) + ' đồng' : ''}</b></label>
                            <label className='col-md-12'>Cú pháp chuyển khoản: <b>{this.state.contentSyntax}</b></label>
                        </div>
                    </div> : null} */}
                    <PaymentInfoModal fee={soTienThanhToan} accountsNumber={this.state.accounts && this.state.accounts.number} contentSyntax={this.state.contentSyntax} readOnly={true} ref={e => this.modal = e} />
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, courseFee: state.accountant.courseFee });
const mapActionsToProps = { getCourseByStudent, getBankByStudent, getCourseFeeByStudent, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserPaymentInfo);
