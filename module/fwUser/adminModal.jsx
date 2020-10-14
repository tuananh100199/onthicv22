import React from 'react';
import ImageBox from '../../view/component/ImageBox.jsx';
import Dropdown from '../../view/component/Dropdown.jsx';

export class UserPasswordModal extends React.Component {
    modal = React.createRef();
    state = {};

    componentDidMount() {
        T.ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#userPassword1').focus());
        });
    }

    show = (item) => {
        $('#userPassword1').val('');
        $('#userPassword2').val('');
        this.setState({ _id: item._id });
        $(this.modal.current).modal('show');
    };

    save = (event) => {
        const _id = this.state._id,
            password1 = $('#userPassword1').val().trim(),
            password2 = $('#userPassword2').val().trim();
        console.log(_id);
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
            this.props.updateUser(_id, { password: password1 }, error => {
                if (error == undefined || error == null) {
                    $(this.modal.current).modal('hide');
                }
            });
        }
        event.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Đổi mật khẩu</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='userPassword1'>Mật khẩu</label>
                                <input className='form-control' id='userPassword1' type='password'
                                    placeholder='Mật khẩu' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='userPassword2'>Nhập lại mật khẩu</label>
                                <input className='form-control' id='userPassword2' type='password'
                                    placeholder='Mật khẩu' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' onClick={this.save}>Lưu</button>
                        </div>
                    </div>Ư
                </form>
            </div>
        );
    }
}

export class RolesModal extends React.Component {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        T.ready(() => {
            $('#userRoles').select2();
            $(this.modal.current).on('shown.bs.modal', () => $('#userRoles').focus())
        });
    }

    show = (item) => {
        const { _id, firstname, roles } = item ?
            item : { roles: [] };
        this.setState({ _id });

        T.ready(() => {
            let userRoles = roles.map(item => item._id),
                allRoles = this.props.allRoles.map(item => ({ id: item._id, text: item.name }));
            $('#userName').val(firstname);
            $('#roles').select2({ placeholder: 'Lựa chọn Vai trò', data: allRoles }).val(userRoles).trigger('change');
        });

        $(this.modal.current).modal('show');
    };

    save = (event) => {
        this.props.updateUser(this.state._id, { roles: $('#roles').val() });
        $(this.modal.current).modal('hide');
        event.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Cập nhật vai trò</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='roles' className='control-label'>Vai trò</label><br />
                                <select className='form-control' id='roles' multiple={true} defaultValue={[]}>
                                    <optgroup label='Lựa chọn Vai trò' />
                                </select>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    };

}

export class UserModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { };

        this.modal = React.createRef();
        this.sex = React.createRef();
        this.imageBox = React.createRef();
    }

    componentDidMount() {
        const hasUpdate = this.props.hasUpdate;
        $(document).ready(() => setTimeout(() => {
            hasUpdate && $('#userRoles').select2();
            $('#userBirthday').datepicker({ format: 'dd/mm/yyyy', autoclose: true });
            $(this.modal.current).on('shown.bs.modal', () => $('#userLastname').focus())
        }, 250));
    }

    componentDidUpdate() {
        $(document).ready(() => {

        });
    }

    show = (_item) => {
        const item = _item ?
            _item : { _id: null, roles: [] };
        $('#userFirstname').val(item.firstname);
        $('#userLastname').val(item.lastname);
        $('#userBirthday').val(item.birthday ? T.dateToText(item.birthday, 'dd/mm/yyyy') : '');
        $('#userEmail').val(item.email);
        $('#userPhoneNumber').val(item.phoneNumber);
        $('#userActive').prop('checked', item.active);
        this.sex && this.sex.current && this.sex.current.setText(item.sex ? item.sex : '');
        T.ready(() => {
            let userRoles = item.roles.map(item => item._id),
                allRoles = this.props.allRoles.map(item => ({ id: item._id, text: item.name }));
            $('#userRoles').select2({
                placeholder: 'Lựa chọn Vai trò',
                data: allRoles
            }).val(userRoles).trigger('change');
        });

        this.setState({
            _id: item._id,
            image: item.image,
            sex: item.sex
        });
        this.imageBox.current.setData('user:' + (item._id ? item._id : 'new'));
        $(this.modal.current).modal('show');
    };

    save = (event) => {
        const sex = this.sex.current.getSelectedItem().toLowerCase(),
            birthday = $('#userBirthday').val() ? T.formatDate($('#userBirthday').val()) : null;
        let changes = {
            firstname: $('#userFirstname').val().trim(),
            lastname: $('#userLastname').val().trim(),
            email: $('#userEmail').val().trim(),
            phoneNumber: $('#userPhoneNumber').val().trim(),
            active: $('#userActive').prop('checked'),
            roles: $('#userRoles').val(),
            birthday
        };

        if (T.sexes.indexOf(sex) != -1) {
            changes.sex = sex;
        }
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
        event.preventDefault();
    };

    render() {
        const hasUpdate = this.props.hasUpdate;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin người dùng</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='row'>
                                <div className='col-md-8 col-12'>
                                    <div className='form-group row'>
                                        <div className='col-12 col-sm-8'>
                                            <label htmlFor='userLastname'>Họ người dùng</label>
                                            <input className='form-control' id='userLastname' type='text'
                                                placeholder='Họ người dùng' readOnly={!hasUpdate} />
                                        </div>
                                        <div className='col-12 col-sm-4'>
                                            <label htmlFor='userFirstname'>Tên người dùng</label>
                                            <input className='form-control' id='userFirstname' type='text'
                                                placeholder='Tên người dùng' readOnly={!hasUpdate} />
                                        </div>
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='userEmail'>Email người dùng</label>
                                        <input className='form-control' id='userEmail' type='email'
                                            placeholder='Email người dùng' readOnly={!hasUpdate} />
                                    </div>
                                    <div className='form-group row'>
                                        <div className='col-12 col-sm-6'>
                                            <label htmlFor='userBirthday'>Ngày sinh</label>
                                            <input className='form-control' id='userBirthday' type='text'
                                                placeholder='Ngày sinh' readOnly={!hasUpdate} />
                                        </div>
                                        <div className='col-12 col-sm-6'>
                                            <label htmlFor='userPhoneNumber'>Số điện thoại</label>
                                            <input className='form-control' id='userPhoneNumber' type='text'
                                                placeholder='Số điện thoại' readOnly={!hasUpdate}/>
                                        </div>
                                    </div>
                                </div>
                                <div className='col-md-4 col-12'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='UserImage'
                                            userData='user' readOnly={!hasUpdate} image={this.state.image} />
                                    </div>
                                    <div className='form-group' style={{ display: 'inline-flex', width: '100%' }}>
                                        <label>Giới tính: </label>&nbsp;&nbsp;
                                        {hasUpdate ? <Dropdown ref={this.sex} text='' items={T.sexes} /> : (this.state.sex ? this.state.sex : '')}
                                    </div>
                                </div>
                                <div className='col-12 row'>
                                    <div className='col-12 col-md-8 form-group'>
                                        <label htmlFor='userRoles' className='control-label'>Vai trò</label><br />
                                        <select className='form-control' id='userRoles' multiple={true} disabled={!hasUpdate}
                                            defaultValue={[]}>
                                            <optgroup label='Lựa chọn Vai trò' />
                                        </select>
                                    </div>
                                </div>
                                <div className='col-12 row'>
                                    <div className='col-4'>
                                        <div className='form-group' style={{ display: 'inline-flex', width: '100%' }}>
                                            <label htmlFor='userActive'>Kích hoạt: </label>&nbsp;&nbsp;
                                                <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' id='userActive' disabled={!hasUpdate} onChange={() => {
                                                    }} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {hasUpdate ? <button type='submit' className='btn btn-primary'>Lưu</button> : ''}
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
