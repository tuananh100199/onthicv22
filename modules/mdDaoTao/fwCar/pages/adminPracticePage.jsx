import React from 'react';
import { connect } from 'react-redux';
import { getCarPage, createCar, updateCar, deleteCar, exportExpiredCar } from '../redux';
import { getAllLecturer } from 'modules/_default/fwUser/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, FormSelect, TableCell, renderTable, CirclePageButton } from 'view/component/AdminPage';
import T from 'view/js/common';

const dataCarType = [{ id: 0, text: 'Tất cả xe' }, { id: 1, text: 'Hết hạn < 1 tháng' }, { id: 3, text: 'Hết hạn < 3 tháng' }, { id: -1, text: 'Đã hết hạn' }];
class CarPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        let dateCondition = {}, condition = {};
        const d = new Date();
        d.setMonth(d.getMonth() + 1); //1 month ago
        dateCondition = {
            $lt: d,
            $gte: new Date()
        };
        condition = { ngayHetHanTapLai: dateCondition };
        this.props.getCarPage(1, 50, condition);
        this.props.getAllLecturer(data => {
            if (data && data.length) {
                const listLecturer = [{ id: 0, text: 'Trống' }];
                data.forEach(lecturer => listLecturer.push({ id: lecturer._id, text: lecturer.lastname + ' ' + lecturer.firstname }));
                this.setState({ listLecturer });
            }
        });
        this.props.getCategoryAll('car', null, (items) =>
            this.setState({ brandTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
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
        condition = { ngayHetHanTapLai: dateCondition };
        this.setState({ isSearching: true }, () => this.props.getCarPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ isSearching: false, condition, carType });
            done && done(page);
        }));
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông tin xe', 'Bạn có chắc muốn xoá xe này?', true, isConfirm =>
        isConfirm && this.props.deleteCar(item._id));

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'import']);
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
                    <th style={{ width: 'auto' }} nowrap='true'>Quản lý xe</th>
                    <th style={{ width: '100%' }} nowrap='true'>Ngày hết hạn đăng ký tập lái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.licensePlates} />
                    <TableCell type='text' content={item.brand && item.brand.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={T.dateToText(item.ngayHetHanTapLai, 'dd/mm/yyyy')} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/car/practice/' + item._id} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-file-text-o',
            title: 'Theo dõi giấy phép xe tập lái',
            header: header,
            breadcrumb: ['Theo dõi giấy phép xe tập lái'],
            content: <>
                <div className='tile'>
                    <p>Số lượng xe: {totalItem}</p>
                    {table}
                </div>
                <Pagination name='adminCar' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCarPage} />
                <CirclePageButton type='export' onClick={() => exportExpiredCar(1, this.state.carType)} />
            </>,
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car });
const mapActionsToProps = { getCarPage, deleteCar, createCar, updateCar, getAllLecturer, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(CarPage);
