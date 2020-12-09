import React from 'react';
import { connect } from 'react-redux';
import { updateProfile } from '../_init/reduxSystem.jsx';
import Dropdown from '../../view/component/Dropdown.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

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
            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png';
                this.setState({ image });
                this.renderData(this.props.system.user, [], () => {
                    setTimeout(() => {
                        $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                        $('#identityDate').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });

                    }, 250);
                });
            }
        });
    }

    renderData = (user, allDivisions, callback) => {
        let { firstname, lastname, email, phoneNumber, birthday, sex, image, identityCard, issuedBy, residence,identityDate } = user ?
                user : { firstname: '', lastname: '', phoneNumber: '', birthday: '', sex: '', image: '/img/avatar.png', identityCard:'', issuedBy:'', residence:'', identityDate:'' };

        $('#userLastname').val(lastname);
        $('#userFirstname').val(firstname);
        $('#email').html(email);
        $('#birthday').val(birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
        $('#phoneNumber').val(phoneNumber);
        $('#identityCard').val(identityCard);
        $('#issuedBy').val(issuedBy);
        $('#residence').val(residence);
        $('#identityDate').val(identityDate ? T.dateToText(identityDate, 'dd/mm/yyyy') : '');

        this.sex.current.setText(sex ? sex : '');
        this.imageBox.current.setData('profile', image ? image : '/img/avatar.png');
        callback && callback();
    }

    saveCommon = (e) => {
        let sex = this.sex.current.getSelectedItem().toLowerCase(),
            birthday = $('#birthday').val() ? T.formatDate($('#birthday').val()) : null,
            identityDate = $('#identityDate').val() ? T.formatDate($('#identityDate').val()) : null,

            changes = {
                firstname: $('#userFirstname').val(),
                lastname: $('#userLastname').val(),
                phoneNumber: $('#phoneNumber').val(),
                birthday: birthday ? birthday : 'empty',
                identityCard: $('#identityCard').val(),
                issuedBy: $('#issuedBy').val(),
                residence: $('#residence').val(),
                identityDate: identityDate ? identityDate : 'empty',


                
            };
        if (T.sexes.indexOf(sex) != -1) {
            changes.sex = sex;
        }
        if (changes.firstname == '') {
            T.notify('Tên bị trống!', 'danger');
            $('#userFirstName').focus();
        } else if (changes.lastname == '') {
            T.notify('Họ và tên lót bị trống!', 'danger');
            $('#userLastName').focus();
        } else {
            this.props.updateProfile(changes);
        }
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
        }
    }

    render() {
        const { email } = this.props.system && this.props.system.user ? this.props.system.user : { email: '' };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-user' /> Thông tin cá nhân</h1>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-8'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin cá nhân</h3>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='col-12 col-lg-8 order-2 order-lg-1'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userLastname'>Họ và tên lót</label>
                                            <input className='form-control' id='userLastname' type='text' placeholder='Họ và tên lót' />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userFirstname'>Tên</label>
                                            <input className='form-control' type='text' id='userFirstname' placeholder='Tên' />
                                        </div>
                                    </div>
                                    <div className='col-12 col-lg-4 order-1 order-lg-2'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình đại diện</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-12 col-lg-8'>
                                        <div className='form-group'
                                             style={{ display: 'inline-flex', width: '100%' }}>
                                            <label className='control-label'>Email: <span
                                                    id='email' /></label>
                                        </div>
                                    </div>
                                    <div className='col-12 col-lg-4'>
                                        <div className='form-group'
                                             style={{ display: 'inline-flex', width: '100%' }}>
                                            <label>Giới tính: </label>&nbsp;&nbsp;
                                            <Dropdown ref={this.sex} text='' items={T.sexes} />
                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-12 col-sm-6'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='phoneNumber'>Số điện thoại</label>
                                            <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber' />
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-6'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='birthday'>Ngày
                                                sinh</label>
                                            <input className='form-control' type='text'
                                                   placeholder='Ngày sinh' id='birthday' />
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-6'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor="country">Quốc tịch:</label>
                                            <select className='form-control select2-input' ref={this.quocGia}/>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-6'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='identityCard'>CMND</label>
                                            <input className='form-control' type='text' id='identityCard'
                                                placeholder='Nhập số cmnd...'/>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-12'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='issuedBy'>Nơi cấp</label>
                                            <input className='form-control' type='text' id='issuedBy'
                                                placeholder='Nhập số cmnd...'/>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-12'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='identityDate'>Ngày cấp</label>
                                            <input className='form-control' type='text' id='identityDate'
                                                placeholder='Nhập số cmnd...'/>
                                        </div>
                                    </div>
                                    <div className='col-12 col-sm-12'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                                            <input className='form-control' type='text' id='residence'
                                                placeholder='Nhập số cmnd...'/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button className='btn btn-primary' type='button' onClick={this.saveCommon}>Lưu</button>
                            </div>
                        </div>
                    </div>
                    <div className='col-12 col-md-4'>
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
