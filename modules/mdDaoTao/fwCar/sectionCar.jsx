import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, exportExpiredCar } from './redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormDatePicker, AdminModal, FormTextBox, FormSelect, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import T from 'view/js/common';

class CarModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        console.log(item);
        const { _id, licensePlates, brand, ngayHetHanDangKiem, ngayHetHanTapLai } = item || { _id: null, licensePlates: '', ngayThanhLy: '' };
        this.itemLicensePlates.value(licensePlates);
        this.itemNgayHetHanDangKiem.value(ngayHetHanDangKiem);
        this.itemNgayHetHanTapLai.value(ngayHetHanTapLai);
        this.itemBrand.value(brand ? brand._id : null);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            licensePlates: this.itemLicensePlates.value(),
            brand: this.itemBrand.value(),
            ngayHetHanDangKiem: this.itemNgayHetHanDangKiem.value(),
            ngayHetHanTapLai: this.itemNgayHetHanTapLai.value()
        };
        if (data.licensePlates == '') {
            T.notify('Biển số xe không được trống!', 'danger');
            this.itemLicensePlates.focus();
        } else if (data.brand == '') {
            T.notify('Nhãn hiệu xe không được trống!', 'danger');
            this.itemBrand.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Không tìm thấy xe!', 'error');
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý xe',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemBrand = e} className='col-md-6' data={this.props.brandTypes} label='Nhãn hiệu xe' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKiem = e} className='col-md-6' label='Ngày hết hạn đăng kiểm' readOnly={readOnly} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanTapLai = e} className='col-md-6' label='Ngày hết hạn đăng ký xe tập lái' readOnly={readOnly} type='date-mask' />
                </div >
        });
    }
}

class CarPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        this.props.getCarPage(1, 50, undefined);
        this.props.getAllLecturer(data => {
            if (data && data.length) {
                const listLecturer = [{ id: 0, text: 'Trống' }];
                data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname }));
                this.setState({ listLecturer });
            }
        });
        this.props.getCategoryAll('car', null, (items) =>
            this.setState({ brandTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        const dataCarType = this.props.dataCarType;
        this.setState({ dataCarType });
        this.carType.value(dataCarType[0] && dataCarType[0].id);
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    onSearch = ({ pageNumber, pageSize, carType }, done) => {
        const { dataCarType, isTapLai } = this.props;
        let dateCondition = {}, condition = {};
        if (carType == undefined) carType = dataCarType[0];
        if (carType == 1 || carType == 3) {
            const d = new Date();
            d.setMonth(d.getMonth() + parseInt(carType)); //1 month ago
            dateCondition = {
                $lt: d,
                $gte: new Date()
            };
        } else if (carType == -1) {
            dateCondition = {
                $lt: new Date(),
            };
        }
        condition = isTapLai ? { ngayHetHanTapLai: dateCondition } : { ngayHetHanDangKiem: dateCondition };
        this.setState({ isSearching: true }, () => this.props.getCarPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ isSearching: false, condition, carType });
            done && done(page);
        }));
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá xe này?', true, isConfirm =>
        isConfirm && this.props.deleteCar(item._id));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
        const { dataCarType, title, isTapLai } = this.props;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const header = <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Loại xe:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.carType = e} data={dataCarType} onChange={value => this.onSearch({ carType: value.id })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>;
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Biển số xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Chủ xe</th>
                    <th style={{ width: '100%' }} nowrap='true'>{title}</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licensePlates} />
                    <TableCell type='text' content={item.brand && item.brand.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(isTapLai ? item.ngayHetHanTapLai : item.ngayHetHanDangKiem, 'dd/mm/yyyy')} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr >),
        });
        return this.renderPage({
            icon: isTapLai ? 'fa fa-road' : 'fa fa-file-text-o',
            title: isTapLai ? 'Đăng ký xe tập lái' : 'Đăng kiểm xe',
            header: header,
            breadcrumb: isTapLai ? ['Đăng ký xe tập lái'] : ['Đăng kiểm xe'],
            content: <>
                <div className='tile'>
                    <p>Số lượng xe: {totalItem}</p>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
                <CarModal readOnly={!permission.write} ref={e => this.modal = e} brandTypes={this.state.brandTypes} create={this.props.createCar} dataCarType={dataCarType} update={this.props.updateCar} dataLecturer={this.state.listLecturer} />
                <CirclePageButton type='export' onClick={() => exportExpiredCar(isTapLai ? 0 : 1, this.state.carType)} />
            </>,
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
