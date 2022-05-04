import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, exportRegistrationCarPage } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormSelect, TableCell,FormDatePicker, renderTable, CirclePageButton, TableHead,TableHeadCell  } from 'view/component/AdminPage';
import T from 'view/js/common';

const dataCarType = [{ id: 0, text: 'Tất cả xe' }, { id: 1, text: 'Hết hạn < 1 tháng' }, { id: 3, text: 'Hết hạn < 3 tháng' }, { id: -1, text: 'Đã hết hạn' }, {id: -2, text: 'Chưa có lịch sử đăng kiểm'}];
class CarPage extends AdminPage {
    state = { searchText: '', isSearching: false };

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
        this.setState({ dataCarType });
        this.carType.value(dataCarType[1] && dataCarType[1].id);
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    onSearch = ({ pageNumber, pageSize, carType }, done) => {
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
        condition = { ngayHetHanDangKiem: dateCondition };
        this.setState({ isSearching: true }, () => this.props.getCarPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ isSearching: false, condition, carType });
            done && done(page);
        }));
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông tin xe', 'Bạn có chắc muốn xoá xe này?', true, isConfirm =>
        isConfirm && this.props.deleteCar(item._id));

    handleFilterByDate = () => {
        const dateStart = this.dateStartDate ? this.dateStartDate.value() : '';
        const dateEnd = this.dateEndDate ? this.dateEndDate.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.setState({ isSearching: false, dateStartDate: dateStart, dateEndDate: dateEnd });
        }
    }
        
    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const {brandTypes, listLicensePlates, carType, dateStartDate, dateEndDate} = this.state;
        const header = <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Loại xe:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.carType = e} data={dataCarType} onChange={value => this.onSearch({ carType: value.id })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>;
         let data = [];
         if(carType != -2){
            list && list.length && list.forEach(car => {
                const sortArr = car && car.lichSuDangKiem && car.lichSuDangKiem.sort((a, b) => new Date(b.dateStart) - new Date(a.dateStart));
                    sortArr.forEach((lichSuDangKiem) => {
                    if(dateStartDate){
                        if(dateStartDate < new Date(lichSuDangKiem.ngayDangKiem) && dateEndDate > new Date(lichSuDangKiem.ngayDangKiem)){
                            data.push({ car, lichSuDangKiem });
                        }
                    } else {
                        data.push({ car, lichSuDangKiem });
                    }
                    });
                });
                list = data;
         } else {
             list = list && list.filter(car => !car.lichSuDangKiem.length);
         }
        const table = carType != -2 ?  renderTable({
            getDataSource: () => list,
            stickyHead:true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getCarPage}>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHeadCell name='licensePlates' filter='select' filterData = {listLicensePlates} style={{ width: '100%' }} nowrap='true'>Biển số xe</TableHeadCell>
                    <TableHeadCell name='brand' filter='select' filterData = {brandTypes} style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</TableHeadCell>
                    <th style={{ width: 'auto' }} nowrap='true'>Quản lý xe</th>
                    <th style={{ width: '100%' }} nowrap='true'>Ngày đăng kiểm</th>
                    <th style={{ width: '100%' }} nowrap='true'>Thời hạn đăng kiểm</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car ? item.car.licensePlates : ''} />
                    <TableCell type='text' content={item.car ? (item.car.brand && item.car.brand.title) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car && item.car.user ? (item.car.user.lastname + ' ' + item.car.user.firstname) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.lichSuDangKiem && item.lichSuDangKiem.ngayDangKiem ?  T.dateToText(item.lichSuDangKiem.ngayDangKiem, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.lichSuDangKiem && item.lichSuDangKiem.ngayHetHanDangKiem ?  T.dateToText(item.lichSuDangKiem.ngayHetHanDangKiem, 'dd/mm/yyyy') : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/car/registration/' + item.car._id} />
                </tr >),
        }) : renderTable({
            getDataSource: () => list,
            stickyHead:true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getCarPage}>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHeadCell name='licensePlates' filter='select' filterData = {listLicensePlates} style={{ width: '100%' }} nowrap='true'>Biển số xe</TableHeadCell>
                    <TableHeadCell name='brand' filter='select' filterData = {brandTypes} style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</TableHeadCell>
                    <th style={{ width: 'auto' }} nowrap='true'>Quản lý xe</th>
                    <th style={{ width: '100%' }} nowrap='true'>Ngày đăng kiểm</th>
                    <th style={{ width: '100%' }} nowrap='true'>Thời hạn đăng kiểm</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item ? item.licensePlates : ''} />
                    <TableCell type='text' content={item ? (item.brand && item.brand.title) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user ? (item.user.lastname + ' ' + item.user.firstname) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.ngayHetHanDangKiem ? T.dateToText(item.ngayHetHanDangKiem, 'dd/mm/yyyy') : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/car/registration/' + item._id} />
                </tr >),
        });

        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Đăng kiểm xe',
            header: header,
            breadcrumb: ['Đăng kiểm xe'],
            content: <>
                <div className='tile'>
                    <div className='tile-body row'>
                        <FormDatePicker ref={e => this.dateStartDate = e} label='Thời gian bắt đầu (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                        <FormDatePicker ref={e => this.dateEndDate = e} label='Thời gian kết thúc (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                          <div className='m-auto col-md-2'>
                            <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByDate}>
                                <i className='fa fa-filter' /> Lọc
                            </button>
                        </div>
                    </div>
                    <p>Số lượng xe: {list.length}</p>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
                <CirclePageButton type='export' onClick={() => exportRegistrationCarPage(dateStartDate, dateEndDate)} />
            </>,
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
