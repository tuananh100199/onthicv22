import React from 'react';
import { connect } from 'react-redux';
import { getAllRoles, updateRole, deleteRole, getRolePage, createRole } from './redux';
import Pagination from 'view/component/Pagination';

class RoleModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isAdmin: false };
        this.modal = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#roleName').focus());
        }, 250));
    }

    show = (item, isAdmin) => {
        const { _id, name, description } = item ?
            item : { _id: null, name: '', permission: [], active: false, };
        this.setState({ isAdmin, name, description });
        $(this.btnSave.current).data('id', _id);
        $('#roleName').val(name);
        $('#description').val(description);
        $(this.modal.current).modal('show');
    }

    save = (e) => {
        e.preventDefault();
        const _id = $(this.btnSave.current).data('id'),
            changes = {
                name: $('#roleName').val().trim(),
                description: $('#description').val()
            };

        if (changes.name == '') {
            T.notify('Tên bị trống!', 'danger');
            $('#roleName').focus();
        } else {
            if (this.state.name == 'admin') delete changes.name;
            if (_id) {
                this.props.updateRole(_id, changes, () => this.props.getPage && this.props.getPage());
            } else {
                this.props.createRole(changes, () => this.props.getPage && this.props.getPage());
            }
            $(this.modal.current).modal('hide');
        }
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin vai trò</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='roleName'>Tên vai trò{this.state.name == 'admin' ? ': admin' : ''}</label>
                                <input className='form-control' id='roleName' type='text' placeholder='Tên vai trò' style={{ display: this.state.name == 'admin' ? 'none' : 'block' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='description'>Thông tin chi tiết</label>
                                {this.state.name != 'admin' || this.state.isAdmin ?
                                    <input className='form-control' id='description' type='text' placeholder='Thông tin chi tiết' /> : ': ' + this.state.description}
                            </div>

                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {this.state.name != 'admin' || this.state.isAdmin ?
                                <button type='submit' className='btn btn-primary' ref={this.btnSave}>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button> : ''}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class Select2 extends React.Component {
    constructor(props) {
        super(props);
        this.select = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.select.current).select2({ data: this.props.list }).val(this.props.selectedList).trigger('change');
            $(this.select.current).on('change', e => {
                const permission = [];
                for (let i = 0; i < e.target.selectedOptions.length; i++) {
                    permission.push(e.target.selectedOptions[i].value);
                }
                this.props.update(this.props._id, { permission });
            })
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps._id != this.props._id) {
            $(this.select.current).select2({ data: this.props.list }).val(this.props.selectedList).trigger('change');
        }
    }

    render() {
        return (
            <select ref={this.select} className='select2-input' multiple={true} defaultValue={[]} style={{ 'width': '100%' }}>
                <optgroup label='Lựa chọn quyền' />
            </select>
        );
    }
}

class RolePage extends React.Component {
    constructor(props) {
        super(props);
        this.roleModal = React.createRef();
    }

    componentDidMount() {
        this.props.getRolePage();
        T.ready('/user/settings');
    }

    createRole = (e) => {
        e.preventDefault();
        this.roleModal.current.show(null);
    };

    editRole = (e, item) => {
        e.preventDefault();
        let isAdmin = this.props.system.user.roles.reduce((result, item) => result || item.name == 'admin', false);
        this.roleModal.current.show(item, isAdmin);
    };

    changeRoleActive = (item) => {
        this.props.updateRole(item._id, { active: !item.active }, () => this.props.getRolePage());
    };

    changeRoleDefault = (item) => {
        if (item.default == false) this.props.updateRole(item._id, { default: true }, () => this.props.getRolePage());
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa vai trò', 'Bạn có chắc bạn muốn xóa vai trò này?', true, isConfirm =>
            isConfirm && this.props.deleteRole(item._id, () => this.props.getRolePage()));
    }

    render() {
        const permissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            hasUpdate = permissions.includes('user:write'),
            hasDelete = permissions.includes('user:delete');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.role && this.props.role.page ?
            this.props.role.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const permissionList = this.props.role && this.props.role.page ? this.props.role.page.permissionList : null;

        let table = <p>Không có vai trò!</p>;
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: 'auto' }}>Tên</th>
                            <th style={{ width: '100%', textAlign: 'center' }}>Quyền</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Mặc định</th>
                            {hasUpdate || hasDelete ? <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th> : ''}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    {hasUpdate ? <a href='#' onClick={e => this.editRole(e, item)} style={{ whiteSpace: 'nowrap' }}>{item.name}</a> : item.name}
                                </td>
                                <td style={{ padding: 6 }}>
                                    {hasUpdate && item.name != 'admin' ?
                                        <Select2 key={index} list={permissionList} selectedList={item.permission} _id={item._id} update={this.props.updateRole} /> :
                                        permissionList.toString().replaceAll(',', ', ')}
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => hasUpdate && item.name != 'admin' && this.changeRoleActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.default} onChange={() => hasUpdate && this.changeRoleDefault(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                {hasUpdate || hasDelete ?
                                    <td>
                                        <div className='btn-group'>
                                            {hasUpdate ?
                                                <a className='btn btn-primary' href='#' onClick={e => this.editRole(e, item)}>
                                                    <i className='fa fa-lg fa-edit' />
                                                </a> : ''}
                                            {hasDelete && item.name != 'admin' ?
                                                <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                    <i className='fa fa-lg fa-trash' />
                                                </a> : ''}
                                        </div>
                                    </td> : ''}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Vai trò</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='adminRole'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getRolePage} />

                {permissions.includes('role:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.createRole}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                    : ''}
                <RoleModal ref={this.roleModal} permissionList={permissionList}
                    updateRole={this.props.updateRole} getPage={this.props.getRolePage} createRole={this.props.createRole} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, role: state.role });
const mapActionsToProps = { getAllRoles, updateRole, deleteRole, getRolePage, createRole };
export default connect(mapStateToProps, mapActionsToProps)(RolePage);
