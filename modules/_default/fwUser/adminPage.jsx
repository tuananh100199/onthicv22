import React from 'react';
import { connect } from 'react-redux';
import { getUserPage, createUser, updateUser, deleteUser, changeUser } from './redux';
import { changeSystemState } from 'modules/_default/_init/redux'
import { getRoleAll } from 'modules/_default/fwRole/redux';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, FormCheckbox, FormImageBox, FormDatePicker, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class UserModal extends AdminModal {
    state = { allRoles: [] };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        if (item == null) item = { _id: null, division: null, roles: [], active: true, isCourseAdmin: false, isLecturer: false, isStaff: false, birthday: '' };
        this.itemFirstname.value(item.firstname);
        this.itemLastname.value(item.lastname);
        this.itemBirthday.value(item.birthday);
        this.itemEmail.value(item.email);
        this.itemPhoneNumber.value(item.phoneNumber);
        this.itemIsCourseAdmin.value(item.isCourseAdmin);
        this.itemIsStaff.value(item.isStaff);
        this.itemIsLecturer.value(item.isLecturer);
        this.itemSex.value(item.sex);
        this.itemDivision.value(item.division ? { id: item.division._id, text: item.division.title + (item.division.isOutside ? ' (cơ sở ngoài)' : '') } : null);
        this.itemActive.value(item.active);
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
            isCourseAdmin: this.itemIsCourseAdmin.value(),
            isStaff: this.itemIsStaff.value(),
            isLecturer: this.itemIsLecturer.value(),
            roles: this.itemRoles.value(),
            birthday: this.itemBirthday.value(),
            division: this.itemDivision.value(),
            active: this.itemActive.value(),
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
            this.state._id ?
                this.props.update(this.state._id, changes, this.hide) :
                this.props.create(changes, this.hide);
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
            if (item && image && this.props.user && item._id == this.props.user._id) {
                const user = Object.assign({}, this.props.user, { image });
                this.props.changeSystemState({ user });
            }
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
                    <FormImageBox ref={e => this.imageBox = e} className='col-md-4' style={{ display: this.state._id ? 'block' : 'none' }} label='Hình đại diện' uploadType='UserImage' image={this.state.image} readOnly={readOnly}
                        onSuccess={this.onUploadSuccess} />

                    <FormTextBox ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' readOnly={readOnly} />
                    <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} />
                    <FormSelect ref={e => this.itemSex = e} className='col-md-4' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />

                    <FormCheckbox ref={e => this.itemIsCourseAdmin = e} className='col-md-4' label='Quản trị viên khóa học' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsStaff = e} className='col-md-4' label='Nhân viên' readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemIsLecturer = e} className='col-md-4' label='Giáo viên' readOnly={readOnly} />

                    <FormSelect ref={e => this.itemRoles = e} className='col-md-12' label='Vai trò' data={this.state.allRoles} multiple={true} readOnly={readOnly} />
                    <FormSelect ref={e => this.itemDivision = e} className='col-md-8' label='Thuộc cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                    <FormCheckbox ref={e => this.itemActive = e} className='col-md-4' label='Kích hoạt' readOnly={readOnly} />
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
        const pageNumber = this.props.pageNumber,
            pageSize = this.props.pageSize;
        return (
            <div style={{ display: 'flex' }}>
                <label>All:</label>
                <div className='toggle'>
                    <label>
                        <input type='checkbox' checked={isAll} onChange={() => {
                            // const changes = {
                            //     isCourseAdmin: isCourseAdmin,
                            //     isStaff: isStaff,
                            //     isLecturer: isLecturer,
                            //     isAll: !isAll
                            // }
                            this.props.getUserPage(pageNumber, pageSize)
                            // this.props.setRoleFilter(changes)
                            this.props.setRoleFilter({ type: ['all'] })
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>Quản trị khóa học:</label>
                <div className='toggle'>
                    <label>
                        <input type='checkbox' checked={isCourseAdmin} onChange={() => {
                            // const changes = {
                            //     isCourseAdmin: !isCourseAdmin,
                            //     isStaff: isStaff,
                            //     isLecturer: isLecturer,
                            //     isAll: isAll
                            // }
                            this.props.getUserPage(pageNumber, pageSize, { type: ['isCourseAdmin'] })
                            this.props.setRoleFilter({ type: ['isCourseAdmin'] })
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>Nhân viên:</label>
                <div className='toggle'>
                    <label>
                        <input type='checkbox' checked={isStaff} onChange={() => {
                            // const changes = {
                            //     isCourseAdmin: isCourseAdmin,
                            //     isStaff: !isStaff,
                            //     isLecturer: isLecturer,
                            //     isAll: isAll
                            // }
                            this.props.getUserPage(pageNumber, pageSize, { type: ['isStaff'] })
                            // this.props.setRoleFilter(changes)
                            this.props.setRoleFilter({ type: ['isStaff'] })
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
                <label>Giáo viên:</label>
                <div className='toggle'>
                    <label>
                        <input type='checkbox' checked={isLecturer} onChange={() => {
                            // const changes = {
                            //     isCourseAdmin: isCourseAdmin,
                            //     isStaff: isStaff,
                            //     isLecturer: !isLecturer,
                            //     isAll: isAll
                            // }
                            this.props.getUserPage(pageNumber, pageSize, { type: ['isLecturer'] })
                            this.props.setRoleFilter({ type: ['isLecturer'] })
                            // this.props.setRoleFilter(changes)
                        }} />
                        <span className='button-indecator' />
                    </label>
                </div>
            </div>

        );
    }
}

// const roleFilter = (T.cookie('roleFilter') ? T.cookie('roleFilter') : { isCourseAdmin: false, isStaff: false, isLecturer: false, isAll: true });
const roleFilter = (T.cookie('roleFilter') ? T.cookie('roleFilter') : { type: ['all'] });
class UserPage extends AdminPage {
    state = { searchText: '', isSearching: false, roleFilter };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getRoleAll();
        this.props.getUserPage(1, null, this.state.roleFilter.type == 'all' ? {} : this.state.roleFilter, (page) => {

            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('user')) {
                const _userId = urlParams.get('user');
                page && page.list && page.list.forEach(user => user._id == _userId && this.userModal.show(user));
            }
        });

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
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Tên</th>
                    <th style={{ width: '30%' }}>Email</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: '30%' }}>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.email} />
                    <TableCell type='image' content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='text' content={item.division ? `${item.division.title} ${item.division.isOutside ? '(ngoài)' : ''}` : ''} />
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
            header: <RoleFilter getUserPage={this.props.getUserPage} setRoleFilter={this.setRoleFilter} filter={this.state.roleFilter} pageNumber={pageNumber} pageSize={pageSize} />,
            breadcrumb: ['Người dùng'],
            content: <>
                <div className='tile-table-fix-head'>{table}</div>
                <Pagination name='adminUser' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getUserPage} />
                <UserModal ref={e => this.userModal = e} readOnly={!permission.write} allRoles={allRoles} user={this.props.system ? this.props.system.user : null}
                    update={this.props.updateUser} create={this.props.createUser} change={this.props.changeUser} getPage={this.props.getUserPage}
                    changeSystemState={this.props.changeSystemState} />
                <UserPasswordModal ref={e => this.passwordModal = e} readOnly={!permission.write} updateUser={this.props.updateUser} />
            </>,
            onCreate: permission.write ? e => e.preventDefault() || this.userModal.show() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.user, role: state.role });
const mapActionsToProps = { getUserPage, createUser, updateUser, deleteUser, changeUser, changeSystemState, getRoleAll };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);