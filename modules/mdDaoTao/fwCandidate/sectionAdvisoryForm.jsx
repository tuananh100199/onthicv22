import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { createCandidate } from './redux';
import './style.css';

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
            <div className='section_hang_GPLX'>
                <div className='container'>
                    <div className='row'>
                        <div className='intro intro_hang_GPLX col-lg-6 col-md-12'>
                            <div className='intro_col'>
                                <div className='wrap_GPLX'>
                                    <div className='title_GPLX'>Các hạng giấy phép lái xe</div>
                                    <div className='row wrap_item_GPLX'>
                                        <div className='col-md-3 img_item'>
                                            <h3 className='title_img'>B1</h3>
                                            <div className='wrap_img'>
                                                <img alt='hạng b1' src='https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg'/>
                                            </div>
                                        </div>

                                        <div className='col-md-9 content_item'>
                                            <p>- Cấp cho người điều kiển ô tô tự động chở người đến 09 chổ ngồi, ô tô tải chuyên dùng số tự động, có trọng tải thiết kế dưới 3500Kg, không chuyên nghiệp</p>
                                            <p>- Cho người có đủ sức khỏe từ 18 tuổi trở lên</p>
                                            <p>- Có thời hạn đến khi người lái xe đủ 55 tuổi đối với nữ và đủ 60 tuổi đối với nam; trường hợp người lái xe trên 45 tuổi đối với nữ và trên 50 tuổi đối với nam giấy phép lái xe được cấp có thời hạn 10 năm, kể từ ngày cấp.</p>
                                        </div>
                                    </div>
                                    <div className='row wrap_item_GPLX'>
                                        <div className='col-md-3 img_item'>
                                            <h3 className='title_img'>B2</h3>
                                            <div className='wrap_img'>
                                                <img alt='hạng b2' src='https://truongdaotaolaixehcm.com/wp-content/uploads/2018/03/nhung-sai-lam-lon-khi-bao-duong-xe-o-to-1024x768.jpg'/>
                                            </div>
                                        </div>
                                        <div className='col-md-9 content_item'>
                                            <p>- Cấp cho người điều kiển ô tô chở người đến 09 chổ ngồi; ô tô tải, máy kéo kéo rơmooc có trọng tải dưới 3500Kg và xe hạng B1</p>
                                            <p>- Cho người có đủ sức khỏe từ 18 tuổi trở lên</p>
                                            <p>- Có thời hạn 10 năm, kể từ ngày cấp.</p>
                                        </div>
                                    </div>
                                    <div className='row wrap_item_GPLX'>
                                        <div className='col-md-3 img_item'>
                                            <h3 className='title_img'>C</h3>
                                            <div className='wrap_img'>
                                                <img alt='hạng c' src='https://ototaihyundaicantho.com/public/upload/images/hinhsanpham/xe-tai-hyundai-mighty-110s-7-tan-thung-mui-bac-27021575272648.png'/>
                                            </div>
                                        </div>
                                        <div className='col-md-9 content_item'>
                                            <p>- Cấp cho người điều kiển ô tô tải, máy kéo kéo rơmooc, có trọng tải từ 3500Kg trở lên và xe hạng B1, B2</p>
                                            <p>- Cho người có đủ sức khỏe từ 21 tuổi trở lên.</p>
                                            <p>- Có thời hạn 5 năm, kể từ ngày cấp.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='intro col-lg-6 col-md-12 advisory'>
                            <div className='intro_col'>
                                <div className='intro_form_container' style={{ boxShadow: 'rgb(0 0 0 / 20%) 0px 25px 38px' }}>
                                    <div className='intro_form_title'>Đăng ký tư vấn</div>
                                    <form action='#' className='intro_form' id='intro_form' onSubmit={this.onSubmit}>
                                        <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                            {readOnly ?
                                                <div className='w-100'>
                                                    <p style={{ width: '100%', padding: '0 8px', color: 'white' }}>Họ và Tên: <b>{lastname} {firstname}</b></p>
                                                    <p style={{ width: '100%', padding: '0 8px', color: 'white', marginBottom: 16 }}>Email: <b>{email}</b></p>
                                                </div> :
                                                <>
                                                    <p style={{ width: '50%', padding: '0 8px', margin: 0, color: 'white' }}>Họ<br />
                                                        <input type='text' className='intro_input w-100' placeholder='Họ' ref={e => this.lastname = e} />
                                                    </p>
                                                    <p style={{ width: '50%', padding: '0 8px', margin: 0, color: 'white' }}>Tên<br />
                                                        <input type='text' className='intro_input w-100' placeholder='Tên' ref={e => this.firstname = e} />
                                                    </p>
                                                    <p style={{ width: '50%', padding: '0 8px', margin: 0, color: 'white' }}>Email<br />
                                                        <input type='text' className='intro_input w-100' placeholder='Email' ref={e => this.email = e} />
                                                    </p>
                                                </>}

                                            <p style={{ width: readOnly ? '100%' : '50%', padding: '0 8px', margin: 0, color: 'white' }}>Số điện thoại:
                                                <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                                    type='tel' className='intro_input w-100' placeholder='Số điện thoại' ref={e => this.phoneNumber = e} />
                                            </p>
                                            <div className='mb-5' style={{ width: '100%', padding: '0 8px', margin: 0, color: 'white' }}>
                                                <FormSelect ref={e => this.courseType = e} label='Loại khóa học:' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} labelStyle={{ color: 'white' }} />
                                            </div>
                                        </div>
                                        <button className='button button_1 intro_button trans_200 advisory_btn'>Đăng ký</button>
                                    </form>
                                </div>
                            </div>
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
