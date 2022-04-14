import React from 'react';
import { connect } from 'react-redux';
import { getDevicePage, createDevice, updateDevice, deleteDevice, exportInfoDevice } from './redux';
import { Link } from 'react-router-dom';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import T from 'view/js/common';

const dataStatus = [
    { id: 0, text: 'Tất cả thiết bị', condition: {} },
    { id: 'dangSuDung', text: 'Thiết bị đang sử dụng', condition: { status: 'dangSuDung' } },
    { id: 'dangSuaChua', text: 'Thiết bị đang sửa chữa', condition: { status: 'dangSuaChua' } },
];
const dataRepairType = [{ id: 'dangSuDung', text: 'Thiết bị đang sử dụng' }, { id: 'dangSuaChua', text: 'Thiết bị đang sửa chữa' }];
class DeviceModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, type, name, status, division, quantity  } = item || { _id: null, type: {}, name:'', status:'', quantity: 0 };
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemType.value(type ? type._id : null);
        this.itemName.value(name);
        this.itemQuantity.value(quantity);
        this.itemStatus.value(status ? status : 'dangSuDung');
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            type: this.itemType.value(),
            name: this.itemName.value(),
            status: this.itemStatus.value(),
            quantity: this.itemQuantity.value(),
            division: this.itemDivision.value()
        };
        if (data.name == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemName.focus();
        } else if (data.type == '') {
            T.notify('Loại thiết bị không được trống!', 'danger');
            this.itemType.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Quản lý thiết bị',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemName = e} label='Tên thiết bị' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemType = e} className='col-md-3' data={this.props.type} label='Loại thiết bị' readOnly={readOnly} />
                    <FormTextBox className='col-md-3' ref={e => this.itemQuantity = e} label='Số lượng' readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemStatus = e} label='Tình trạng thiết bị' onChange={value => this.setState({ className: (value.id == 'daThanhLy') ? 'col-md-6' : 'invisible' })} data={dataRepairType} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />

                </div >
        });
    }
}

class DevicePage extends AdminPage {
    state = { searchText: '', isSearching: false, dateStart: '', dateEnd: '', condition: {}, brandTypes: [], types:[] };

    componentDidMount() {
        T.ready('/user/device', () => T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' })));
        this.props.getDevicePage(1, 50, { status: 'dangSuDung' });
        this.status.value('dangSuDung');
        this.props.getCategoryAll('device', null, (items) => {
            const types = [{id: 0, text: 'Tất cả loại thiết bị'}];
            items.forEach(item => types.push({ id: item._id, text: item.title }));
            this.setState({ types: types }, () => this.type.value(0));
        });
            
        T.onSearch = (searchText) => {
            const { status, dateStart, dateEnd, user } = this.state.condition,
                condition = { status, dateStart, dateEnd, user };
            searchText && (condition.searchText = searchText);
            this.props.getDevicePage(undefined, undefined, condition, () => {
                this.setState({ searchText, isSearching: searchText != '', condition });
            });
        };
    }

    onSearch = ({ pageNumber, pageSize, searchText, status, type }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (status == undefined) status = this.state.status;
        if (type == undefined) type = this.state.type;
        const condition = { searchText, status: status ? (status.id == 0 ? {} : status.id) : 'dangSuDung' , type: (type && type.id && type.id != '0') ? type.id : {} };
        this.setState({ isSearching: true }, () => this.props.getDevicePage(pageNumber, pageSize, condition, (page) => {
            this.setState({ condition, searchText, status, type, isSearching: false, filterKey: status ? status.id : 'dangSuDung' });
            done && done(page);
        }));
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông tin thiết bị', 'Bạn có chắc muốn xoá thiết bị này?', true, isConfirm =>
        isConfirm && this.props.deleteDevice(item));

    render() {
        const permission = this.getUserPermission('device', ['read', 'write', 'delete', 'import']);
        const createType = this.state.types && this.state.types.filter(item => item.id != 0);
        const header = <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Loại thiết bị:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.type = e} data={this.state.types} onChange={value => this.onSearch({ type: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Trạng thái:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.status = e} data={dataStatus} onChange={value => this.onSearch({ status: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.device && this.props.device.page ?
            this.props.device.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên thiết bị</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Loại thiết bị</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số lượng</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.name} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.type ? item.type.title : ''} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign:'center' }} content={item.status && item.status == 'dangSuaChua' ? 'Đang sửa chữa' : 'Đang sử dụng'} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign:'center' }} content={item.quantity} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}  />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-desktop',
            title: 'Danh sách thiết bị',
            header: header,
            breadcrumb: [<Link key={0} to='/user/device'>Quản lý thiết bị</Link>,'Danh sách thiết bị'],
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        {totalItem == 0 ? null : <p>Số lượng thiết bị: {totalItem}</p>}
                    </div>
                    {table}
                </div>
                <Pagination name='adminDevice' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDevicePage} />
                <DeviceModal readOnly={!permission.write} ref={e => this.modal = e} type={createType} create={this.props.createDevice} update={this.props.updateDevice} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => this.props.history.push('/user/device/manager/import')} /> : null}
                {permission.import ? <CirclePageButton type='export' style={{ right: '130px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => exportInfoDevice(this.state.filterKey, this.state.type && this.state.type.id)} /> : null}
            </>,
            backRoute: '/user/device',
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, device: state.trainning.device });
const mapActionsToProps = { getDevicePage, createDevice, updateDevice, deleteDevice, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(DevicePage);
