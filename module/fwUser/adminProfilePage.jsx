import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem.jsx';
import Dropdown from '../../view/component/Dropdown.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';
import T from '../../view/js/common.js';
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

                let { firstname, lastname, sex, birthday, phoneNumber, regularResidence, residence, identityCard, identityDate, identityIssuedBy, nationality } = this.props.system.user || { image: '/img/avatar.png', firstname: '', lastname: '', sex: '', birthday: '', nationality: 'VN' };
                $('#userLastname').val(lastname);
                $('#userFirstname').val(firstname);
                $('#birthday').val(birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
                $('#phoneNumber').val(phoneNumber);
                $('#regularResidence').val(regularResidence);
                $('#residence').val(residence);
                $('#identityCard').val(identityCard);
                $('#identityDate').val(identityDate ? T.dateToText(identityDate, 'dd/mm/yyyy') : '');
                $('#identityIssuedBy').val(identityIssuedBy);
                this.sex.current.setText(sex ? sex : '');
                this.imageBox.current.setData('profile', image ? image : '/img/avatar.png');
                $(this.quocGia.current).select2({
                    data: countryList.getCodes().map(id => ({ id, text: countryList.getName(id) })),
                    placeholder: 'Chọn quốc gia'
                }).val(nationality).trigger('change');
            }
        });
    }


    saveCommon = (e) => {
        const
            sex = this.sex.current.getSelectedItem().toLowerCase(),
            changesOfUser = {
                firstname: $('#userFirstname').val(),
                lastname: $('#userLastname').val(),
                birthday: $('#birthday').val() ? T.formatDate($('#birthday').val()) : null,
                residence: $('#residence').val(),
                phoneNumber: $('#phoneNumber').val(),
                regularResidence: $('#regularResidence').val(),

                //identity
                identityCard: $('#identityCard').val(),
                identityDate: $('#identityDate').val() ? T.formatDate($('#identityDate').val()) : null,
                identityIssuedBy: $('#identityIssuedBy').val(),
                nationality: $(this.quocGia.current).val()
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
            }
            else if (changesOfUser.birthday == null) {
                T.notify('Ngày sinh bị trống', 'danger');
                $('#birthday').focus();
            }
            else if (changesOfUser.phoneNumber == '') {
                T.notify('Số điện thoại bị trống', 'danger');
                $('#phoneNumber').focus();
            }
            else if (changesOfUser.regularResidence == '') {
                T.notify('Nơi đăng ký hộ khẩu thường trú bị trống', 'danger');
                $('#regularResidence').focus();
            }
            else if (changesOfUser.residence == '') {
                T.notify('Nơi cư trú bị trống', 'danger');
                $('#residence').focus();
            }
            else if (changesOfUser.identityCard == '') {
                T.notify('Số chứng minh nhân dân bị trống', 'danger');
                $('#identityCard').focus();
            }
            else if (changesOfUser.identityDate == null) {
                T.notify('Ngày cấp chứng minh nhân dân bị trống', 'danger');
                $('#identityDate').focus();
            }
            else if (changesOfUser.identityIssuedBy == '') {
                T.notify('Nơi cấp chứng minh nhân dân bị trống', 'danger');
                $('#identityIssuedBy').focus();
            }
             else {
                    this.props.updateProfile(changesOfUser);
                    T.notify('Cập nhật thông tin cá nhân thành công','info');
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
            T.notify('Cập nhật mật khẩu thành công','info');
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
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin cá nhân</h3>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='userLastname'>Họ và tên lót</label>
                                        <input type='text' className='form-control' id='userLastname' placeholder='Họ và tên lót' />
                                    </div>
                                    <div className='form-group col-md-3'>
                                        <label className='control-label' htmlFor='userFirstname'>Tên</label>
                                        <input type='text' className='form-control' id='userFirstname' placeholder='Tên' />
                                    </div>
                                    <div className='form-group col-md-3'>
                                        <label className='control-label'>Quốc tịch</label>
                                        <select className='form-control select2-input' ref={this.quocGia}/>
                                    </div>
                                </div>
                                
                                <div className='row'>
                                    <div className='form-group col-md-3' id='birthdaySection'>
                                        <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
                                        <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' autoComplete='off' data-date-container='#birthdaySection'/>
                                    </div>
                                    <div className='form-group col-md-3'>
                                                <div className='form-group' style={{ width: '100%' }}>
                                                    <label className='control-label' style={{marginLeft: '-10px'}}>Giới tính: </label>
                                                    <Dropdown  ref={this.sex} text='' items={T.sexes} />
                                                </div>
                                            </div>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label'>Số điện thoại</label>
                                        <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber'/>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú:</label>
                                            <textarea className='form-control' id='regularResidence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='5'/>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className='form-group'>
                                            <label className='control-label'>Hình đại diện</label>
                                            < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                                    <textarea className='form-control' id='residence' placeholder='Nơi cư trú' rows='3'/>
                                </div>
            
                                <div className='row'>   
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu)</label>
                                        <input className='form-control' type='text' id='identityCard'
                                            placeholder='Nhập số CMND'/>
                                    </div>
                                    <div className='form-group col-md-3' id='identityDateSection'>
                                        <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
                                        <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection'/>
                                    </div>
                                    <div className='form-group col-md-3'>
                                        <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp</label>
                                        <input className='form-control' type='text' placeholder='Nơi cấp CMND' id='identityIssuedBy'/>
                                    </div>
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveCommon}>Lưu</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                     <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Mật khẩu</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Mật khẩu mới</label>
                                    <input className='form-control' type='password' placeholder='Mật khẩu mới' ref={this.password1} defaultValue='' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Nhập lại mật khẩu</label>
                                    <input className='form-control' type='password' placeholder='Nhập lại mật khẩu' ref={this.password2} defaultValue='' />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.savePassword}>Lưu</button>
                            </div>
                        </div>
                    </div> 
                </div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateProfile };
export default connect(mapStateToProps, mapActionsToProps)(ProfilePage);
