import React from 'react';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser, getUserByRole } from './redux';
import { getAllRoles } from '../fwRole/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, FormImageBox, FormDatePicker, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class UserModal extends AdminModal {
    state = { allRoles: [] };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        if (item == null) item = { _id: null, roles: [], active: true, isCourseAdmin: false, isLecturer: false, isStaff: false };
        this.itemFirstname.value(item.firstname);
        this.itemLastname.value(item.lastname);
        this.itemBirthday.value(item.birthday)
        this.itemEmail.value(item.email);
        this.itemPhoneNumber.value(item.phoneNumber);
        this.itemActive.value(item.active);
        this.itemIsCourseAdmin.value(item.isCourseAdmin);
        this.itemIsStaff.value(item.isStaff);
        this.itemIsLecturer.value(item.isLecturer);
        this.itemSex.value(item.sex);
        this.imageBox.setData(`user:${item._id ? item._id : 'new'}`);

        const allRoles = this.props.allRoles.map(item => ({ id: item._id, text: item.name }));
        this.setState({ _id: item._id, image: item.image, allRoles }, () => {
            this.itemRoles.value(item.roles.map(item => item._id));
        });
    }

    onSubmit = () => {
        const changes = {
            sex: this.itemSex.value(),
            firstname: this.itemFirstname.value().trim(),
            lastname: this.itemLastname.value().trim(),
            email: this.itemEmail.value().trim(),
            phoneNumber: this.itemPhoneNumber.value().trim(),
            active: this.itemActive.value(),
            isCourseAdmin: this.itemIsCourseAdmin.value(),
            isStaff: this.itemIsStaff.value(),
            isLecturer: this.itemIsLecturer.value(),
            roles: this.itemRoles.value(),
            birthday: this.itemBirthday.value(),
        };
        if (changes.firstname == '') {
            T.notify('Tên người dùng bị trống!', 'danger');
            this.itemFirstname.focus();
        } else if (changes.lastname == '') {
            T.notify('Họ người dùng bị trống!', 'danger');
            this.itemLastname.focus();
        } else if (changes.email == '') {
            T.notify('Email người dùng bị trống!', 'danger');
            this.itemEmail.focus();
        } else {
            if (changes.roles.length == 0) changes.roles = 'empty';
            if (this.state._id) {
                this.props.updateUser(this.state._id, changes);
            } else {
                this.props.createUser(changes);
            }
            this.hide();
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Thông tin người dùng',
            size: 'large',
            body: (
                <div className='row'>
                    <div className={this.state._id ? 'col-md-8' : 'col-md-12'}>
                        <div className='row'>
                            <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} />
                            <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} />
                        </div>
                        <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                    </div>
                    <FormImageBox ref={e => this.imageBox = e} className='col-md-4 form-group' style={{ display: this.state._id ? 'block' : 'none' }} label='Hình đại diện' uploadType='UserImage' image={this.state.image} readOnly={readOnly} />

                    <FormTextBox ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemSex = e} className='col-md-4' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />

                    <FormCheckbox ref={e => this.itemIsCourseAdmin = e} className='col-md-4' label='Quản trị viên khoá học' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsStaff = e} className='col-md-4' label='Nhân viên' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsLecturer = e} className='col-md-4' label='Giáo viên' readOnly={readOnly} />

                    <FormSelect ref={e => this.itemRoles = e} className='col-md-12' label='Vai trò' data={this.state.allRoles} multiple={true} readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemActive = e} className='col-md-12' label='Kích hoạt' readOnly={readOnly} />
                </div>),
        });
    }
}

class UserPasswordModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.password1.focus()));
    }

    onShow = (item) => {
        this.password1.value('');
        this.password2.value('');
        this.data('_id', item._id);
    }

    onSubmit = () => {
        const password1 = this.password1.value().trim(),
            password2 = this.password2.value().trim();
        if (password1 == '') {
            T.notify('Mật khẩu bị trống!', 'danger');
            this.password1.focus();
        } else if (password2 == '') {
            T.notify('Vui lòng nhập lại mật khẩu!', 'danger');
            this.password2.focus();
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
            this.password1.focus();
        } else {
            this.props.updateUser(this.data('_id'), { password: password1 }, error => error || this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Đổi mật khẩu',
        body: <>
            <FormTextBox type='password' ref={e => this.password1 = e} label='Mật khẩu' />
            <FormTextBox type='password' ref={e => this.password2 = e} label='Nhập lại mật khẩu' />
        </>,
    });
}

export class RoleFilter extends React.Component {
    state = {}
    render() {
        let { isCourseAdmin, isStaff, isLecturer, isAll } = this.props.filter;
        return (
            <div className='row '>
                <label>All:</label>
                <div className='toggle col-md-2 p-0'>
                    <label>
                        <input type='checkbox' checked={isAll} onChange={() => {
                            const changes = {
                                isCourseAdmin: isCourseAdmin,
                                isStaff: isStaff,
                                isLecturer: isLecturer,
                                isAll: !isAll
                            }
                            this.props.getUserByRole(changes)
                            this.props.setRoleFilter(changes)
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>QT:</label>
                <div className='toggle col-md-2 p-0'>
                    <label>
                        <input type='checkbox' checked={isCourseAdmin} onChange={() => {
                            const changes = {
                                isCourseAdmin: !isCourseAdmin,
                                isStaff: isStaff,
                                isLecturer: isLecturer,
                                isAll: isAll
                            }
                            this.props.getUserByRole(changes)
                            this.props.setRoleFilter(changes)
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>NV:</label>
                <div className='toggle col-md-2 p-0'>
                    <label>
                        <input type='checkbox' checked={isStaff} onChange={() => {
                            const changes = {
                                isCourseAdmin: isCourseAdmin,
                                isStaff: !isStaff,
                                isLecturer: isLecturer,
                                isAll: isAll
                            }
                            this.props.getUserByRole(changes)
                            this.props.setRoleFilter(changes)
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>GV:</label>
                <div className='toggle col-md-2 p-0'>
                    <label>
                        <input type='checkbox' checked={isLecturer} onChange={() => {
                            const changes = {
                                isCourseAdmin: isCourseAdmin,
                                isStaff: isStaff,
                                isLecturer: !isLecturer,
                                isAll: isAll
                            }
                            this.props.getUserByRole(changes)
                            this.props.setRoleFilter(changes)
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
            </div>

        );
    }
}

class UserPage extends AdminPage {
    state = { searchText: '', isSearching: false };
    constructor(props) {
        super(props);
        this.state = {
            roleFilter: (T.cookie('roleFilter') ? T.cookie('roleFilter') :
                {
                    isCourseAdmin: false,
                    isStaff: false,
                    isLecturer: false,
                    isAll: true,
                })
        }
    }


    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getAllRoles();
        this.props.getUserPage(1);
        this.props.getUserByRole(this.state.roleFilter)
        T.onSearch = (searchText) => this.props.getUserPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    setRoleFilter = (roleFilter) => {
        this.setState({ roleFilter: roleFilter })
        T.cookie('roleFilter', roleFilter)
    }

    edit = (e, item) => e.preventDefault() || this.userModal.show(item);

    changePassword = (e, item) => e.preventDefault() || this.passwordModal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
        isConfirm && this.props.deleteUser(item._id));

    render() {
        const permission = this.getUserPermission('user');
        const allRoles = this.props.role && this.props.role.items ? this.props.role.items : [];
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => this.props.user && this.props.user.role,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }}>Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='image' content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateUser(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={e => !item.default && this.delete(e, item)}>
                        {permission.write ?
                            <a className='btn btn-info' href='#' onClick={e => !item.default && this.changePassword(e, item)}>
                                <i className='fa fa-lg fa-key' />
                            </a> : null}
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Người dùng',
            header: <RoleFilter getUserByRole={this.props.getUserByRole} setRoleFilter={this.setRoleFilter} filter={this.state.roleFilter} />,
            breadcrumb: ['Người dùng'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminUser' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getUserPage} />
                <UserModal ref={e => this.userModal = e} readOnly={!permission.write} allRoles={allRoles}
                    updateUser={this.props.updateUser} createUser={this.props.createUser} getPage={this.props.getUserPage} />
                <UserPasswordModal ref={e => this.passwordModal = e} updateUser={this.props.updateUser} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, getAllRoles, getUserByRole };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);