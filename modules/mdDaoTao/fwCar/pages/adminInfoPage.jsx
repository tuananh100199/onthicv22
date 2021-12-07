import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, liquidateCar, exportInfoCar, ajaxSelectAvaiableLecturer } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormDatePicker, AdminModal, FormTextBox, FormSelect, TableCell, renderTable, FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import T from 'view/js/common';

const dataFilterType = [
    { id: 0, text: 'Tất cả xe', condition: {} },
    { id: 1, text: 'Xe đang sử dụng', condition: { status: 'dangSuDung' } },
    { id: 2, text: 'Xe đang sửa chữa', condition: { status: 'dangSuaChua' } },
    { id: 3, text: 'Xe chờ thanh lý', condition: { status: 'choThanhLy' } },
    { id: 4, text: 'Xe đã thanh lý', condition: { status: 'daThanhLy' } },
    { id: 5, text: 'Xe đi khóa', condition: { currentCourseClose: true } },
    { id: 6, text: 'Xe đã có giáo viên', condition: { user: { $exists: true } } },
    { id: 7, text: 'Xe đang trống giáo viên', condition: { user: { $exists: false } } },
];
const dataRepairType = [{ id: 'dangSuDung', text: 'Xe đang sử dụng' }, { id: 'dangSuaChua', text: 'Xe đang sửa chữa' }, { id: 'dangThanhLy', text: 'Xe chờ thanh lý' }, { id: 'daThanhLy', text: 'Xe thanh lý' }];
class CarModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLicensePlates.focus()));
    }

    onShow = (item) => {
        const { _id, licensePlates, courseType, user, ngayHetHanDangKiem, ngayHetHanTapLai, ngayDangKy, brand, status, division, isPersonalCar } = item || { _id: null, licensePlates: '', ngayHetHanDangKiem: '', ngayHetHanTapLai: '', ngayDangKy: '', ngayThanhLy: '', brand: {} };
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
        this.itemLicensePlates.value(licensePlates);
        this.itemBrand.value(brand ? brand._id : null);
        this.itemIsPersonalCar.value(isPersonalCar);
        this.itemNgayHetHanDangKiem.value(ngayHetHanDangKiem);
        this.itemNgayHetHanTapLai.value(ngayHetHanTapLai);
        this.itemNgayDangKy.value(ngayDangKy);
        this.itemStatus.value(status ? status : 'dangSuDung');
        this.setState({ _id, user }, () => this.itemUser.value(user ? { id: user._id, text: user.lastname + ' ' + user.firstname } : { id: 0, text: 'Trống' }));
    }

    onSubmit = () => {
        const data = {
            licensePlates: this.itemLicensePlates.value(),
            courseType: this.itemCourseType.value(),
            user: this.itemUser.value(),
            brand: this.itemBrand.value(),
            isPersonalCar: this.itemIsPersonalCar.value(),
            ngayHetHanDangKiem: this.itemNgayHetHanDangKiem.value(),
            ngayHetHanTapLai: this.itemNgayHetHanTapLai.value(),
            ngayDangKy: this.itemNgayDangKy.value(),
            status: this.itemStatus.value(),
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
        } else if (!data.user) {
            T.notify('Vui lòng chọn Quản lý phụ trách xe!', 'danger');
            this.itemUser.focus();
        }
        else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý xe',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-5' ref={e => this.itemLicensePlates = e} label='Biển số xe' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemBrand = e} className='col-md-4' data={this.props.brandTypes} label='Nhãn hiệu xe' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsPersonalCar = e} isSwitch={true} className='col-md-3' label='Xe cá nhân' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemNgayHetHanDangKiem = e} className='col-md-6' label='Ngày hết hạn đăng kiểm' readOnly={true} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayHetHanTapLai = e} className='col-md-6' label='Ngày hết hạn tập lái' readOnly={true} type='date-mask' />
                    <FormDatePicker ref={e => this.itemNgayDangKy = e} className='col-md-6' label='Ngày đăng ký' readOnly={readOnly} type='date-mask' />
                    <FormSelect className='col-md-6' ref={e => this.itemStatus = e} label='Tình trạng xe' onChange={value => this.setState({ className: (value.id == 'daThanhLy') ? 'col-md-6' : 'invisible' })} data={dataRepairType} readOnly={true} />
                    <FormSelect className='col-md-3' ref={e => this.itemCourseType = e} label='Hạng đào tạo' data={ajaxSelectCourseType} readOnly={readOnly} />
                    <FormSelect className='col-md-5' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                    <FormSelect className='col-md-4' ref={e => this.itemUser = e} label='Quản lý phụ trách xe' data={ajaxSelectAvaiableLecturer(this.state.user)} readOnly={readOnly} />

                </div >
        });
    }
}

class CarPage extends AdminPage {
    state = { searchText: '', isSearching: false, dateStart: '', dateEnd: '', condition: {}, brandTypes: [] };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' })));
        this.props.getCarPage(1, 50, { status: 'dangSuDung' });
        this.props.getAllLecturer(data => {
            if (data && data.length) {
                const listLecturer = [{ id: 0, text: 'Trống' }];
                data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname }));
                this.setState({ listLecturer });
            }
        });
        this.filterType.value(1);
        this.props.getCategoryAll('car', null, (items) =>
            this.setState({ brandTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        T.onSearch = (searchText) => {
            const { filterType, dateStart, dateEnd, user } = this.state.condition,
                condition = { filterType, dateStart, dateEnd, user };
            searchText && (condition.searchText = searchText);
            this.props.getCarPage(undefined, undefined, condition, () => {
                this.setState({ searchText, isSearching: searchText != '', condition });
            });
        };
    }

    liquidate = (e, item) => e.preventDefault() || T.confirm('Thanh lý xe', 'Bạn có chắc muốn thanh lý xe này ?', true, isConfirm =>
        isConfirm && this.props.liquidateCar(item));

    // handleFilterByTime = () => {
    //     const { searchText, filterType, user } = this.state.condition;
    //     const dateStart = this.dateStart ? this.dateStart.value() : '';
    //     const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
    //     if (dateStart > dateEnd) {
    //         T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
    //     } else {
    //         const condition = { searchText, filterType, dateStart, dateEnd };
    //         user && (condition.user = user);
    //         this.props.getCarPage(undefined, undefined, condition, () => {
    //             this.setState({ condition, isSearching: false });
    //         });
    //     }
    // }

    onSearch = ({ pageNumber, pageSize, searchText, filterType }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (filterType == undefined) filterType = this.state.filterType;
        // const { dateStart, dateEnd } = this.state, user = this.state.condition && this.state.condition.user,
        //     condition = { searchText, filterType, dateStart, dateEnd, user };
        const condition = { searchText, filterType: filterType.condition };
        this.setState({ isSearching: true }, () => this.props.getCarPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ condition, searchText, filterType, isSearching: false, filterKey: filterType.id });
            done && done(page);
        }));
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông tin xe', 'Bạn có chắc muốn xoá xe này?', true, isConfirm =>
        isConfirm && this.props.deleteCar(item));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import', 'fuel']);
        const header = <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Loại xe:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.filterType = e} data={dataFilterType} onChange={value => this.onSearch({ filterType: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Quản lý phụ trách xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đào tạo</th>
                    <th style={{ width: '100%' }} nowrap='true'>Cơ sở</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày hết hạn đăng kiểm</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Ngày hết hạn tập lái</th>
                    {/* <th style={{ width: 'auto' }} nowrap='true'>Xe cá nhân</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={<p>Xe: {item.brand && item.brand.title} <br /> {item.licensePlates}</p>} onClick={e => this.edit(e, item)} />
                    {/* <TableCell type='text' content={item.brand && item.brand.title} /> */}
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<p>{item.user && (item.user.lastname + ' ' + item.user.firstname)} <br /> {item.isPersonalCar ? '(Xe cá nhân)' : ''}</p>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHanDangKiem, 'dd/mm/yyyy')} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHanTapLai, 'dd/mm/yyyy')} />
                    {/* <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.isPersonalCar ? 'X' : ''} /> */}
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onLiquidate={this.liquidate} onDelete={this.delete} onEditFuel={'/user/car/fuel/' + item._id} onEditRepair={'/user/car/repair/' + item._id} onEditCourseHistory={'/user/car/course/' + item._id} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-car',
            title: 'Quản lý xe',
            header: header,
            breadcrumb: ['Quản lý xe'],
            // advanceSearch: <>
            //     <h6 className='tile-title mt-3'>Lọc theo thời gian</h6>
            //     <div className='tile-body row'>
            //         <FormDatePicker ref={e => this.dateStart = e} label='Thời gian bắt đầu' className='col-md-5' />
            //         <FormDatePicker ref={e => this.dateEnd = e} label='Thời gian kết thúc' className='col-md-5' />
            //         <div className='m-auto'>
            //             <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByTime}>
            //                 <i className='fa fa-filter' /> Lọc danh sách
            //             </button>
            //         </div>
            //     </div>
            // </>,
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        {totalItem == 0 ? null : <p>Số lượng xe: {totalItem}</p>}
                    </div>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
                <CarModal readOnly={!permission.write} ref={e => this.modal = e} brandTypes={this.state.brandTypes} create={this.props.createCar} update={this.props.updateCar} dataLecturer={this.state.listLecturer} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => this.props.history.push('/user/car/import')} /> : null}
                {permission.import ? <CirclePageButton type='export' style={{ right: '130px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => exportInfoCar(this.state.filterKey)} /> : null}
            </>,
            backRoute: '/user/car',
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll, liquidateCar };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
