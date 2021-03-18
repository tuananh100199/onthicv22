import React from 'react';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser } from './redux';
import { getAllRoles } from '../fwRole/redux';
import Pagination from 'view/component/Pagination';
import ImageBox from 'view/component/ImageBox';
import { Select } from 'view/component/Input';
import { AdminPage, AdminModal, Checkbox } from 'view/component/AdminPage';

class UserModal extends AdminModal {
    state = {};
    sex = React.createRef();
    imageBox = React.createRef();
    isCourseAdmin = React.createRef();
    isLecturer = React.createRef();
    isStaff = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            this.props.permissionWrite && $('#userRoles').select2();
            $('#userBirthday').datepicker({ format: 'dd/mm/yyyy', autoclose: true });
            $(this.modal.current).on('shown.bs.modal', () => $('#userLastname').focus())
        });
    }

    onShow = (item) => {
        if (item == null) item = { _id: null, roles: [], active: true, isCourseAdmin: false, isLecturer: false, isStaff: false };
        $('#userFirstname').val(item.firstname);
        $('#userLastname').val(item.lastname);
        $('#userBirthday').val(item.birthday ? T.dateToText(item.birthday, 'dd/mm/yyyy') : '');
        $('#userEmail').val(item.email);
        $('#userPhoneNumber').val(item.phoneNumber);
        $('#userActive').prop('checked', item.active);
        $('#isLecturer').prop('checked', item.isLecturer);
        $('#isStaff').prop('checked', item.isStaff);
        this.sex.current.val({ id: item.sex, text: item.sex === 'male' ? 'Nam' : 'Nữ' });
        this.isCourseAdmin.current.val(item.isCourseAdmin);
        this.isLecturer.current.val(item.isLecturer);
        this.isStaff.current.val(item.isStaff);

        let userRoles = item.roles.map(item => item._id),
            allRoles = this.props.allRoles.map(item => ({ id: item._id, text: item.name }));
        $('#userRoles').select2({ placeholder: 'Lựa chọn Vai trò', data: allRoles }).val(userRoles).trigger('change');

        this.setState({ _id: item._id, image: item.image, sex: item.sex });
        this.imageBox.current.setData(`user:${item._id ? item._id : 'new'}`);
        $(this.modal.current).modal('show');
    }

    onSubmit = () => {
        const birthday = $('#userBirthday').val() ? T.formatDate($('#userBirthday').val()) : null;
        let changes = {
            sex: this.sex.current.val(),
            firstname: $('#userFirstname').val().trim(),
            lastname: $('#userLastname').val().trim(),
            email: $('#userEmail').val().trim(),
            phoneNumber: $('#userPhoneNumber').val().trim(),
            active: $('#userActive').prop('checked'),
            isCourseAdmin: this.isCourseAdmin.current.val(),
            isLecturer: this.isLecturer.current.val(),
            isStaff: this.isStaff.current.val(),
            roles: $('#userRoles').val(),
            birthday
        };
        if (changes.firstname == '') {
            T.notify('Tên người dùng bị trống!', 'danger');
            $('#userFirstname').focus();
        } else if (changes.lastname == '') {
            T.notify('Họ người dùng bị trống!', 'danger');
            $('#userLastname').focus();
        } else if (changes.email == '') {
            T.notify('Email người dùng bị trống!', 'danger');
            $('#userEmail').focus();
        } else {
            if (changes.roles.length == 0) changes.roles = 'empty';
            if (this.state._id) {
                this.props.updateUser(this.state._id, changes);
            } else {
                this.props.createUser(changes);
            }
            $(this.modal.current).modal('hide');
        }
    }

    render = () => {
        const permissionWrite = this.props.permissionWrite;
        return this.renderModal({
            title: 'Thông tin người dùng',
            size: 'large',
            body: (
                <div className='row'>
                    <div className='col-md-8'>
                        <div className='row'>
                            <div className='form-group col-md-8'>
                                <label htmlFor='userLastname'>Họ & tên đệm</label>
                                <input className='form-control' id='userLastname' type='text' placeholder='Họ & tên đệm' readOnly={!permissionWrite} />
                            </div>
                            <div className='form-group col-md-4'>
                                <label htmlFor='userFirstname'>Tên</label>
                                <input className='form-control' id='userFirstname' type='text' placeholder='Tên' readOnly={!permissionWrite} />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label htmlFor='userEmail'>Email người dùng</label>
                            <input className='form-control' id='userEmail' type='email' placeholder='Email người dùng' readOnly={!permissionWrite} />
                        </div>
                    </div>

                    <div className='col-md-4 form-group' style={{ visibility: this.state._id ? 'visible' : 'hidden' }}>
                        <label>Hình đại diện</label>
                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='UserImage' userData='user' readOnly={!permissionWrite} image={this.state.image} />
                    </div>

                    <div className='col-md-4 form-group'>
                        <label htmlFor='userPhoneNumber'>Số điện thoại</label>
                        <input className='form-control' id='userPhoneNumber' type='text' placeholder='Số điện thoại' readOnly={!permissionWrite} />
                    </div>
                    <div className='col-md-4 form-group'>
                        <label htmlFor='userBirthday'>Ngày sinh</label>
                        <input className='form-control' id='userBirthday' type='text' placeholder='Ngày sinh' readOnly={!permissionWrite} />
                    </div>
                    <div className='col-md-4 form-group' style={{ display: 'inline-flex' }}>
                        <label style={{ whiteSpace: 'nowrap' }}>Giới tính: </label>&nbsp;&nbsp;
                        {permissionWrite ?
                            <Select ref={this.sex} displayLabel={false}
                                adapter={{
                                    ajax: true,
                                    processResults: () => ({
                                        results: [{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]
                                    })
                                }} label='Giới tính' /> : (this.state.sex ? this.state.sex : '')}
                    </div>

                    <Checkbox ref={this.isCourseAdmin} className='col-md-4 form-group' label='Quản trị viên khoá học' permissionWrite={permissionWrite} />
                    <Checkbox ref={this.isStaff} className='col-md-4 form-group' label='Nhân viên' permissionWrite={permissionWrite} />
                    <Checkbox ref={this.isLecturer} className='col-md-4 form-group' label='Giáo viên' permissionWrite={permissionWrite} />

                    <div className='col-md-12 form-group' style={{ display: this.state._id ? 'block' : 'none' }}>
                        <label htmlFor='userRoles'>Vai trò</label><br />
                        <select className='form-control' id='userRoles' multiple={true} disabled={!permissionWrite} defaultValue={[]}>
                            <optgroup label='Lựa chọn Vai trò' />
                        </select>
                    </div>
                    <Checkbox id='userActive' className='col-md-12 form-group' label='Kích hoạt' permissionWrite={permissionWrite} />
                </div>),
        });
    }
}

class UserPasswordModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => $('#userPassword1').focus()));
    }

    onShow = (item) => {
        $('#userPassword1').val('');
        $('#userPassword2').val('');
        $(this.modal.current).data('_id', item._id).modal('show');
    }

    onSubmit = () => {
        const thisModal = $(this.modal.current),
            _id = thisModal.data('_id'),
            password1 = $('#userPassword1').val().trim(),
            password2 = $('#userPassword2').val().trim();
        if (password1 == '') {
            T.notify('Mật khẩu bị trống!', 'danger');
            $('#userPassword1').focus();
        } else if (password2 == '') {
            T.notify('Vui lòng nhập lại mật khẩu!', 'danger');
            $('#userPassword2').focus();
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
            $('#userPassword2').focus();
        } else {
            this.props.updateUser(_id, { password: password1 }, error => error || thisModal.modal('hide'));
        }
    }

    render = () => this.renderModal({
        title: 'Đổi mật khẩu',
        body: <>
            <div className='form-group'>
                <label htmlFor='userPassword1'>Mật khẩu</label>
                <input className='form-control' id='userPassword1' type='password' placeholder='Mật khẩu' />
            </div>
            <div className='form-group'>
                <label htmlFor='userPassword2'>Nhập lại mật khẩu</label>
                <input className='form-control' id='userPassword2' type='password' placeholder='Mật khẩu' />
            </div>
        </>,
    });
}

class UserPage extends AdminPage {
    state = { searchText: '', isSearching: false };
    userModal = React.createRef();
    passwordModal = React.createRef();

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getAllRoles();
        this.props.getUserPage(1, 50, {});
        T.onSearch = (searchText) => this.props.getUserPage(undefined, undefined, searchText ? { searchText } : null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        this.userModal.current.show(item);
    }

    changePassword = (e, item) => {
        e.preventDefault();
        this.passwordModal.current.show(item);
    }

    changeActive = item => this.props.updateUser(item._id, { active: !item.active })

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
            isConfirm && this.props.deleteUser(item._id));
    }

    search = (e) => {
        e.preventDefault();
        let condition = {},
            searchText = $('#searchTextBox').val();
        if (searchText) condition.searchText = searchText;

        this.props.getUserPage(undefined, undefined, condition, () => {
            const isSearching = Object.keys(condition).length > 0;
            this.setState({ searchText, isSearching });
        });
    };

    render() {
        const permission = this.getUserPermission('user');
        const allRoles = this.props.role && this.props.role.items ? this.props.role.items : [];
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: null };
        let table = 'Không có người dùng!';
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered table-responsive'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '70%' }}>Tên</th>
                            <th style={{ width: '30%' }}>Email</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.user.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.lastname + ' ' + item.firstname}</a></td>
                                <td>{item.email}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }}>
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => this.changeActive(item, index)} disabled={!permission.write} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permission.write ? <a className='btn btn-info' href='#' onClick={e => this.changePassword(e, item)}><i className='fa fa-lg fa-key' /></a> : ''}
                                        {item.default || !permission.write ? null :
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}><i className='fa fa-lg fa-trash' /></a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        const renderData = {
            icon: 'fa fa-users',
            title: 'Người dùng',
            breadcrumb: ['Người dùng'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminUser' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getUserPage} />
                <UserModal ref={this.userModal} permissionWrite={permission.write} allRoles={allRoles}
                    updateUser={this.props.updateUser} createUser={this.props.createUser} getPage={this.props.getUserPage} />
                <UserPasswordModal updateUser={this.props.updateUser} permissionWrite={permission.write} ref={this.passwordModal} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.edit;
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, getAllRoles };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);