import React from 'react';
import { connect } from 'react-redux';
import { createCar, addCarRegistration, deleteCarElement, deleteCar, getCar, exportRegistrationCar, updateCar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/registration';

class CarRegistrationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { ngayDangKiem, fee, ngayHetHanDangKiem } = item || { _id: null, licensePlates: '', fee: '' },
            { licensePlates, _id } = this.props.data,
            registrationId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayDangKiem.value(ngayDangKiem ? ngayDangKiem : new Date());
        this.itemNgayHetHanDangKiem.value(ngayHetHanDangKiem);
        this.itemChiPhi.value(fee);
        this.setState({ _id, registrationId });
    }

    onSubmit = () => {
        const data = {
            ngayDangKiem: this.itemNgayDangKiem.value(),
            fee: this.itemChiPhi.value(),
            registrationId: this.state.registrationId,
            ngayHetHanDangKiem: this.itemNgayHetHanDangKiem.value(),
        };
        if (data.fee == '') {
            T.notify('Chi phí không được trống!', 'danger');
            this.itemChiPhi.focus();
        } else {
            this.props.update(this.state._id, data, () => {
                this.props.getCar(this.state._id, data => {
                    if (data && data.lichSuDangKiem && data.lichSuDangKiem.length) {
                        const listLichSuDangKiem = data.lichSuDangKiem.sort((a, b) => new Date(b.date) - new Date(a.date)),
                            current = listLichSuDangKiem[0];
                        if (current && current.ngayHetHanDangKiem) {
                            this.props.updateCar(this.state._id, { ngayHetHanDangKiem: current.ngayHetHanDangKiem });
                        }
                    }
                });
                this.hide();
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý cấp phát nhiên liệu',
            body:
                <>
                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí đăng kiểm' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayDangKiem = e} label='Ngày đăng kiểm' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKiem = e} label='Ngày hết hạn đăng kiểm tiếp theo' readOnly={readOnly} type='date-mask' />
                </>
        });
    }
}

class CarRegistrationPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/registration/:_id').parse(window.location.pathname);
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

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử đăng kiểm', `Bạn có chắc muốn xoá lịch sử đăng kiểm ngày ${T.dateToText(item.date, 'dd/mm/yyyy')}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _registrationId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'registration']),
            car = this.props.car && this.props.car.item,
            list = car && car.lichSuDangKiem && car.lichSuDangKiem.sort((a, b) => new Date(b.ngayDangKiem) - new Date(a.ngayDangKiem));
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý lịch sử đăng kiểm: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý lịch sử đăng kiểm'],
            content: <>
                <div className='tile'>
                    {list && list.length ?
                        <ul style={{ paddingLeft: 12, listStyleType: 'none' }}>
                            {list.map((item, index) => (
                                <li key={index} className='d-flex'>
                                    {index + 1}. &nbsp;
                                    <a href='#' className='text-secondary d-inline' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                        <div className='pl-2'>
                                            <span style={{ fontSize: '1rem' }}>
                                                Ngày đăng kiểm: {T.dateToText(item.ngayDangKiem, 'dd/mm/yyyy')} 
                                                - Chi phí: {T.numberDisplay(item.fee) + ' đồng'}
                                            </span>
                                        </div>
                                    </a>
                                    {/* {permission.registration ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null} */}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarRegistrationModal readOnly={!permission.registration} ref={e => this.modal = e} data={this.state.data} update={this.props.addCarRegistration} updateCar={this.props.updateCar} getCar={this.props.getCar} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => exportRegistrationCar(this.state.data && this.state.data._id)} />
            </>,
            backRoute: '/user/car/registration',
            onCreate: permission.registration ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarRegistration, deleteCarElement, updateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarRegistrationPage);
