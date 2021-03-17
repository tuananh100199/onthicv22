import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem';
import Dropdown from 'view/component/Dropdown';
import ImageBox from 'view/component/ImageBox';
const countryList = require('country-list');

class ProfilePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { user: null };
        this.imageBox = React.createRef();

        this.firstname = React.createRef();
        this.lastname = React.createRef();
        this.email = React.createRef();
        this.phoneNumber = React.createRef();
        this.password1 = React.createRef();
        this.password2 = React.createRef();

        this.sex = React.createRef();
        this.quocGia = React.createRef();
    }


    componentDidMount() {
        T.ready('/user', () => {
            $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
            $('#identityDate').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });

            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png';
                this.setState({ image });

                let { firstname, lastname, sex, birthday, phoneNumber, regularResidence, residence, identityCard, identityDate, identityIssuedBy } = this.props.system.user || { image: '/img/avatar.png', firstname: '', lastname: '', sex: '', birthday: '', nationality: 'VN' };
                $('#userLastname').val(lastname);
                $('#userFirstname').val(firstname);
                $('#birthday').datepicker('update', birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
                $('#phoneNumber').val(phoneNumber);
                $('#regularResidence').val(regularResidence);
                $('#residence').val(residence);
                $('#identityCard').val(identityCard);
                $('#identityDate').datepicker('update', identityDate ? T.dateToText(identityDate, 'dd/mm/yyyy') : '');
                $('#identityIssuedBy').val(identityIssuedBy);
                this.sex.current.setText(sex ? sex : '');
                this.imageBox.current.setData('profile', image ? image : '/img/avatar.png');
                // $(this.quocGia.current).select2({
                //     data: countryList.getCodes().map(id => ({ id, text: countryList.getName(id) })),
                //     placeholder: 'Chọn quốc gia'
                // }).val(nationality).trigger('change');
            }
        });
    }


    saveCommon = (e) => {
        const
            sex = this.sex.current.getSelectedItem(),
            changesOfUser = {
                firstname: $('#userFirstname').val(),
                lastname: $('#userLastname').val(),
                birthday: $('#birthday').val() ? T.formatDate($('#birthday').val()) : null,
                // residence: $('#residence').val(),
                phoneNumber: $('#phoneNumber').val(),
                // regularResidence: $('#regularResidence').val(),

                //identity
                // identityCard: $('#identityCard').val(),
                // identityDate: $('#identityDate').val() ? T.formatDate($('#identityDate').val()) : null,
                // identityIssuedBy: $('#identityIssuedBy').val(),
                // nationality: $(this.quocGia.current).val()
            };
        if (T.sexes.indexOf(sex) != -1) {
            changesOfUser.sex = sex;
        }
        if (!changesOfUser.lastname) {
            T.notify('Họ và tên lót bị trống', 'danger');
            $('#userLastname').focus();
        } else if (changesOfUser.firstname == '') {
            T.notify('Tên bị trống', 'danger');
            $('#userFirstName').focus();
        } else {
            this.props.updateProfile(changesOfUser);
            T.notify('Cập nhật thông tin cá nhân thành công', 'info');
        };
        e.preventDefault();
    }

    savePassword = () => {
        const password1 = $(this.password1.current).val(),
            password2 = $(this.password2.current).val();
        if (password1 == '') {
            T.notify('Mật khẩu mới của bạn bị trống!', 'danger');
            $(this.password1.current).focus();
        } else if (password2 == '') {
            T.notify('Bạn vui lòng nhập lại mật khẩu!', 'danger');
            $(this.password2.current).focus();
        } else if (password1 != password2) {
            T.notify('Mật khẩu không trùng nhau!', 'danger');
            $(this.password1.current).focus();
        } else {
            this.props.updateProfile({ password: password1 });
            T.notify('Cập nhật mật khẩu thành công', 'info');
        }
    }

    render() {
        const { email } = this.props.system && this.props.system.user ? this.props.system.user : { email: '' };
        let readOnly = true;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Thông tin cá nhân</h1>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin cá nhân</h3>
                    <div className='tile-body row'>
                        <div className='col-md-8'>
                            <div className='row'>
                                <div className='form-group col-md-6'>
                                    <label className='control-label' htmlFor='userLastname'>Họ và tên lót <span style={{ color: 'red' }}>*</span></label>
                                    <input type='text' className='form-control' id='userLastname' placeholder='Họ và tên lót' />
                                </div>
                                <div className='form-group col-md-6'>
                                    <label className='control-label' htmlFor='userFirstname'>Tên <span style={{ color: 'red' }}>*</span></label>
                                    <input type='text' className='form-control' id='userFirstname' placeholder='Tên' />
                                </div>

                                <div className='form-group col-md-6'>
                                    <label className='control-label' htmlFor='userEmail'>
                                        Email:&nbsp; <span>{this.props.system.user.email}</span>
                                    </label>
                                </div>
                                <div className='form-group col-md-6' style={{ display: 'flex' }}>
                                    <label className='control-label'>Giới tính:</label>
                                    <Dropdown ref={this.sex} style={{ marginLeft: '10px' }} text='' items={T.sexes} />
                                </div>

                                <div className='form-group col-md-6'>
                                    <label className='control-label'>Số điện thoại</label>
                                    <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber' />
                                </div>

                                <div className='form-group col-md-6' id='birthdaySection'>
                                    <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
                                    <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' autoComplete='off' data-date-container='#birthdaySection' />
                                </div>
                            </div>
                        </div>

                        <div className='form-group col-md-4'>
                            <label className='control-label'>Hình đại diện</label>
                            < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                        </div>

                        {/* <div className='form-group'>
                                    <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú</label>
                                    <textarea className='form-control' id='regularResidence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='5' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                                    <textarea className='form-control' id='residence' placeholder='Nơi cư trú' rows='3' />
                                </div>

                                <div className='row'>
                                    <div className='form-group col-md-12 col-lg-12 col-xl-5'>
                                        <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu)</label>
                                        <input className='form-control' type='text' id='identityCard' placeholder='Nhập số CMND' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-4' id='identityDateSection'>
                                        <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
                                        <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection' />
                                    </div>
                                    <div className='form-group col-md-12 col-lg-6 col-xl-3'>
                                        <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp</label>
                                        <input className='form-control' type='text' placeholder='Nơi cấp CMND' id='identityIssuedBy' />
                                    </div>
                                </div> */}
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={this.saveCommon}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Mật khẩu</h3>
                    <div className='tile-body row'>
                        <div className='form-group col-md-6'>
                            <label className='control-label'>Mật khẩu mới</label>
                            <input className='form-control' type='password' placeholder='Mật khẩu mới' ref={this.password1} defaultValue='' />
                        </div>
                        <div className='form-group col-md-6'>
                            <label className='control-label'>Nhập lại mật khẩu</label>
                            <input className='form-control' type='password' placeholder='Nhập lại mật khẩu' ref={this.password2} defaultValue='' />
                        </div>
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <button className='btn btn-primary' type='button' onClick={this.savePassword}>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
                    </div>
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateProfile };
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);
