import React from 'react';
import { connect } from 'react-redux';
import { updateProfile, changeSystemState } from '../_init/redux';
import { AdminPage, FormTextBox, FormImageBox } from 'view/component/AdminPage';

class ProfilePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const { firstname, lastname, phoneNumber, image, email } = this.props.system && this.props.system.user ? this.props.system.user : { firstname: '', lastname: '', phoneNumber: '', image: '/img/avatar.png', email: '' };
                this.lastname.value(lastname);
                this.firstname.value(firstname);
                this.email.value(email);
                this.phoneNumber.value(phoneNumber);
                this.password1.value('');
                this.password2.value('');
                this.imageBox.setData('profile', image || '/img/avatar.png');

                this.setState({ image });
            }
        });
    }

    saveCommon = () => {
        const changes = {
            firstname: this.firstname.value(),
            lastname: this.lastname.value(),
            phoneNumber: this.phoneNumber.value(),
        };
        if (changes.lastname == '') {
            T.notify('Họ và tên lót bị trống', 'danger');
            this.lastname.focus();
        } else if (changes.firstname == '') {
            T.notify('Tên bị trống', 'danger');
            this.firstname.focus();
        } else {
            this.props.updateProfile(changes);
            T.notify('Cập nhật thông tin cá nhân thành công', 'info');
        }
    }

    savePassword = () => {
        const password1 = $(this.password1).val(),
            password2 = $(this.password2).val();
        if (password1 == '') {
            T.notify('Mật khẩu mới của bạn bị trống!', 'danger');
            $(this.password1).focus();
        } else if (password2 == '') {
            T.notify('Bạn vui lòng nhập lại mật khẩu!', 'danger');
            $(this.password2).focus();
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
            $(this.password1).focus();
        } else {
            this.props.updateProfile({ password: password1 });
            T.notify('Cập nhật mật khẩu thành công', 'info');
        }
    }

    // eslint-disable-next-line no-unused-vars
    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
            console.error(error);
        } else {
            if (image) {
                this.setState({ image });
                this.props.system && this.props.system.user && this.props.changeSystemState({ user: Object.assign({}, this.props.system.user, { image }) });
            }
        }
    }

    render() {
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Thông tin cá nhân',
            breadcrumb: ['Thông tin cá nhân'],
            content: <div className='row'>
                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin cá nhân</h3>
                        <div className='tile-body'>
                            <FormImageBox ref={e => this.imageBox = e} label='Hình đại diện' uploadType='ProfileImage' userData='profile' image={this.state.image} onSuccess={this.onUploadSuccess} />
                            <FormTextBox ref={e => this.lastname = e} label='Họ và tên lót' />
                            <FormTextBox ref={e => this.firstname = e} label='Tên' />
                            <FormTextBox ref={e => this.email = e} type='email' label='Email' readOnly={true} />
                            <FormTextBox ref={e => this.phoneNumber = e} type='phone' label='Số điện thoại' />
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.saveCommon}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </div>

                <div className='col-md-6'>
                    <div className='tile'>
                        <h3 className='tile-title'>Mật khẩu mới</h3>
                        <div className='tile-body'>
                            <FormTextBox ref={e => this.password1 = e} type='password' label='Mật khẩu mới' />
                            <FormTextBox ref={e => this.password2 = e} type='password' label='Nhập lại mật khẩu mới' />
                        </div>
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.savePassword}>
                                <i className='fa fa-fw fa-lg fa-save' /> Thay đổi mật khẩu
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateProfile, changeSystemState };
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);