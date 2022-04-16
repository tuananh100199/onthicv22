import React from 'react';
import { connect } from 'react-redux';
import { createCar, deleteCar, getCar, addCarCourse, deleteCarElement, exportCourseCar } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { AdminPage, AdminModal, FormDatePicker, FormTextBox, FormSelect, CirclePageButton } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/course';

class CarCourseEditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { name, thoiGianKetThuc, thoiGianBatDau } = item && item.course || { _id: null, name: '' },
            { licensePlates, _id } = this.props.data,
            user = item && item.user,
            courseHistoryId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemName.value(name);
        this.itemUser.value(user ? user._id : '0');
        this.itemNgayKetThucKhoa.value(thoiGianKetThuc ? thoiGianKetThuc : null);
        this.itemNgayBatDauKhoa.value(thoiGianBatDau ? thoiGianBatDau : null);
        this.setState({ _id, courseHistoryId });
    }

    onSubmit = () => {
        const data = {
            user: this.itemUser.value(),
            courseHistoryId: this.state.courseHistoryId,
        };
        this.props.update(this.state._id, data, this.hide());
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý lịch sử đi khóa',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox className='col-md-4' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                        <FormTextBox className='col-md-4' ref={e => this.itemName = e} label='Khóa' readOnly={true} />
                        <FormSelect className='col-md-4' ref={e => this.itemUser = e} label='Chủ xe' data={this.props.dataLecturer} readOnly={readOnly} />
                        <FormDatePicker ref={e => this.itemNgayBatDauKhoa = e} className='col-md-6' label='Ngày kết bắt đầu' readOnly={true} type='date-mask' />
                        <FormDatePicker ref={e => this.itemNgayKetThucKhoa = e} className='col-md-6' label='Ngày kết thúc khóa' readOnly={true} type='date-mask' />
                    </div >
                </>
        });
    }
}

class CarCourseEditPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/course/:_id').parse(window.location.pathname);
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
                this.props.getAllLecturer(data => {
                    if (data && data.length) {
                        const listLecturer = [{ id: 0, text: 'Trống' }];
                        data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname }));
                        this.setState({ listLecturer });
                    }
                });
            } else {
                this.props.history.push(adminPageLink);
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử khóa', `Bạn có chắc muốn xoá lịch sử khóa ${item.course.name}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _courseHistoryId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'fuel']),
            car = this.props.car && this.props.car.item,
            list = car && car.courseHistory && car.courseHistory.sort((a, b) => new Date(b.course && b.course.thoiGianKetThuc) - new Date(a.course && a.course.thoiGianKetThuc));
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý lịch sử đi khóa: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý lịch sử đi khóa'],
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
                                                Khóa: {item && item.course && item.course.name ? item.course.name : ''}
                                                - Thời gian kết thúc: {item && item.course ? T.dateToText(item.course.thoiGianKetThuc, 'dd/mm/yyyy') : ''}
                                            </span>

                                        </div>
                                    </a>
                                    {permission.fuel ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarCourseEditModal readOnly={!permission.fuel} ref={e => this.modal = e} update={this.props.addCarCourse} data={this.state.data} dataLecturer={this.state.listLecturer} />
                <CirclePageButton type='export' onClick={() => exportCourseCar(car._id)} />
                {/* <CirclePageButton type='export' onClick={() => exportFuelCar(this.state.data._id)} /> */}
            </>,
            backRoute: '/user/car/manager',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarCourse, deleteCarElement, getAllLecturer };
export default connect(mapStateToProps, mapActionsToProps)(CarCourseEditPage);
