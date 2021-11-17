import React from 'react';
import { connect } from 'react-redux';
import { createCar, addCarPractice, deleteCarElement, deleteCar, getCar, exportPracticeCar, updateCar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/registration';

class CarPracticeModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { ngayDangKy, fee, ngayHetHanDangKy, progress } = item || { _id: null, licensePlates: '', fee: '', progress: '' },
            { licensePlates, _id } = this.props.data,
            practiceId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayDangKy.value(ngayDangKy ? ngayDangKy : new Date());
        this.itemNgayHetHanDangKy.value(ngayHetHanDangKy);
        this.itemChiPhi.value(fee);
        this.itemProgress.value(progress);
        this.setState({ _id, practiceId });
    }

    onSubmit = () => {
        const data = {
            ngayDangKy: this.itemNgayDangKy.value(),
            fee: this.itemChiPhi.value(),
            practiceId: this.state.practiceId,
            ngayHetHanDangKy: this.itemNgayHetHanDangKy.value(),
            progress: this.itemProgress.value()
        };
        if (data.fee == '') {
            T.notify('Chi phí không được trống!', 'danger');
            this.itemChiPhi.focus();
        } else {
            this.props.update(this.state._id, data, () => {
                this.props.getCar(this.state._id, data => {
                    if (data && data.lichSuDangKy && data.lichSuDangKy.length) {
                        const listlichSuDangKy = data.lichSuDangKy.sort((a, b) => new Date(b.date) - new Date(a.date)),
                            current = listlichSuDangKy[0];
                        if (current && current.ngayHetHanDangKy) {
                            this.props.updateCar(this.state._id, { ngayHetHanTapLai: current.ngayHetHanDangKy });
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
            title: 'Quản lý lịch sử đăng ký xe tập lái',
            body:
                <>
                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                    <FormTextBox ref={e => this.itemProgress = e} label='Tiến độ' readOnly={readOnly} />
                    <FormTextBox type='number' ref={e => this.itemChiPhi = e} label='Chi phí đăng ký' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayDangKy = e} label='Ngày đăng ký' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKy = e} label='Ngày hết hạn đăng ký xe tập lái tiếp theo' readOnly={readOnly} type='date-mask' />
                </>
        });
    }
}

class CarRegistrationPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/practice/:_id').parse(window.location.pathname);
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

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử đăng ký', `Bạn có chắc muốn xoá lịch sử đăng ký ngày ${T.dateToText(item.date, 'dd/mm/yyyy')}?`, true, isConfirm =>
        isConfirm && this.props.deleteCarElement(this.state.data._id, { _practiceId: item._id }));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'practice']),
            car = this.props.car && this.props.car.item,
            list = car && car.lichSuDangKy && car.lichSuDangKy.sort((a, b) => new Date(b.ngayDangKy) - new Date(a.ngayDangKy));
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý lịch sử đăng ký: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý lịch sử đăng ký'],
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
                                                Ngày đăng ký: {T.dateToText(item.ngayDangKy, 'dd/mm/yyyy')}
                                                - Chi phí: {T.numberDisplay(item.fee) + ' đồng'} &nbsp;
                                            </span>
                                            {<span style={{ fontSize: '1rem', marginRight: '1rem' }}>- Tiến độ: {item.progress ? item.progress : 'Chưa xử lý'} </span>}
                                        </div>
                                    </a>
                                    {permission.practice ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <CarPracticeModal readOnly={!permission.practice} ref={e => this.modal = e} data={this.state.data} update={this.props.addCarPractice} updateCar={this.props.updateCar} getCar={this.props.getCar} />
                <CirclePageButton type='export' style={{ right: '70px' }} onClick={() => exportPracticeCar(this.state.data && this.state.data._id)} />
            </>,
            backRoute: '/user/car/practice',
            onCreate: permission.practice ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, deleteCar, createCar, addCarPractice, deleteCarElement, updateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarRegistrationPage);
