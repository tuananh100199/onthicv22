import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { createCandidate } from './redux';

class SectionAdvisoryForm extends React.Component {
    componentDidMount() {
        $(document).ready(() => {
            this.props.viewId ?
                ajaxGetCourseType(this.props.viewId, data =>
                    this.courseType.value(data && data.item && { id: data.item._id, text: data.item.title })) : this.courseType.value(null);
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const user = this.props.system && this.props.system.user,
            data = {
                courseType: this.courseType.value(),
                firstname: user ? user.firstname : this.firstname.value,
                lastname: user ? user.lastname : this.lastname.value,
                email: user ? user.email : this.email.value,
                phoneNumber: this.phoneNumber.value
            };
        if (data.lastname == '' && this.lastname) {
            T.notify('Họ bị trống!', 'danger');
            this.lastname.focus();
        } else if (data.firstname == '' && this.firstname) {
            T.notify('Tên bị trống!', 'danger');
            this.firstname.focus();
        } else if (this.email && data.email != '' && !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.email.focus();
        } else if (data.phoneNumber == '' && this.phoneNumber) {
            T.notify('Số điện thoại bị trống!', 'danger');
            this.phoneNumber.focus();
        } else if (!data.courseType) {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.courseType.focus();
        } else {
            this.props.createCandidate(data, () => {
                !user ? this.firstname.value = this.lastname.value = this.email.value = this.phoneNumber.value = '' : null;
                T.notify('Đăng ký tư vấn của bạn đã được gửi!', 'success', true, 3000);
                this.props.hide && this.props.hide();
            });
        }
    }

    render() {
        const readOnly = this.props.system && this.props.system.user;
        const { firstname, lastname, email, phoneNumber } = this.props.system && this.props.system.user ?
            this.props.system.user : { firstname: '', lastname: '', email: '', phoneNumber: '' };
        if (this.firstname) this.firstname.value = firstname;
        if (this.lastname) this.lastname.value = lastname;
        if (this.email) this.email.value = email;
        if (this.phoneNumber) this.phoneNumber.value = phoneNumber || '';

        return (
            <div className='row'>
                <div className='intro intro_hang_GPLX col-md-6'>
                    <div className='intro_col'>
                        <div style={{ backgroundColor: '#199d76', width: '100%', paddingLeft: '33px', paddingRight: '34px', paddingBottom: '30px', paddingTop: '85px', boxShadow: '0px 25px 38px rgb(0 0 0 / 20% '}}>
                            <div style={{ position: 'absolute', top: 0, height: '80px', background: '#199d76', lineHeight: '80px', textAlign: 'center', fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>Các hạng giấy phép lái xe</div>
                            <div className='row' style={{ backgroundColor: 'white', border: '1px solid #199d76', margin: '5px 0' }}>
                                <div className='col-md-3' style={{ padding: '0', borderRight: '3px solid #199d76' }}>
                                    <h3 style={{ fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199d76' }}>B1</h3>
                                    <div style={{ textAlign: 'center'}}>
                                    <img alt='Những sai lầm lớn khi bảo dưỡng xe ô tô 2021' src='https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg' style={{width: '80px'}} />
                                    </div>
                                </div>

                                <div className='col-md-9 content' style={{ margin: 'auto', padding: '7px', color: '#199d76' }}>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- <span style={{ textIndent: '5px' }}>Cấp cho người điều kiển ô tô tự động chở người đến 09 chổ ngồi, ô tô tải chuyên dùng số tự động, có trọng tải thiết kế dưới 3500Kg, không chuyên nghiệp</span></p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Cho người có đủ sức khỏe từ 18 tuổi trở lên</p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Có thời hạn đến khi người lái xe đủ 55 tuổi đối với nữ và đủ 60 tuổi đối với nam; trường hợp người lái xe trên 45 tuổi đối với nữ và trên 50 tuổi đối với nam giấy phép lái xe được cấp có thời hạn 10 năm, kể từ ngày cấp.</p>
                                </div>
                            </div>
                            <div className='row' style={{ backgroundColor: 'white', border: '1px solid #199d76', margin: '5px 0' }}>
                                <div className='col-md-3' style={{ padding: '0', borderRight: '3px solid #199d76' }}>
                                    <h3 style={{ fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199d76' }}>B2</h3>
                                    <div style={{ textAlign: 'center' }}>
                                    <img alt='Những sai lầm lớn khi bảo dưỡng xe ô tô 2021' src='https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg' style={{width: '80px'}} />
                                    </div>
                                </div>
                                <div className='col-md-9' style={{ margin: 'auto', padding: '7px' }}>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Cấp cho người điều kiển ô tô chở người đến 09 chổ ngồi; ô tô tải, máy kéo kéo rơmooc có trọng tải dưới 3500Kg và xe hạng B1</p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Cho người có đủ sức khỏe từ 18 tuổi trở lên</p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Có thời hạn 10 năm, kể từ ngày cấp.</p>
                                </div>
                            </div>
                            <div className='row' style={{ backgroundColor: 'white', border: '1px solid #199d76', margin: '5px 0' }}>
                                <div className='col-md-3' style={{ padding: '0', borderRight: '3px solid #199d76' }}>
                                    <h3 style={{ fontWeight: 'bold', textAlign: 'center', paddingTop: '15px', color: '#199d76' }}>C</h3>
                                    <div style={{ textAlign: 'center' }}>
                                    <img alt='Những sai lầm lớn khi bảo dưỡng xe ô tô 2021' src='https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg' style={{width: '80px'}} />
                                    </div>
                                </div>
                                <div className='col-md-9' style={{ margin: 'auto', padding: '7px' }}>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Cấp cho người điều kiển ô tô tải, máy kéo kéo rơmooc, có trọng tải từ 3500Kg trở lên và xe hạng B1, B2</p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Cho người có đủ sức khỏe từ 21 tuổi trở lên.</p>
                                    <p style={{ fontSize: '12px', margin:'0px', lineHeight: 1.3, color: '#199d76' }}>- Có thời hạn 5 năm, kể từ ngày cấp.</p>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='intro col-md-6'>
                    <div className='intro_col'>
                        <div className='intro_form_container' style={{ boxShadow: 'rgb(0 0 0 / 20%) 0px 25px 38px' }}>
                            <div className='intro_form_title'>Đăng ký tư vấn</div>
                            <form action='#' className='intro_form' id='intro_form' onSubmit={this.onSubmit}>
                                <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                    {readOnly ?
                                        <div className='w-100'>
                                            <p style={{ width: '100%', padding: '0 8px' }}>Họ và Tên: <b>{lastname} {firstname}</b></p>
                                            <p style={{ width: '100%', padding: '0 8px', marginBottom: 16 }}>Email: <b>{email}</b></p>
                                        </div> :
                                        <>
                                            <p style={{ width: '50%', padding: '0 8px', margin: 0 }}>Họ<br />
                                                <input type='text' className='intro_input w-100' placeholder='Họ' ref={e => this.lastname = e} />
                                            </p>
                                            <p style={{ width: '50%', padding: '0 8px', margin: 0 }}>Tên<br />
                                                <input type='text' className='intro_input w-100' placeholder='Tên' ref={e => this.firstname = e} />
                                            </p>
                                            <p style={{ width: '50%', padding: '0 8px', margin: 0 }}>Email<br />
                                                <input type='text' className='intro_input w-100' placeholder='Email' ref={e => this.email = e} />
                                            </p>
                                        </>}

                                    <p style={{ width: readOnly ? '100%' : '50%', padding: '0 8px', margin: 0 }}>Số điện thoại:
                                        <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                            type='tel' className='intro_input w-100' placeholder='Số điện thoại' ref={e => this.phoneNumber = e} />
                                    </p>
                                    <div className='mb-5' style={{ width: '100%', padding: '0 8px', margin: 0 }}>
                                        <FormSelect ref={e => this.courseType = e} label='Loại khóa học:' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} labelStyle={{ color: '#828282' }} />
                                    </div>
                                </div>
                                <button className='button button_1 intro_button trans_200'>Đăng ký</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createCandidate };
export default connect(mapStateToProps, mapActionsToProps)(SectionAdvisoryForm);
