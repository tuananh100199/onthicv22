import React from 'react';
import { connect } from 'react-redux';
import { getCar, exportCarCalendar } from '../redux';
import { AdminPage, CirclePageButton, AdminModal, FormDatePicker, FormTextBox, renderTable, TableCell } from 'view/component/AdminPage';
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
            title: 'Giáo viên phụ trách xe',
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
    
    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'fuel']),
            car = this.props.car && this.props.car.item,
            list = car && car.calendarHistory && car.calendarHistory.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
        const table = renderTable({
                getDataSource: () => list && list.filter(item => item.course == null),
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Biển số xe</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Giáo viên phụ trách xe</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đào tạo</th>
                        <th style={{ width: '100%' }} nowrap='true'>Cơ sở đào tạo</th>
                        <th style={{ width: '100%' }} nowrap='true'>Thời gian bắt đầu</th>
                        <th style={{ width: '100%' }} nowrap='true'>Thời gian kết thúc</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={car.licensePlates} url={'/user/car/history-calendar/' + car._id} />
                        <TableCell type='text' content={car.brand && car.brand.title} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={car.courseType && car.courseType.title} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={car.division ? car.division.title : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item && item.thoiGianBatDau ? T.dateToText(item.thoiGianBatDau, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item && item.thoiGianKetThuc ? T.dateToText(item.thoiGianKetThuc, 'dd/mm/yyyy') : ''} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} />
                    </tr >),
            });
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Giáo viên phụ trách xe: ' + (car && car.licensePlates),
            breadcrumb: ['Giáo viên phụ trách xe'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <HistoryCalendarEditModal readOnly={!permission.fuel} ref={e => this.modal = e} data={this.state.data} />
                <CirclePageButton type='export' onClick={() => exportCarCalendar(this.state.data._id)} />
            </>,
            backRoute: '/user/car/history-calendar',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCar };
export default connect(mapStateToProps, mapActionsToProps)(HistoryCalendarEditPage);
