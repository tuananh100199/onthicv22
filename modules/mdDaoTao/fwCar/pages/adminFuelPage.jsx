import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import T from 'view/js/common';

class CarFuelPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        const permission = this.getUserPermission('car'),
            user = this.props.system && this.props.system.user;
        permission.delete ? this.props.getCarPage(1, 50, undefined) : this.props.getCarPage(1, 50, { user: user._id });
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Biển số xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nhãn hiệu xe</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Chủ xe</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đào tạo</th>
                    <th style={{ width: '100%' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: '100%' }} nowrap='true'>Lần cấp phát nhiên liệu gần nhất</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.licensePlates} url={'/user/car/fuel/' + item._id} />
                    <TableCell type='text' content={item.brand && item.brand.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.fuel && item.fuel.length ? T.dateToText(item.fuel.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/car/fuel/' + item._id} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-thermometer-empty',
            title: 'Quản lý cấp phát nhiên liệu',
            breadcrumb: ['Quản lý cấp phát nhiên liệu'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
            </>,
            backRoute: '/user/car',
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer };
export default connect(mapStateToProps, mapActionsToProps)(CarFuelPage);
