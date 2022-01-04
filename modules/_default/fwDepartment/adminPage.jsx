import React from 'react';
import { connect } from 'react-redux';
import { getDepartmentAll,createDepartment,updateDepartment,deleteDepartment,getDepartmentPage } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DepartmentModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        let { _id=null, title='', active=true } = item || {};
        this.itemName.value(title);
        this.itemIsActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemName.value(),
            active: this.itemIsActive.value(),
        };
        if (data.name == '') {
            T.notify('Tên phòng ban bị trống!', 'danger');
            this.itemName.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Phòng ban',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemName = e} className='col-md-12' label='Tên phòng ban' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemIsActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminQuestionPage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getDepartmentPage(1);
            T.onSearch = (searchText) => this.props.getDepartmentPage(1,undefined,searchText);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa phòng ban', 'Bạn có chắc bạn muốn xóa phòng ban này?', true, isConfirm =>
        isConfirm && this.props.deleteDepartment(item._id));

    render() {
        const permission = this.getUserPermission('department');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.department && this.props.department.page ?
        this.props.department.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => this.props.department && this.props.department.page && this.props.department.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên phòng ban</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateDepartment(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Phòng ban',
            breadcrumb: ['Phòng ban'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageDepartment' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDepartmentPage} />
                <DepartmentModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createDepartment} update={this.props.updateDepartment} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, department: state.framework.department });
const mapActionsToProps = { getDepartmentAll,getDepartmentPage,createDepartment,updateDepartment,deleteDepartment };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);