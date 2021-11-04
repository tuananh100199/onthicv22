import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormDatePicker, AdminModal, FormTextBox, FormSelect, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectUser } from 'modules/_default/fwUser/redux';

class CarModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { _id, licensePlates, courseType, user, ngayHetHanDangKiem, brand, division, isPersonalCar } = item || { _id: null, licensePlates: '', ngayHetHanDangKiem: '', brand: '' };

        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
        this.itemLicensePlates.value(licensePlates);
        this.itemUser.value(user ? { id: user._id, text: user.lastname + ' ' + user.firstname } : null);
        this.itemBrand.value(brand);
        this.itemIsPersonalCar.value(isPersonalCar);
        this.itemNgayHetHanDangKiem.value(ngayHetHanDangKiem);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            licensePlates: this.itemLicensePlates.value(),
            courseType: this.itemCourseType.value(),
            user: this.itemUser.value(),
            brand: this.itemBrand.value(),
            isPersonalCar: this.itemIsPersonalCar.value(),
            ngayHetHanDangKiem: this.itemNgayHetHanDangKiem.value(),
            division: this.itemDivision.value()
        };
        if (data.licensePlates == '') {
            T.notify('Biển số xe không được trống!', 'danger');
            this.itemLicensePlates.focus();
        } else if (data.brand == '') {
            T.notify('Nhãn hiệu xe không được trống!', 'danger');
            this.itemBrand.focus();
        } else if (!data.courseType) {
            T.notify('Hạng đăng ký không được trống!', 'danger');
            this.itemCourseType.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Tạo xe mới thành công!', 'success') && this.props.create(data, this.hide());
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
                    <FormTextBox className='col-md-4' ref={e => this.itemBrand = e} label='Nhãn hiệu xe' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsPersonalCar = e} isSwitch={true} className='col-md-2' label='Xe cá nhân' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKiem = e} className='col-md-6' label='Ngày hết hạn đăng kiểm' readOnly={readOnly} type='date-mask' />
                    <FormSelect className='col-md-6' ref={e => this.itemCourseType = e} label='Hạng đào tạo' data={ajaxSelectCourseType} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemUser = e} label='Chủ xe' data={ajaxSelectUser} readOnly={readOnly} />

                </div >
        });
    }
}

class CarPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCarPage(1, 50, undefined);
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá ứng viên này?', true, isConfirm =>
        isConfirm && this.props.deletePreStudent(item._id));
    // create = (e) => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '50%' }}>Biển số xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Chủ xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đào tạo</th>
                    <th style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={item.licensePlates} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.brand} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-car',
            title: 'Quản lý xe',
            breadcrumb: ['Quản lý xe'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminCar' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPreStudentPage} />
                <CarModal readOnly={!permission.write} ref={e => this.modal = e} create={this.props.createCar} update={this.props.updateCar} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px' }} onClick={() => { }} /> : null}
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
