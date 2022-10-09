import React from 'react';
import { connect } from 'react-redux';
import { createCar, addCarFuel, deleteCarElement, deleteCar, getCar, exportFuelCar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/fuel';

class CarFuelModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { date, fee, quantity, donGia, diSaHinh, diDuong, diDangKiem, soKMDau, soKMCuoi, tongGioDay  } = item || { _id: null,donGia:'', licensePlates: '', fee: '', quantity: '' },
            { licensePlates, _id } = this.props.data,
            fuelId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayTiepNhienLieu.value(date ? date : new Date());
        this.itemSoLuong.value(quantity);
        this.itemDonGia.value(donGia);
        this.itemChiPhi.value(fee);
        this.itemDiSaHinh.value(diSaHinh);
        this.itemDiDuong.value(diDuong);
        this.itemDiDangKiem.value(diDangKiem);
        this.itemSoKMDau.value(soKMDau);
        this.itemSoKMCuoi.value(soKMCuoi);
        this.itemTongGioDay.value(tongGioDay);
        this.setState({ _id, fuelId });
    }

    onSubmit = () => {
        const data = {
            date: this.itemNgayTiepNhienLieu.value(),
            fee: this.itemChiPhi.value(),
            quantity: this.itemSoLuong.value(),
            fuelId: this.state.fuelId,
            donGia: this.itemDonGia.value(),
            diSaHinh: this.itemDiSaHinh.value(),
            diDuong: this.itemDiDuong.value(),
            diDangKiem: this.itemDiDangKiem.value(),
            soKMDau: this.itemSoKMDau.value(),
            soKMCuoi: this.itemSoKMCuoi.value(),
            tongGioDay: this.itemTongGioDay.value(),
        };
        if (data.fee == '' && data.quantity == '') {
            T.notify('Chi phí không được trống!', 'danger');
            this.itemChiPhi.focus();
        } else if (data.donGia == '') {
            T.notify('Đơn giá không được trống!', 'danger');
            this.itemDonGia.focus();
        } else if (data.itemSoLuong == '') {
            T.notify('Số lượng không được trống!', 'danger');
            this.itemSoLuong.focus();
        } else if (data.fee == '') {
            T.notify('Thành tiền không được trống!', 'danger');
            this.itemDonGia.focus();
        } else {
            this.props.update(this.state._id, data, this.hide());
        }
    }

    calculateFee = () => {
        if(this.itemDonGia && this.itemSoLuong && this.itemDonGia.value() && this.itemSoLuong.value()){
            this.itemChiPhi.value(parseInt(this.itemDonGia.value())*parseInt(this.itemSoLuong.value()));
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý cấp phát nhiên liệu',
            size:'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormDatePicker className='col-md-6' ref={e => this.itemNgayTiepNhienLieu = e} label='Ngày tiếp nhiên liệu' readOnly={readOnly} type='date-mask' />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemSoLuong = e} label='Số lượng xăng (L)' onChange={this.calculateFee} readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemDonGia = e} label='Đơn giá (VND/L)' onChange={this.calculateFee} readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemChiPhi = e} label='Chi phí tiếp nhiên liệu' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemDiSaHinh = e} label='Đi sa hình (giờ)' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemDiDuong = e} label='Đi đường (giờ)' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemDiDangKiem = e} label='Đi đăng kiểm (giờ)' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemSoKMDau = e} label='Số km đầu' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemSoKMCuoi = e} label='Số km cuối' readOnly={readOnly} />
                    <FormTextBox className='col-md-4' type='number' ref={e => this.itemTongGioDay = e} label='Tổng giờ dạy' readOnly={readOnly} />
                    
                </div>
        });
    }
}

class CarFuelPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/fuel/:_id').parse(window.location.pathname);
            if (params._id) {
                this.props.getCar(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy thông tin xe bị lỗi!', 'danger');
                        this.props.history.push(adminPageLink);
                    } else if (data) {
                        this.setState({ data });
                    } else {
                        T.notify('Không tìm thấy thông tin xe!', 'danger');
                        this.props.history.push(adminPageLink);
                    }
                });
            } else {
                this.props.history.push(adminPageLink);
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử tiếp nhiên liệu', `Bạn có chắc muốn xoá lịch sử tiếp nhiên liệu ngày ${T.dateToText(item.date, 'dd/mm/yyyy')}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _fuelId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'fuel']),
            car = this.props.car && this.props.car.item,
            list = car && car.fuel && car.fuel.sort((a, b) => new Date(b.date) - new Date(a.date));
        let total = 0;
        if (list && list.length) {
            for (let i = 0; i < list.length; i++) {
                total += list[i].quantity;
            }
        }
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý cấp phát nhiên liệu: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý cấp phát nhiên liệu'],
            content: <>
                <div className='tile'>
                    {list && list.length ?
                        <ul style={{ paddingLeft: 12, listStyleType: 'none' }}>
                            <li key={0}>Tổng số lượng xăng đã đổ: {total} (L) </li>
                            {list.map((item, index) => (
                                <li key={index} className='d-flex'>
                                    {index + 1}. &nbsp;
                                    <a href='#' className='text-secondary d-inline' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                        <div className='pl-2'>
                                            <span style={{ fontSize: '1rem' }}>
                                                Ngày tiếp nhiên liệu: {T.dateToText(item.date, 'dd/mm/yyyy')}
                                            </span>
                                            {item.fee ? <span>- Chi phí: {T.numberDisplay(item.fee) + ' đồng'} &nbsp;</span> : null}
                                            {item.quantity ? <span>- Số lượng xăng: {item.quantity + ' lít'} &nbsp;</span> : null}
                                        </div>
                                    </a>
                                    {permission.fuel ? <a href='#' className='notification-button text-danger ml-4' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarFuelModal readOnly={!permission.fuel} ref={e => this.modal = e} data={this.state.data} update={this.props.addCarFuel} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => exportFuelCar(this.state.data._id)} />
            </>,
            backRoute: permission.write ? '/user/car/manager' : '/user/car',
            onCreate: permission.fuel ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarFuel, deleteCarElement };
export default connect(mapStateToProps, mapActionsToProps)(CarFuelPage);
