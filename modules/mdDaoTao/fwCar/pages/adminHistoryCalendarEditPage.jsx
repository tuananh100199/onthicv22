import React from 'react';
import { connect } from 'react-redux';
import { getCar, addCarCalendar, deleteCarCalendar, exportCarCalendar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox } from 'view/component/AdminPage';
import T from 'view/js/common';

const adminPageLink = 'user/car/history-calendar';

class HistoryCalendarEditModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { thoiGianKetThuc, thoiGianBatDau } = item || { _id: null },
            { licensePlates, _id } = this.props.data,
            user = item && item.user,
            calendarHistoryId = item && item._id;
        this.itemLicensePlates.value(licensePlates);
        this.itemUser.value(user ? user.lastname + ' ' + user.firstname : 'Trống');
        this.itemNgayKetThuc.value(thoiGianKetThuc ? thoiGianKetThuc : null);
        this.itemNgayBatDau.value(thoiGianBatDau ? thoiGianBatDau : null);
        this.setState({ _id, calendarHistoryId });
    }

    onSubmit = () => {
        const data = {
            user: this.itemUser.value(),
            calendarHistoryId: this.state.calendarHistoryId,
        };
        this.props.update(this.state._id, data, this.hide());
    }

    render = () => {
        return this.renderModal({
            title: 'Quản lý lịch sử lịch xe',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <FormTextBox className='col-md-4' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={true} />
                        <FormTextBox className='col-md-4' ref={e => this.itemUser = e} label='Giáo viên' readOnly={true} />
                        <FormDatePicker ref={e => this.itemNgayBatDau = e} className='col-md-6' label='Ngày bắt đầu' readOnly={true} type='date-mask' />
                        <FormDatePicker ref={e => this.itemNgayKetThuc = e} className='col-md-6' label='Ngày kết thúc' readOnly={true} type='date-mask' />
                    </div >
                </>
        });
    }
}

class HistoryCalendarEditPage extends AdminPage {
    state = { searchText: '', isSearching: false, data: {} };

    componentDidMount() {
        T.ready('/user/car', () => {
            const params = T.routeMatcher('/user/car/history-calendar/:_id').parse(window.location.pathname);
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

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch sử lịch xe', 'Bạn có chắc muốn xoá lịch sử lịch xe này không?', true, isConfirm =>
        isConfirm && this.props.deleteCarCalendar(this.state.data._id, item._id));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'fuel']),
            car = this.props.car && this.props.car.item,
            list = car && car.calendarHistory && car.calendarHistory.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý lịch sử lịch xe: ' + (car && car.licensePlates),
            breadcrumb: ['Quản lý lịch sử lịch xe'],
            content: <>
                <div className='tile'>
                    {list && list.length ?
                        <ul style={{ paddingLeft: 12, listStyleType: 'none' }}>
                            {list.map((item, index) => (
                                <li key={index} className='d-flex'>
                                    {index + 1}. &nbsp;
                                    <a href='#' className='text-secondary d-inline' onClick={e => e.preventDefault() || this.modal.show(item)}>
                                        <div className='pl-2'>
                                            <span style={{ fontSize: '1rem' }}>Giáo viên: <b>{item && item.user  ? item.user.lastname + ' ' + item.user.firstname : 'Trống'}</b> </span>
                                            <p className='text-muted'>Thời gian bắt đầu: {item && item.thoiGianBatDau ? T.dateToText(item.thoiGianBatDau, 'dd/mm/yyyy') : ''}</p>
                                            <p className='text-muted'>Thời gian kết thúc: {item && item.thoiGianKetThuc ? T.dateToText(item.thoiGianKetThuc, 'dd/mm/yyyy') : ''}</p>
                                        </div>
                                    </a>
                                    {permission.fuel ? <a href='#' className='notification-button text-danger' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a> : null}
                                </li>))}
                        </ul> : 'Chưa có thông tin!'}
                </div>
                <HistoryCalendarEditModal readOnly={!permission.fuel} ref={e => this.modal = e} update={this.props.addCarCalendar} data={this.state.data} />
                <CirclePageButton type='export' onClick={() => exportCarCalendar(this.state.data._id)} />
            </>,
            backRoute: '/user/car/history-calendar',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar, addCarCalendar, deleteCarCalendar };
export default connect(mapStateToProps, mapActionsToProps)(HistoryCalendarEditPage);
