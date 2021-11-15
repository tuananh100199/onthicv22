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
        const { date, fee } = item || { _id: null, licensePlates: '', fee: '' },
            { licensePlates, _id } = this.props.data,
            fuelId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayTiepNhienLieu.value(date ? date : new Date());
        this.itemChiPhi.value(fee);
        this.setState({ _id, fuelId });
    }

    onSubmit = () => {
        const data = {
            date: this.itemNgayTiepNhienLieu.value(),
            fee: this.itemChiPhi.value(),
            fuelId: this.state.fuelId
        };
        if (data.fee == '') {
            T.notify('Chi phí không được trống!', 'danger');
            this.itemBrand.focus();
        } else {
            this.props.update(this.state._id, data, this.hide());
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý cấp phát nhiên liệu',
            body:
                <>
                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí tiếp nhiên liệu' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayTiepNhienLieu = e} label='Ngày tiếp nhiên liệu' readOnly={readOnly} type='date-mask' />
                </>
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
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý cấp phát nhiên liệu: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý cấp phát nhiên liệu'],
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
                                                Ngày tiếp nhiên liệu: {T.dateToText(item.date, 'dd/mm/yyyy')}
                                                - Chi phí: {T.numberDisplay(item.fee) + ' đồng'} &nbsp;
                                            </span>
                                        </div>
                                    </a>
                                    {permission.fuel ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
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
