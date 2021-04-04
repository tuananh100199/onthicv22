import React from 'react';
import { connect } from 'react-redux';
import { getRolePage, createRole, updateRole, deleteRole } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class RoleModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, name, description, permission } = item || { name: '', description: '', permission: [], active: true };
        this.itemName.value(name);
        this.itemDescription.value(description);
        this.itemPermission.value(permission);
        this.setState({ _id, name, description });
    }

    onSubmit = () => {
        const changes = {
            name: this.itemName.value().trim(),
            description: this.itemDescription.value(),
            permission: this.itemPermission.value(),
        };
        if (changes.name == '') {
            T.notify('Tên bị trống!', 'danger');
            this.itemName.focus();
        } else {
            if (this.state.name == 'admin') delete changes.name;
            if (this.state._id) {
                this.props.update(this.state._id, changes, this.hide);
            } else {
                this.props.create(changes, this.hide);
            }
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin vai trò',
        size: 'large',
        body: <>
            <FormTextBox type='text' ref={e => this.itemName = e} label='Tên' readOnly={this.props.readOnly || this.state.name == 'admin'} />
            <FormTextBox type='text' ref={e => this.itemDescription = e} label='Mô tả' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemPermission = e} label='Quyền' data={this.props.permissions} multiple={true} readOnly={this.props.readOnly} />
        </>,
    });
}

class RolePage extends AdminPage {
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getRolePage(undefined, undefined, searchText ? { searchText } : null, () => { });
        this.props.getRolePage();
    }

    edit = (e, item) => e.preventDefault() || this.roleModal.show(item);

    delete = (e, item) => e.preventDefault() || item.name == 'admin' || T.confirm('Xóa vai trò', 'Bạn có chắc bạn muốn xóa vai trò này?', true, isConfirm =>
        isConfirm && this.props.deleteRole(item._id, () => this.props.getRolePage()));

    render() {
        const permission = this.getUserPermission('role');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.role && this.props.role.page ? this.props.role.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const permissions = this.props.role && this.props.role.page ? this.props.role.page.permissions : null;

        const table = renderTable({
            getDataSource: () => this.props.role && this.props.role.page && this.props.role.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }}>Tên</th>
                    <th style={{ width: '100%', textAlign: 'center' }}>Quyền</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mặc định</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.name} onClick={e => this.edit(e, item)} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.permission.toString().replaceAll(',', ', ')} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateRole(item._id, { active })} />
                    <TableCell type='checkbox' content={item.default} permission={permission} onChanged={checked => this.props.updateRole(item._id, { default: checked })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Vai trò',
            breadcrumb: ['Vai trò'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminRole' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getRolePage} />
                <RoleModal ref={e => this.roleModal = e} permissions={permissions} readOnly={!permission.write}
                    getPage={this.props.getRolePage} create={this.props.createRole} update={this.props.updateRole} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, role: state.role });
const mapActionsToProps = { getRolePage, createRole, updateRole, deleteRole };
export default connect(mapStateToProps, mapActionsToProps)(RolePage);