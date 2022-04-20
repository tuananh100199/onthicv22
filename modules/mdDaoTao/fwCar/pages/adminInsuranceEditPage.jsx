import React from 'react';
import { connect } from 'react-redux';
import { createCar, addCarInsurance, deleteCarElement, deleteCar, getCar, exportInsuranceCar, updateCar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/insurance';

class CarInsuranceModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { ngayDongBaoHiem, fee, ngayHetHanBaoHiem } = item || { _id: null, licensePlates: '', fee: '' },
            { licensePlates, _id } = this.props.data,
            insuranceId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayDongBaoHiem.value(ngayDongBaoHiem ? ngayDongBaoHiem : new Date());
        this.itemNgayHetHanBaoHiem.value(ngayHetHanBaoHiem);
        this.itemChiPhi.value(fee);
        this.setState({ _id, insuranceId });
    }

    onSubmit = () => {
        const data = {
            ngayDongBaoHiem: this.itemNgayDongBaoHiem.value(),
            fee: this.itemChiPhi.value(),
            insuranceId: this.state.insuranceId,
            ngayHetHanBaoHiem: this.itemNgayHetHanBaoHiem.value(),
        };
        if (data.fee == '') {
            T.notify('Chi phí không được trống!', 'danger');
            this.itemChiPhi.focus();
        } else {
            this.props.update(this.state._id, data, () => {
                this.props.getCar(this.state._id, data => {
                    if (data && data.lichSuDongBaoHiem && data.lichSuDongBaoHiem.length) {
                        const listLichSuDongBaoHiem = data.lichSuDongBaoHiem.sort((a, b) => new Date(b.date) - new Date(a.date)),
                            current = listLichSuDongBaoHiem[0];
                        if (current && current.ngayHetHanBaoHiem) {
                            this.props.updateCar(this.state._id, { ngayHetHanBaoHiem: current.ngayHetHanBaoHiem });
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
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí đóng bảo hiểm' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayDongBaoHiem = e} label='Ngày đóng bảo hiểm' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanBaoHiem = e} label='Ngày hết hạn đóng bảo hiểm tiếp theo' readOnly={readOnly} type='date-mask' />
                </>
        });
    }
}

class CarInsurancePage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/insurance/:_id').parse(window.location.pathname);
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

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử đóng bảo hiểm', `Bạn có chắc muốn xoá lịch sử đóng bảo hiểm ngày ${T.dateToText(item.date, 'dd/mm/yyyy')}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _insuranceId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'insurance']),
            car = this.props.car && this.props.car.item,
            list = car && car.lichSuDongBaoHiem && car.lichSuDongBaoHiem.sort((a, b) => new Date(b.ngayDongBaoHiem) - new Date(a.ngayDongBaoHiem));
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý lịch sử đóng bảo hiểm: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý lịch sử đóng bảo hiểm'],
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
                                                Ngày đóng bảo hiểm: {T.dateToText(item.ngayDongBaoHiem, 'dd/mm/yyyy')}
                                                - Chi phí: {T.numberDisplay(item.fee) + ' đồng'}
                                            </span>
                                        </div>
                                    </a>
                                    {/* {permission.insurance ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null} */}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarInsuranceModal readOnly={!permission.insurance} ref={e => this.modal = e} data={this.state.data} update={this.props.addCarInsurance} updateCar={this.props.updateCar} getCar={this.props.getCar} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => exportInsuranceCar(this.state.data && this.state.data._id)} />
            </>,
            backRoute: '/user/car/insurance',
            onCreate: permission.insurance ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarInsurance, deleteCarElement, updateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarInsurancePage);
