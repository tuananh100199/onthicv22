import React from 'react';
import { connect } from 'react-redux';
import { getFacilityPage, createFacility, updateFacility, deleteFacility, exportInfoFacility } from './redux';
import { Link } from 'react-router-dom';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import T from 'view/js/common';

const dataStatus = [
    { id: 0, text: 'Tất cả cơ sở', condition: {} },
    { id: 'dangSuDung', text: 'Cơ sở đang sử dụng', condition: { status: 'dangSuDung' } },
    { id: 'dangSuaChua', text: 'Cơ sở đang sửa chữa', condition: { status: 'dangSuaChua' } },
];
const dataRepairType = [{ id: 'dangSuDung', text: 'Cơ sở đang sử dụng' }, { id: 'dangSuaChua', text: 'Cơ sở đang sửa chữa' }];
class FacilityModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, type, name, status, division, maxStudent  } = item || { _id: null, type: {}, name:'', status:'', maxStudent: 0 };
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemType.value(type ? type._id : null);
        this.itemName.value(name);
        this.itemMaxStudent.value(maxStudent);
        this.itemStatus.value(status ? status : 'dangSuDung');
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            type: this.itemType.value(),
            name: this.itemName.value(),
            status: this.itemStatus.value(),
            maxStudent: this.itemMaxStudent.value(),
            division: this.itemDivision.value()
        };
        if (data.name == '') {
            T.notify('Tên cơ sở vật chất không được trống!', 'danger');
            this.itemName.focus();
        } else if (data.type == '') {
            T.notify('Loại cơ sở vật chất không được trống!', 'danger');
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
            title: 'Quản lý cơ sở vật chất',
            size: 'large',
            body:
                <div className='row'>
                    <FormTextBox className='col-md-6' ref={e => this.itemName = e} label='Tên cơ sở vật chất' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemType = e} className='col-md-3' data={this.props.type} label='Loại cơ sở vật chất' readOnly={readOnly} />
                    <FormTextBox className='col-md-3' ref={e => this.itemMaxStudent = e} label='Số lượng học viên' readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemStatus = e} label='Tình trạng cơ sở vật chất' onChange={value => this.setState({ className: (value.id == 'daThanhLy') ? 'col-md-6' : 'invisible' })} data={dataRepairType} readOnly={readOnly} />
                    <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />

                </div >
        });
    }
}

class FacilityPage extends AdminPage {
    state = { searchText: '', isSearching: false, dateStart: '', dateEnd: '', condition: {}, brandTypes: [], types:[] };

    componentDidMount() {
        T.ready('/user/facility', () => T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' })));
        this.props.getFacilityPage(1, 50, { status: 'dangSuDung' });
        this.status.value('dangSuDung');
        this.props.getCategoryAll('facility', null, (items) => {
            const types = [{id: 0, text: 'Tất cả loại cơ sở vật chất'}];
            items.forEach(item => types.push({ id: item._id, text: item.title }));
            this.setState({ types: types }, () => this.type.value(0));
        });
            
        T.onSearch = (searchText) => {
            const { status, dateStart, dateEnd, user } = this.state.condition,
                condition = { status, dateStart, dateEnd, user };
            searchText && (condition.searchText = searchText);
            this.props.getFacilityPage(undefined, undefined, condition, () => {
                this.setState({ searchText, isSearching: searchText != '', condition });
            });
        };
    }

    onSearch = ({ pageNumber, pageSize, searchText, status, type }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (status == undefined) status = this.state.status;
        if (type == undefined) type = this.state.type;
        const condition = { searchText, status: status ? (status.id == 0 ? {} : status.id) : 'dangSuDung' , type: (type && type.id && type.id != '0') ? type.id : {} };
        this.setState({ isSearching: true }, () => this.props.getFacilityPage(pageNumber, pageSize, condition, (page) => {
            this.setState({ condition, searchText, status, type, isSearching: false, filterKey: status ? status.id : 'dangSuDung' });
            done && done(page);
        }));
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thông tin cơ sở vật chất', 'Bạn có chắc muốn xoá cơ sở vật chất này?', true, isConfirm =>
        isConfirm && this.props.deleteFacility(item));

    render() {
        const permission = this.getUserPermission('facility', ['read', 'write', 'delete', 'export', 'import']);
        const createType = this.state.types && this.state.types.filter(item => item.id != 0);
        const header = <>
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Loại cơ sở:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.type = e} data={this.state.types} onChange={value => this.onSearch({ type: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
            <label style={{ lineHeight: '40px', marginBottom: 0 }}>Trạng thái:</label>&nbsp;&nbsp;
            <FormSelect ref={e => this.status = e} data={dataStatus} onChange={value => this.onSearch({ status: value })} style={{ minWidth: '200px', marginBottom: 0, marginRight: 12 }} />
        </>;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.facility && this.props.facility.page ?
            this.props.facility.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list && list.filter(item => item.course == null),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên cơ sở vật chất</th>
                    <th style={{ width: '100%' }} nowrap='true'>Loại cơ sở vật chất</th>
                    <th style={{ width: '100%' }} nowrap='true'>Số lượng học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cơ sở</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' style={{ whiteSpace: 'nowrap' }} content={item.name} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.type ? item.type.title : ''} />
                    <TableCell type='number' style={{ whiteSpace: 'nowrap', textAlign:'center' }} content={item.maxStudent} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}  />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Danh sách',
            header: header,
            breadcrumb: [<Link key={0} to='/user/facility'>Quản lý cơ sở vật chất</Link>,'Danh sách'],
            content: <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        {totalItem == 0 ? null : <p>Số lượng cơ sở vật chất: {totalItem}</p>}
                    </div>
                    {table}
                </div>
                <Pagination name='adminFacility' style={{ marginLeft: 60 }} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getFacilityPage} />
                <FacilityModal readOnly={!permission.write} ref={e => this.modal = e} type={createType} create={this.props.createFacility} update={this.props.updateFacility} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => this.props.history.push('/user/facility/manager/import')} /> : null}
                {permission.export ? <CirclePageButton type='export' style={{ right: '130px', backgroundColor: 'brown', borderColor: 'brown' }} onClick={() => exportInfoFacility(this.state.filterKey, this.state.type && this.state.type.id)} /> : null}
            </>,
            backRoute: '/user/facility',
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, facility: state.trainning.facility });
const mapActionsToProps = { getFacilityPage, createFacility, updateFacility, deleteFacility, getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(FacilityPage);
