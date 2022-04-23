import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, exportRepairCarPage, addCarRepair } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormDatePicker, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormRichTextBox, TableHead,TableHeadCell } from 'view/component/AdminPage';
import T from 'view/js/common';

class CarRepairModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { licensePlates, _id } = item || { _id: null, licensePlates: '' },
            list = item && item.repair && item.repair.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart)),
            current = list && list[0],
            { dateStart, dateEnd, fee, content } = current || { dateStart: '', dateEnd: '', fee: '', content: '' },
            repairId = current && current._id;

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

class CarRepairPage extends AdminPage {
    state = { searchText: '', isSearching: false, isAll: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        this.props.getCarPage( 1, null, {status: {$ne: 'daThanhLy'}}, {}, {}, (data) => {
            const listLicensePlates = [];
            const list = data && data.list;
            list.forEach(car => {
                if(car.fuel && car.fuel.length){
                    listLicensePlates.push({id: car.licensePlates, text: car.licensePlates});
                }
            });
            this.props.getCategoryAll('car', null, (items) =>
            this.setState({ listLicensePlates, brandTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        });
        this.props.getAllLecturer(data => {
            if (data && data.length) {
                const listLecturer = [{ id: 0, text: 'Trống' }];
                data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname }));
                this.setState({ listLecturer });
            }
        });
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item.car ? item.car : item);

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
        const {brandTypes, listLicensePlates} = this.state;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        let data = [];
        list && list.length && list.forEach(car => {
        const sortArr = car && car.repair && car.repair.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
            sortArr.forEach((repair) => {
                data.push({ car, repair });
            });
        });
        list = data;
        const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getCarPage}>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHeadCell name='licensePlates' filter='select' filterData = {listLicensePlates} style={{ width: '100%' }} nowrap='true'>Biển số xe</TableHeadCell>
                    <TableHeadCell name='brand' filter='select' filterData = {brandTypes} style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</TableHeadCell>
                    <th style={{ width: 'auto' }} nowrap='true'>Người quản lý</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày bắt đầu sửa chữa</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car ? item.car.licensePlates : item.licensePlates} />
                    <TableCell type='text' content={item.car ? (item.car.brand && item.car.brand.title) : item.brand && item.brand.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car ? (item.car.user && (item.car.user.lastname + ' ' + item.car.user.firstname)) : item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car ? T.dateToText(item.repair.dateStart, 'dd/mm/yyyy') : (item.repair && item.repair.length ? T.dateToText((item.repair.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart)) && item.repair.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart))[0].dateStart), 'dd/mm/yyyy') : '')} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-wrench',
            title: 'Xe sữa chữa, thanh lý',
            breadcrumb: ['Xe sữa chữa, thanh lý'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
                <CarRepairModal readOnly={!permission.write} ref={e => this.modal = e} brandTypes={this.state.brandTypes} update={this.props.addCarRepair} updateCar={this.props.updateCar} />
                <CirclePageButton type='export' onClick={() => exportRepairCarPage()} />
            </>,
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll, addCarRepair };
export default connect(mapStateToProps, mapActionsToProps)(CarRepairPage);
