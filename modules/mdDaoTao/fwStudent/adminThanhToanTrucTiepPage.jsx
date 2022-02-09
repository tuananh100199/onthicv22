import React from 'react';
import { connect } from 'react-redux';
import { getStudent, addStudentPayment } from './redux';
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

class ThanhToanTrucTiepPage extends AdminPage {
    state = { showOfficial: false, showExtra: false, data: {}, soTienThanhToan: 0, soTienDong: 0 };
    componentDidMount() {
        T.ready('/user/student/debt', () => {
            const route = T.routeMatcher('/user/student/payment/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ userId: _id });
            this.props.getStudent(_id, data => {
                if (data)
                    this.setState({ data });
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

    render() {
        const student = this.state.data;
        const { showExtra, showOfficial } = this.state;
        const name = (student ? (student.lastname + ' ' + student.firstname) : '');
        const studentId = student ? student._id : '';
        const soTienThanhToan = this.state.soTienThanhToan;
        const userId = this.props.system && this.props.system.user && this.props.system.user._id;
        const dataCourseFeeType = [{ id: 0, text: 'Học phí chính thức' }];
        const { courseFee, discount, coursePayment, ngayHetHanNopHocPhi, lichSuDongTien } = student;
        const list = [],
            numOfPayments = coursePayment ? coursePayment.numOfPayments : 1;
        const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        const hocPhiConLai = courseFee && courseFee.fee && courseFee.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((discount && discount.fee) ? discount.fee : 0);
        const hocPhi = courseFee && courseFee.fee && courseFee.fee - ((discount && discount.fee) ? discount.fee : 0);
        if(lichSuDongTien){
            for (let i = 1; i <= lichSuDongTien.length; i++) {
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
            <div className='tile'>
                <h3 className='tile-title'>Thanh toán gói học phí tăng thêm</h3>
                <div className='tile-body row'>
                    <label className='col-md-6'>Học viên: <b>{name}</b></label>
                    <label className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : 'Chưa có khóa học'}</b></label>
                </div>
            </div>
        );
        return this.renderPage({
            icon: 'fa fa-money', // select icon
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
            </>,
            backRoute: '/user/student/debt'
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getStudent, addStudentPayment };
export default connect(mapStateToProps, mapActionsToProps)(ThanhToanTrucTiepPage);
