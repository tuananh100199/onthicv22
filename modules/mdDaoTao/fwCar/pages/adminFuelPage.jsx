import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, exportFuelCarPage } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import Pagination from 'view/component/Pagination';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, TableCell, CirclePageButton, renderTable, TableHead,TableHeadCell, FormDatePicker } from 'view/component/AdminPage';
import T from 'view/js/common';
class CarFuelPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        this.props.getCarPage(1,null,{status: {$ne: 'daThanhLy'}},{},{}, (data) => {
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
        
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

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
        const {brandTypes, listLicensePlates, dateStartDate, dateEndDate} = this.state;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        let data = [],totalCost = 0;
        list && list.length && list.forEach(car => {
            const sortArr = car && car.fuel && car.fuel.sort((a, b) => new Date(b.date) - new Date(a.date));
                sortArr.forEach((fuel) => {
                    if(dateStartDate){
                        if(dateStartDate < new Date(fuel.date) && dateEndDate > new Date(fuel.date)){
                            totalCost += fuel.fee;
                            data.push({ car, fuel });
                        }
                    } else {
                        totalCost += fuel.fee;
                        data.push({ car, fuel });
                    }
            //  data.push({ car, fuel });
                });
        });
        list = data;
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            stickyHead:true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getCarPage}>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHeadCell name='licensePlates' filter='select' filterData = {listLicensePlates} style={{ width: '100%' }} nowrap='true'>Biển số xe</TableHeadCell>
                    <TableHeadCell name='brand' filter='select' filterData = {brandTypes} style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</TableHeadCell>
                    <th style={{ width: 'auto' }} nowrap='true'>Chủ xe</th>
                    <TableHeadCell name='courseType' filter='select' filterData = {ajaxSelectCourseType} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đào tạo</TableHeadCell>
                    <TableHeadCell name='divisions' filter='select' filterData = {ajaxSelectDivision} style={{ width: 'auto%' }} nowrap='true'>Cơ sở đào tạo</TableHeadCell>
                    <th style={{ width: '100%' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: '100%' }} nowrap='true'>Đơn giá</th>
                    <th style={{ width: '100%' }} nowrap='true'>Thành tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.car && item.car.licensePlates} url={'/user/car/fuel/' + item.car._id} />
                    <TableCell type='text' content={item.car && item.car.brand && item.car.brand.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car && item.car.user && (item.car.user.lastname + ' ' + item.car.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car && item.car.courseType && item.car.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.car && item.car.division ? item.car.division.title : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.fuel && item.fuel.quantity ? item.fuel.quantity : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.fuel && item.fuel.donGia ? T.numberDisplay(item.fuel.donGia) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.fuel && item.fuel.fee ? T.numberDisplay(item.fuel.fee) : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/car/fuel/' + item.car._id} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý cấp phát nhiên liệu',
            breadcrumb: ['Quản lý cấp phát nhiên liệu'],
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
                    <p>Tổng tiền đổ xăng: {T.numberDisplay(totalCost)} VNĐ</p>
                    {table}
                </div>
                <CirclePageButton type='export' onClick={() => exportFuelCarPage()} />
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
            </>,
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(CarFuelPage);
