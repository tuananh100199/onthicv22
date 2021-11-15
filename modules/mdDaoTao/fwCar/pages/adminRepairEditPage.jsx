import React from 'react';
import { connect } from 'react-redux';
import { createCar, addCarRepair, deleteCarElement, deleteCar, getCar, exportRepairCar, updateCar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox, FormRichTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/repair';

class CarRepairModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { dateStart, dateEnd, fee, content } = item || { _id: null, licensePlates: '', fee: '' },
            { licensePlates, _id } = this.props.data,
            repairId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgaySuaChua.value(dateStart ? dateStart : new Date());
        this.itemNgayHoanThanh.value(dateEnd);
        this.itemChiPhi.value(fee);
        this.itemNoiDungSuaChua.value(content);
        this.setState({ _id, repairId });
    }

    onSubmit = () => {
        const data = {
            dateStart: this.itemNgaySuaChua.value(),
            dateEnd: this.itemNgayHoanThanh.value(),
            fee: this.itemChiPhi.value(),
            content: this.itemNoiDungSuaChua.value(),
            repairId: this.state.repairId
        };
        if (data.content == '') {
            T.notify('Nội dung sửa chữa không được trống!', 'danger');
            this.itemNoiDungSuaChua.focus();
        } else {
            this.props.update(this.state._id, data, () => {
                this.props.updateCar(this.state._id, { status: 'dangSuaChua' }, this.hide());
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý sửa chữa xe ô tô',
            body:
                <>
                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí sửa chữa' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgaySuaChua = e} label='Ngày sửa chữa' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHoanThanh = e} label='Ngày hoàn thành' readOnly={readOnly} type='date-mask' />
                    <FormRichTextBox ref={e => this.itemNoiDungSuaChua = e} label='Nội dung sửa chữa' readOnly={readOnly} />
                </>
        });
    }
}

class CarRepairCompleteModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { dateStart, dateEnd, fee, content } = item || { _id: null, licensePlates: '', fee: '' },
            { licensePlates, _id } = this.props.data,
            repairId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgaySuaChua.value(dateStart ? dateStart : new Date());
        this.itemNgayHoanThanh.value(dateEnd);
        this.itemChiPhi.value(fee);
        this.itemNoiDungSuaChua.value(content);
        this.setState({ _id, repairId });
    }

    onSubmit = () => {
        const data = {
            dateStart: this.itemNgaySuaChua.value(),
            dateEnd: this.itemNgayHoanThanh.value(),
            fee: this.itemChiPhi.value(),
            content: this.itemNoiDungSuaChua.value(),
            repairId: this.state.repairId
        };
        if (data.content == '') {
            T.notify('Nội dung sửa chữa không được trống!', 'danger');
            this.itemNoiDungSuaChua.focus();
        } else if (!data.fee || data.fee == '') {
            T.notify('Chi phí sửa chữa không được trống!', 'danger');
            this.itemChiPhi.focus();
        } else if (!data.dateEnd || data.dateEnd == '') {
            T.notify('Ngày hoàn thành không được trống!', 'danger');
            this.itemNgayHoanThanh.focus();
        } else {
            this.props.update(this.state._id, data, () => {
                this.props.updateCar(this.state._id, { status: 'dangSuDung' }, this.hide());
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Hoàn thành sửa chữa xe',
            body:
                <>
                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí sửa chữa' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgaySuaChua = e} label='Ngày sửa chữa' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHoanThanh = e} label='Ngày hoàn thành' readOnly={readOnly} type='date-mask' />
                    <FormRichTextBox ref={e => this.itemNoiDungSuaChua = e} label='Nội dung sửa chữa' readOnly={readOnly} />
                </>
        });
    }
}

class CarRepairEditPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/repair/:_id').parse(window.location.pathname);
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
    complete = (e, item) => e.preventDefault() || this.completeModal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử sửa chữa', `Bạn có chắc muốn xoá lịch sử sửa chữa ngày ${T.dateToText(item.date, 'dd/mm/yyyy')}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _repairId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete']),
            car = this.props.car && this.props.car.item,
            list = car && car.repair && car.repair.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
        return this.renderPage({
            icon: 'fa fa-wrench',
            title: 'Quản lý sửa chữa xe ô tô: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý sửa chữa'],
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
                                                Ngày sửa chữa: {T.dateToText(item.dateStart, 'dd/mm/yyyy')} &nbsp;
                                                - Chi phí: {item.fee ? T.numberDisplay(item.fee) + 'đồng' : '_'}  &nbsp;
                                            </span>
                                        </div>
                                    </a>
                                    {permission.write ? <a href='#' className='notification-button text-success' onClick={e => this.complete(e, item)}><i className='fa fa-lg fa-check' />&nbsp;&nbsp;</a> : null}
                                    {permission.write ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarRepairModal readOnly={!permission.write} ref={e => this.modal = e} data={this.state.data} update={this.props.addCarRepair} updateCar={this.props.updateCar} />
                <CarRepairCompleteModal readOnly={!permission.write} ref={e => this.completeModal = e} data={this.state.data} update={this.props.addCarRepair} updateCar={this.props.updateCar} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => exportRepairCar(this.state.data._id)} />
            </>,
            backRoute: permission.write ? '/user/car/manager' : '/user/car',
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarRepair, deleteCarElement, updateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarRepairEditPage);
