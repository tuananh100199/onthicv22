import React from 'react';
import { connect } from 'react-redux';
import { getStudent, addStudentPayment, addStudentPaymentExtra, updateStudent } from './redux';
import { getCourseFeeByStudent } from 'modules/_default/fwCourseFee/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormSelect, FormTextBox, renderTable, TableCell, FormCheckbox, AdminModal } from 'view/component/AdminPage';

class PaymentInfoModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = () => {
        const { name, courseFeeName, fee } = this.props || { name: '', courseFeeName: ''};
        this.itemName.value(name);
        this.itemCourseFeeName.value(courseFeeName);
        this.itemFee.value(fee ? T.numberDisplay(fee) + ' đồng' : 0);
    }

    render = () => this.renderModal({
        title: 'Thanh toán học phí',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <FormTextBox ref={e => this.itemName = e} type='text' label='Tên học viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemCourseFeeName = e} type='text' label='Tên gói học phí' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemFee = e} type='text' label='Số tiền đóng' readOnly={this.props.readOnly} />
                </div>
            </div>),
        buttons:
            <a className='btn btn-warning' href='#' onClick={e => {
                e.preventDefault();
                let { studentId } = this.props;
                this.props.addStudentPayment(studentId, {fee: this.props.fee, user: this.props.userId}, this.props.hocPhi, this.props.hocPhiConLai, () => {
                    this.hide();
                    window.location.reload();
                });
            }} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Xác nhận đã thanh toán
            </a>
    });
}

class PaymentExtraInfoModal extends AdminModal {
    state = { copied: false };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { name, fee } = item || { name: ''};
        this.itemName.value(name);
        this.itemCourseFeeName.value('Thanh toán gói học phí tăng thêm');
        this.itemFee.value(fee ? T.numberDisplay(fee) + ' đồng' : 0);
    }

    render = () => this.renderModal({
        title: 'Thanh toán học phí',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <FormTextBox ref={e => this.itemName = e} type='text' label='Tên học viên' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemCourseFeeName = e} type='text' label='Tên gói học phí' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemFee = e} type='text' label='Số tiền đóng' readOnly={this.props.readOnly} />
                </div>
            </div>),
        buttons:
            <a className='btn btn-warning' href='#' onClick={e => {
                e.preventDefault();
                this.props.addStudentPaymentExtra(this.props.studentId, () => {
                    this.hide();
                    window.location.reload();
                });
            }} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Xác nhận đã thanh toán
            </a>
    });
}

class CartModal extends AdminModal {
    state= {};
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = () => {
        this.setState({ cart: this.props.cart, student: this.props.student});
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
        let { count } = this.props;
        let cart = this.state.cart;
        const { _id } = this.props.student;
        T.confirm('Xóa khỏi danh sách thanh toán', 'Bạn có chắc bạn muốn xóa gói học này?', true, isConfirm => {
            if (isConfirm) {
                cart = cart.filter(courseFee => courseFee._id != item._id);
                let transactionId = this.makeId(5);
                this.setState({
                    transactionId,
                    cart,
                    count: count - parseInt(item.quantity),
                }, () => {
                    this.props.updateState({ transactionId, cart, count: count - parseInt(item.quantity)});
                    this.props.updateStudent(_id, { cart: { transactionId, item: cart } });
                });
            }
        });
    }

    render = () => {
        const lock = this.props.lock;
        const cart = this.state.cart;
        const fee = cart && cart.length ? cart.reduce((result,item) => result + parseInt(item.fees) , 0) : 0;
        const name = this.state.student && this.state.student.lastname ? (this.state.student.lastname + ' ' + this.state.student.firstname) : '';
        const tableUser = renderTable({
            getDataSource: () => cart,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                    {!lock ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
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
                    <p>Tổng số tiền gói: {T.numberDisplay(fee) + ' đồng'}</p>
                </div>
            </div>),
        buttons:
        cart && cart.length ? [
            <button key={0} className='btn btn-success' style={{ textAlign: 'right' }}
            onClick={() => {
                this.props.showPayment({ name, fee });
            }}
            >Thanh toán</button>,
            <button key={1} className='btn btn-warning' style={{ textAlign: 'right' }}
                onClick={e => {
                    e.preventDefault();
                    let { cart, studentId, transactionId } = this.props;
                    this.props.updateStudent(studentId, { cart: { item: cart, transactionId, lock: true } }, () => {
                        this.hide();
                        window.location.reload();
                    });
                }}
            >Thanh toán sau</button>] : null,
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

class ThanhToanTrucTiepPage extends AdminPage {
    state = { showOfficial: true, showExtra: false, data: {}, soTienThanhToan: 0, soTienDong: 0, count: 0 };
    componentDidMount() {
        T.ready('/user/student/debt', () => {
            const route = T.routeMatcher('/user/student/payment/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ userId: _id });
            this.props.getStudent(_id, data => {
                if (data){
                    let count = 0;
                        data.cart && data.cart.item && data.cart.item.forEach(item => count = count + item.quantity);
                        this.setState({
                            ...data.item,
                            cart: data.cart ? data.cart.item : [],
                            count: count,
                            lock: data.cart ? data.cart.lock : false,
                            transactionId: data.cart ? data.cart.transactionId : '',
                            data,
                        });
                    this.props.getCourseFeeByStudent({ courseType: data.courseType && data.courseType._id });
                }
                this.filter.value(0);   
            });
        });
    }

    loadCourseFee = (id) => {
        if (parseInt(id) == 0) {
            this.setState({ showOfficial: true, showExtra: false });
        } else {
            this.setState({ showOfficial: false, showExtra: true });
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
        const { cart = [], count } = this.state;
        const { _id } = this.state.data;
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
        const student = this.state.data;
        const { showExtra, showOfficial, count, cart, transactionId, lock } = this.state;
        const name = (student ? (student.lastname + ' ' + student.firstname) : '');
        const studentId = student ? student._id : '';
        const soTienThanhToan = this.state.soTienThanhToan;
        const userId = this.props.system && this.props.system.user && this.props.system.user._id;
        const dataCourseFeeType = [{ id: 0, text: 'Học phí chính thức' }, {id: 1, text: 'Học phí tăng thêm'}];
        const { courseFee, discount, coursePayment, ngayHetHanNopHocPhi, lichSuDongTien } = student;
        const list = [],
            numOfPayments = coursePayment ? coursePayment.numOfPayments : 1;
        const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        const hocPhiConLai = courseFee && courseFee.fee && courseFee.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((discount && discount.fee) ? discount.fee : 0);
        const hocPhi = courseFee && courseFee.fee && courseFee.fee - ((discount && discount.fee) ? discount.fee : 0);
        if(lichSuDongTien && lichSuDongTien.length > numOfPayments){
            for (let i = 1; i <= lichSuDongTien.length; i++) {
                if (lichSuDongTien && lichSuDongTien[i - 1]) {
                    list.push({ name: 'Thanh toán học phí lần ' + i, fee: lichSuDongTien[i - 1].fee, ngayThanhToan: lichSuDongTien[i - 1].date });
                } else {
                    list.push({ name: 'Thanh toán học phí lần ' + i, fee: (hocPhiConLai ? hocPhiConLai : 0) / (numOfPayments - (lichSuDongTien ? lichSuDongTien.length : 0)) });
                }
    
            }
        } else{
            for (let i = 1; i <= numOfPayments; i++) {
                if (lichSuDongTien && lichSuDongTien[i - 1]) {
                    list.push({ name: 'Thanh toán học phí lần ' + i, fee: lichSuDongTien[i - 1].fee, ngayThanhToan: lichSuDongTien[i - 1].date });
                } else {
                    list.push({ name: 'Thanh toán học phí lần ' + i, fee: (hocPhiConLai ? hocPhiConLai : 0) / (numOfPayments - (lichSuDongTien ? lichSuDongTien.length : 0)) });
                }
    
            }
        }
        if(lichSuDongTien && lichSuDongTien.length >= numOfPayments && hocPhiConLai!=0){
            list.push({ name: 'Thanh toán học phí lần ' + parseInt(lichSuDongTien.length + 1 ), fee: hocPhiConLai });
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
        const listCourseFee = this.props.courseFee && this.props.courseFee.list;
        const listCourseFeeExtra = listCourseFee && listCourseFee.length ? listCourseFee.filter(courseFee => courseFee.feeType && courseFee.feeType.official == false) : [];
        const tableExtra = renderTable({
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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mô tả</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.description} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.quantity} />
                </tr>),
        });
        const official = (
            <div className='tile'>
                <h3 className='tile-title'>Thanh toán gói học phí chính thức</h3>
                <div className='tile-body'>
                    <div className='row'>
                        <label className='col-md-6'>Tên gói: <b>{student && student.courseFee ? student.courseFee.name : ''}</b></label>
                        <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                    </div>
                    {table}
                    <p>Số tiền cần thanh toán: <b>{T.numberDisplay(soTienThanhToan)} đồng</b></p>
                    <div className='d-flex justify-content-between'>
                        <FormTextBox style={{width: '300px'}}  ref={e => this.itemFee = e} onChange={e => this.setState({ soTienDong: e.target.value })} type='number' min={1} label='Số tiền học viên đóng'/>
                        {this.state.soTienDong ? <div><button onClick={() => this.modal.show()} className='btn btn-success'>Thanh toán</button></div> : null}
                    </div>
                    
                </div>
            </div>
        );
        const extra = (
            <>
                {!lock ? <div className='tile'>
                <div className='tile-title d-flex justify-content-between'>
                            <h3 className='tile-title'>Thanh toán gói học phí tăng thêm</h3>
                            <h3><button className='btn btn-primary' style={{ textAlign: 'right' }}
                                onClick={() => this.cartModal.show()}
                            ><i className='fa fa-shopping-cart' aria-hidden='true'>{count ? <span style={{position:'relative', top: '-6px'}} className='badge badge-pill badge-warning'>{count}</span>:null}</i></button></h3>
                        </div>
                <div className='tile-body'>
                    {tableExtra}
                </div>
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
            </>
        );
        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Đóng tiền trực tiếp: ' + name,
            breadcrumb: [<Link key={0} to='/user/student/debt'>Theo dõi công nợ</Link>, 'Đóng tiền trực tiếp'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin học viên</h3>
                    <div className='tile-body row'>
                        <label className='col-md-6'>Học viên: <b>{name}</b></label>
                        <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                        <FormSelect className='col-md-4' ref={e => this.filter = e} label='Chọn gói thanh toán' data={dataCourseFeeType} onChange={data => this.loadCourseFee(data.id)} />
                    </div>
                </div>
                {showOfficial ? official : null}
                {showExtra ? extra : null}
                <PaymentInfoModal fee={this.state.soTienDong} hocPhi={hocPhi} hocPhiConLai={hocPhiConLai} name={name} userId={userId} courseFeeName={student && student.courseFee ? student.courseFee.name : ''} accounts={this.state.accounts} readOnly={true} addStudentPayment={this.props.addStudentPayment} studentId={studentId} ref={e => this.modal = e} />
                <CartModal fee={soTienThanhToan} showPayment={this.paymentExtraModal && this.paymentExtraModal.show} updateState={this.updateState} count={count} student={this.state.data}  lock={lock} readOnly={true} updateStudent={this.props.updateStudent} cart={cart} transactionId={transactionId} studentId={studentId} ref={e => this.cartModal = e} />
                <CancelPaymentModal  readOnly={true}  updateStudent={this.props.updateStudent} cart={cart} transactionId={transactionId} studentId={studentId} ref={e => this.cancelModal = e} />
                <PaymentExtraInfoModal readOnly={true} addStudentPaymentExtra={this.props.addStudentPaymentExtra} studentId={studentId} ref={e => this.paymentExtraModal = e} />
            </>,
            backRoute: '/user/student/debt'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, courseFee: state.accountant.courseFee });
const mapActionsToProps = { getStudent, addStudentPayment, getCourseFeeByStudent, updateStudent, addStudentPaymentExtra };
export default connect(mapStateToProps, mapActionsToProps)(ThanhToanTrucTiepPage);
