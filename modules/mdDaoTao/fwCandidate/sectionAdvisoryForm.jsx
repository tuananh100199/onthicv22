import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { createCandidate } from './redux';
import './style.css';

class SectionAdvisoryForm extends React.Component {
    componentDidMount() {
        $(document).ready(() => {
            function advisory() {
                let advisory = document.querySelectorAll('.advisory');
                console.log('advisory', advisory);
              
                for (let i = 0; i < advisory.length; i++) {
                  let windowHeight = window.innerHeight;
                  let elementTop = advisory[i].getBoundingClientRect().top;
                  let elementVisible = 150;
              
                  if (elementTop < windowHeight - elementVisible) {
                    advisory[i].classList.add('active');
                  } else {
                    advisory[i].classList.remove('active');
                  }
                }
            }
              
            window.addEventListener('scroll', advisory);
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
            <div className='advisory'>
                <div className='intro_col'>
                    <div className='advisory_form_container' style={{ boxShadow: 'rgb(0 0 0 / 20%) 0px 25px 38px', backgroundColor: 'white' }}>
                        <div className='intro_form_title'>Đăng ký tư vấn</div>
                        <form action='#' className='intro_form' id='intro_form' onSubmit={this.onSubmit}>
                            <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                {readOnly ?
                                    <div className='w-100'>
                                        <p style={{ width: '100%', padding: '0 8px', color: '#199d76' }}>Họ và Tên: <b>{lastname} {firstname}</b></p>
                                        <p style={{ width: '100%', padding: '0 8px', color: '#199d76', marginBottom: 16 }}>Email: <b>{email}</b></p>
                                    </div> :
                                    <>
                                        <p style={{ width: '50%', padding: '0 8px', margin: 0, color: '#199d76' }}>Họ<br />
                                            <input type='text' className='intro_input w-100' placeholder='Họ' ref={e => this.lastname = e} />
                                        </p>
                                        <p style={{ width: '50%', padding: '0 8px', margin: 0, color: '#199d76' }}>Tên<br />
                                            <input type='text' className='intro_input w-100' placeholder='Tên' ref={e => this.firstname = e} />
                                        </p>
                                        <p style={{ width: '50%', padding: '0 8px', margin: 0, color: '#199d76' }}>Email<br />
                                            <input type='text' className='intro_input w-100' placeholder='Email' ref={e => this.email = e} />
                                        </p>
                                    </>}

                                <p style={{ width: readOnly ? '100%' : '50%', padding: '0 8px', margin: 0, color: '#199d76' }}>Số điện thoại:
                                    <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                        type='tel' className='intro_input w-100' placeholder='Số điện thoại' ref={e => this.phoneNumber = e} />
                                </p>
                                <div className='mb-5' style={{ width: '100%', padding: '0 8px', margin: 0, color: '#199d76' }}>
                                    <FormSelect ref={e => this.courseType = e} label='Loại khóa học:' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} labelStyle={{ color: 'white' }} />
                                </div>
                            </div>
                            <button className='button button_1 intro_button trans_200 advisory_btn'>Đăng ký</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { createCandidate };
export default connect(mapStateToProps, mapActionsToProps)(SectionAdvisoryForm);
