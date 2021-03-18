import React from 'react';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser } from './redux';
import { getAllRoles } from '../fwRole/redux';
import Pagination from 'view/component/Pagination';
import ImageBox from 'view/component/ImageBox';
import { Select } from 'view/component/Input';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class UserModal extends AdminModal {
    state = {};
    sex = React.createRef();
    imageBox = React.createRef();

    componentDidMount() {
        $(document).ready(() => {
            !this.props.readOnly && $('#userRoles').select2();
            $('#userBirthday').datepicker({ format: 'dd/mm/yyyy', autoclose: true });
            $(this.modal.current).on('shown.bs.modal', () => this.itemLastname.focus())
        });
    }

    onShow = (item) => {
        if (item == null) item = { _id: null, roles: [], active: true, isCourseAdmin: false, isLecturer: false, isStaff: false };
        this.itemFirstname.value(item.firstname);
        this.itemLastname.value(item.lastname);
        $('#userBirthday').val(item.birthday ? T.dateToText(item.birthday, 'dd/mm/yyyy') : '');
        this.itemEmail.value(item.email);
        this.itemPhoneNumber.value(item.phoneNumber);
        this.itemActive.value(item.active);
        this.itemIsCourseAdmin.value(item.isCourseAdmin);
        this.itemIsStaff.value(item.isStaff);
        this.itemIsLecturer.value(item.isLecturer);
        this.sex.current.val({ id: item.sex, text: item.sex === 'male' ? 'Nam' : 'Nữ' });

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
            firstname: this.itemFirstname.value().trim(),
            lastname: this.itemLastname.value().trim(),
            email: this.itemEmail.value().trim(),
            phoneNumber: this.itemPhoneNumber.value().trim(),
            active: this.itemActive.value(),
            isCourseAdmin: this.itemIsCourseAdmin.value(),
            isStaff: this.itemIsStaff.value(),
            isLecturer: this.itemIsLecturer.value(),
            roles: $('#userRoles').val(),
            birthday
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
                    <div className='col-md-8'>
                        <div className='row'>
                            <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} />
                            <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} />
                        </div>
                        <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                    </div>

                    <div className='col-md-4 form-group' style={{ visibility: this.state._id ? 'visible' : 'hidden' }}>
                        <label>Hình đại diện</label>
                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='UserImage' userData='user' readOnly={readOnly} image={this.state.image} />
                    </div>

                    <FormTextBox ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' readOnly={readOnly} />
                    <div className='col-md-4 form-group'>
                        <label htmlFor='userBirthday'>Ngày sinh</label>
                        <input className='form-control' id='userBirthday' type='text' placeholder='Ngày sinh' readOnly={readOnly} />
                    </div>
                    <div className='col-md-4 form-group'>
                        <label>Giới tính</label>
                        {readOnly ? (this.state.sex ? this.state.sex : '') :
                            <Select ref={this.sex} displayLabel={false}
                                adapter={{
                                    ajax: true,
                                    processResults: () => ({
                                        results: [{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]
                                    })
                                }} label='Giới tính' />}
                    </div>

                    <FormCheckbox ref={e => this.itemIsCourseAdmin = e} className='col-md-4' label='Quản trị viên khoá học' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsStaff = e} className='col-md-4' label='Nhân viên' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsLecturer = e} className='col-md-4' label='Giáo viên' readOnly={readOnly} />

                    <div className='col-md-12 form-group' style={{ display: this.state._id ? 'block' : 'none' }}>
                        <label htmlFor='userRoles'>Vai trò</label><br />
                        <select className='form-control' id='userRoles' multiple={true} disabled={readOnly} defaultValue={[]}>
                            <optgroup label='Lựa chọn Vai trò' />
                        </select>
                    </div>
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

    edit = (e, item) => e.preventDefault() || this.userModal.current.show(item);

    changePassword = (e, item) => e.preventDefault() || this.passwordModal.current.show(item);

    changeActive = item => this.props.updateUser(item._id, { active: !item.active })

    delete = (e, item) => e.preventDefault() || T.confirm('Người dùng: Xóa người dùng', 'Bạn có chắc bạn muốn xóa người dùng này?', true, isConfirm =>
        isConfirm && this.props.deleteUser(item._id));

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
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}><i className='fa fa-lg fa-edit' /></a>
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
                <UserModal ref={this.userModal} readOnly={!permission.write} allRoles={allRoles}
                    updateUser={this.props.updateUser} createUser={this.props.createUser} getPage={this.props.getUserPage} />
                <UserPasswordModal updateUser={this.props.updateUser} ref={this.passwordModal} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.edit;
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, getAllRoles };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);