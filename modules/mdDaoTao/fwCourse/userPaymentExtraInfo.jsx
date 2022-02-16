import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { getBankByStudent } from 'modules/_default/fwBank/redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getCourseFeeByStudent } from 'modules/_default/fwCourseFee/redux';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { AdminPage, TableCell, renderTable, AdminModal, FormTextBox } from 'view/component/AdminPage';


const previousRoute = '/user';

class PaymentInfoModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemBankName.focus()));
    }

    onShow = () => {
        const { code, nameBank, accounts, contentSyntaxExtra } = this.props || { code: '', nameBank: '', accounts: {}, contentSyntaxExtra: '' };
        this.itemBankName.value(code + ' - ' + nameBank);
        this.itemAccounts.value(accounts && accounts.number ? accounts.number : '');
        this.itemAccountsUser.value(accounts && accounts.holder ? accounts.holder : '');
        this.itemFee.value(this.props.fee ? T.numberDisplay(this.props.fee) + ' đồng' : 0);
        this.itemContentSyntaxExtra.value(contentSyntaxExtra);
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
        buttons:
            <a className='btn btn-warning' href='#' onClick={e => {
                e.preventDefault();
                let { cart, studentId, transactionId } = this.props;
                this.props.updateStudent(studentId, { cart: { item: cart, transactionId, lock: true } }, () => {
                    this.hide();
                    window.location.reload();
                });
            }} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Xác nhận thanh toán
            </a>
    });
}

class CartModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = () => {
        this.setState({cart:this.props.cart});
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

    delete = (e, { item }) => {
        e.preventDefault();
        let { defaultContentSyntaxExtra, count } = this.props;
        let cart = this.state.cart;
        const { _id, courseType, identityCard } = this.props.student;
        T.confirm('Xóa khỏi danh sách thanh toán', 'Bạn có chắc bạn muốn xóa gói học này?', true, isConfirm => {
            if (isConfirm) {
                cart = cart.filter(courseFee => courseFee._id != item._id);
                let transactionId = this.makeId(5);
                this.setState({
                    transactionId,
                    cart,
                    count: count - parseInt(item.quantity),
                    contentSyntaxExtra: defaultContentSyntaxExtra && defaultContentSyntaxExtra.replace('{cmnd}', identityCard).replace('{ten_loai_khoa_hoc}', courseType ? courseType.contentSyntax : '').replace('{ma_giao_dich}', transactionId),
                }, () => {
                    this.props.updateState({transactionId,cart,count: count - parseInt(item.quantity),contentSyntaxExtra: defaultContentSyntaxExtra && defaultContentSyntaxExtra.replace('{cmnd}', identityCard).replace('{ten_loai_khoa_hoc}', courseType ? courseType.contentSyntax : '').replace('{ma_giao_dich}', transactionId)});
                    this.props.updateStudent(_id, { cart: { transactionId, item: cart } });
                });
            }
        });
    }

    render = () => {
        const lock = this.props.lock;
        const cart = this.state.cart;
        const tableUser = renderTable({
            getDataSource: () => cart,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                    {!lock ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.feeType ? item.feeType.title : ''} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.description} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.quantity} />
                    {!lock ? <TableCell type='buttons' content={{ item, index }} permission={{ delete: true }} onDelete={this.delete} /> : null}
                </tr>),
        });
        return this.renderModal({
        title: 'Giỏ hàng',
        dataBackdrop: 'static',
        size: 'large',
        body: (
            <div>
                <div className='tile-body'>
                    {tableUser}
                </div>
            </div>),
        buttons:
        cart && cart.length ? <button className='btn btn-success' style={{ textAlign: 'right' }}
            onClick={() => {
                this.props.showPayment();
                this.hide();
            }}
        >Thanh toán</button> : null
    });
    }
}

class CancelPaymentModal extends AdminModal {
    state = { showSubmitBtn: false};
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    checkOther = (item) => {
        if(item && item != ''){
            $('#khac').prop('checked',true);
        } else{
            $('#khac').prop('checked',false);
        }
    }

    checked = () =>{
        this.setState({showSubmitBtn: true});
    }

    render = () => this.renderModal({
        title: 'Huỷ thanh toán gói tăng thêm',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <div><b>Chọn lý do huỷ gói học phí:</b></div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='doiGoi' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='doiGoi'>
                            Đổi gói
                        </label>
                    </div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='chonNhamGoi' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='chonNhamGoi'>
                            Chọn nhầm gói
                        </label>
                    </div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='khac' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='khac'>
                            Khác:
                            <FormTextBox ref={e => this.itemLyDo = e} onChange={e => this.checkOther(e.target.value)} type='text' readOnly={false} />
                        </label>
                    </div>
                </div>
            </div>),
        buttons:
        this.state.showSubmitBtn ? <button className='btn btn-danger' style={{ textAlign: 'right' }}
            onClick={() => {
                this.props.updateStudent(this.props.studentId, { cart: { item: this.props.cart, transactionId: this.props.transactionId, lock: false } }, () => {
                    window.location.reload();
                });
            }}
        >Xác nhận huỷ thanh toán</button> : null
    });
}

class UserPaymentInfo extends AdminPage {
    state = { name: '...', soTienThanhToan: 0, cart: [],count: 0 };
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
                        let count = 0;
                        data.student.cart && data.student.cart.item && data.student.cart.item.forEach(item => count = count + item.quantity);
                        this.setState({
                            ...data.item,
                            cart: data.student.cart ? data.student.cart.item : [],
                            count: count,
                            lock: data.student.cart ? data.student.cart.lock : false,
                            transactionId: data.student.cart ? data.student.cart.transactionId : '',
                            student: data.student
                        });
                        this.props.getBankByStudent({ active: true }, (item) => {
                            if (item) {
                                this.setState({
                                    defaultContentSyntaxExtra: item.contentSyntaxExtra,
                                    contentSyntaxExtra: item.contentSyntaxExtra && item.contentSyntaxExtra.replace('{cmnd}', data.student.identityCard).replace('{ten_loai_khoa_hoc}', data.student.courseType.contentSyntax).replace('{ma_giao_dich}', data.student.cart ? data.student.cart.transactionId : ''),
                                    code: item.code, nameBank: item.name,
                                    accounts: item.accounts.find(({ active }) => active == true),
                                });
                                if (data.student.cart.lock) {
                                    const cart = data.student.cart ? data.student.cart.item : [];
                                    const accounts = item.accounts.find(({ active }) => active == true);
                                    const soTienThanhToan = cart && cart.length ? cart.map(item => item.fees).reduce((prev, next) => parseInt(prev) + parseInt(next)) : 0;
                                    this.itemBankName.value(item.code + ' - ' + item.name);
                                    this.itemAccounts.value(accounts && accounts.number ? accounts.number : '');
                                    this.itemAccountsUser.value(accounts && accounts.holder ? accounts.holder : '');
                                    this.itemFee.value(T.numberDisplay(soTienThanhToan));
                                    this.itemContentSyntaxExtra.value(item.contentSyntaxExtra && item.contentSyntaxExtra.replace('{cmnd}', data.student.identityCard).replace('{ten_loai_khoa_hoc}', data.student.courseType.contentSyntax).replace('{ma_giao_dich}', data.student.cart ? data.student.cart.transactionId : ''));
                                }
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

    updateState = (newState) => {
        this.setState(newState);
    }

    addToCart = (item, quantity,indexCart) => {
        const { cart = [], defaultContentSyntaxExtra, count } = this.state;
        const { _id, courseType, identityCard } = this.state.student;
        T.confirm('Thêm vào danh sách mua gói', 'Bạn có chắc thêm ' + quantity + ' gói ' + item.name + ' vào danh sách thanh toán không?', 'info', isConfirm => {
            if (isConfirm) {
                if(quantity){
                    const index = cart && cart.findIndex(courseFee => courseFee._id == item._id);
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
                        transactionId,
                        cart,
                        count: count + parseInt(quantity),
                        contentSyntaxExtra: defaultContentSyntaxExtra && defaultContentSyntaxExtra.replace('{cmnd}', identityCard).replace('{ten_loai_khoa_hoc}', courseType ? courseType.contentSyntax : '').replace('{ma_giao_dich}', transactionId),
                    }, () => {
                        this[indexCart].value('');
                        this.props.updateStudent(_id, { cart: { transactionId, item: cart } });
                        T.notify('Cập nhật giỏ hàng thành công', 'success');
                    });
                } else{
                    T.notify('Vui lòng nhập số lượng gói !', 'danger');
                }
                
            } 
        });
    };

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
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/cong-no';
        const { cart, transactionId, lock, accounts, contentSyntaxExtra,count } = this.state;
        const studentId = this.state.student && this.state.student._id;
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
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={<FormTextBox ref={e => this[index] = e} style={{ width: '60px' }} type='number' min={1} max={100} readOnly={false}></FormTextBox>} />
                    <TableCell type='link' onClick={() => this.addToCart(item, this[index].value(),index)} style={{ textAlign: 'center' }} content={<i className='fa fa-shopping-cart' aria-hidden='true'></i>} />
                </tr>),
        });

        const tableUser = renderTable({
            getDataSource: () => cart,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói học phí</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.feeType ? item.feeType.title : ''} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.description} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.quantity} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Học phí tăng thêm: ' + (this.state.name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Học phí'],
            content: (
                <>
                    {!lock ? <div className='tile'>
                        <div className='tile-title d-flex justify-content-between'>
                            <h3 className='tile-title'>Chọn gói</h3>
                            <h3><button className='btn btn-primary' style={{ textAlign: 'right' }}
                                onClick={() => this.cartModal.show()}
                            ><i className='fa fa-shopping-cart' aria-hidden='true'>{count ? <span style={{position:'relative', top: '-6px'}} className='badge badge-pill badge-warning'>{count}</span>:null}</i></button></h3>
                        </div> 
                        {table}
                    </div> : null}

                    {cart && cart.length && lock ? <div className='tile'>
                        {<h3 className='tile-title'>{!lock ? 'Thanh toán' : 'Thanh toán (đang chờ thanh toán)'}</h3>}
                        {tableUser}

                        <div className='d-flex justify-content-between'>
                            <p className={lock ? 'invisible' : 'visible'}>Số tiền thanh toán: <b>{T.numberDisplay(soTienThanhToan)} đồng</b></p>
                            {!lock ? <button className='btn btn-success' style={{ textAlign: 'right' }}
                                onClick={() => this.modal.show(this.state)}
                            >Thanh toán</button> :
                                <button className='btn btn-danger' style={{ textAlign: 'right' }}
                                    onClick={() => T.confirm('Xóa gói học phí chờ thanh toán', 'Bạn có chắc bạn chưa thanh toán và muốn huỷ gói học phí này ?', true, isConfirm => {
                                        isConfirm && this.cancelModal.show();
                                    })}
                                >Hủy</button>
                            }
                        </div>
                    </div> : null}
                    {lock ? <div className='tile'>
                        <h3 className='tile-title'>Thông tin thanh toán</h3>
                        <div className='tile-body'>
                            <FormTextBox ref={e => this.itemBankName = e} type='text' label='Tên ngân hàng' readOnly={true} />
                            <div className='d-flex justify-content-between'>
                                <FormTextBox ref={e => this.itemAccounts = e} type='text' label='Số tài khoản' readOnly={true} />
                                <CopyToClipboard text={accounts && accounts.number ? accounts.number : ''}
                                    onCopy={() => T.notify('Đã copy', 'success')}>
                                    <span><i className='fa fa-clone'></i></span>
                                </CopyToClipboard>
                            </div>
                            <FormTextBox ref={e => this.itemAccountsUser = e} type='text' label='Chủ tài khoản' readOnly={true} />
                            <div className='d-flex justify-content-between'>
                                <FormTextBox ref={e => this.itemFee = e} type='text' label='Số tiền' readOnly={true} />
                                <CopyToClipboard text={soTienThanhToan}
                                    onCopy={() => T.notify('Đã copy', 'success')}>
                                    <span><i className='fa fa-clone'></i></span>
                                </CopyToClipboard>
                            </div>
                            <div className='d-flex justify-content-between'>
                                <FormTextBox ref={e => this.itemContentSyntaxExtra = e} type='text' label='Cú pháp chuyển khoản' readOnly={true} />
                                <CopyToClipboard text={contentSyntaxExtra ? contentSyntaxExtra : ''}
                                    onCopy={() => T.notify('Đã copy', 'success')}>
                                    <span><i className='fa fa-clone'></i></span>
                                </CopyToClipboard>
                            </div>
                        </div>
                    </div> : null}
                    <PaymentInfoModal fee={soTienThanhToan} code={this.state.code} nameBank={this.state.nameBank} accounts={this.state.accounts} accountsNumber={accounts && accounts.number} contentSyntaxExtra={contentSyntaxExtra} readOnly={true} updateStudent={this.props.updateStudent} cart={cart} transactionId={transactionId} studentId={studentId} ref={e => this.modal = e} />
                    <CartModal fee={soTienThanhToan} updateState={this.updateState} defaultContentSyntaxExtra={this.state.defaultContentSyntaxExtra} count={count} student={this.state.student} showPayment={this.modal && this.modal.show}  lock={lock} contentSyntaxExtra={contentSyntaxExtra} readOnly={true} updateStudent={this.props.updateStudent} cart={cart} transactionId={transactionId} studentId={studentId} ref={e => this.cartModal = e} />
                    <CancelPaymentModal  readOnly={true} updateStudent={this.props.updateStudent} cart={cart} transactionId={transactionId} studentId={studentId} ref={e => this.cancelModal = e} />
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, courseFee: state.accountant.courseFee });
const mapActionsToProps = { getCourseByStudent, getBankByStudent, getCourseFeeByStudent, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserPaymentInfo);
