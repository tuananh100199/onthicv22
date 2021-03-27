import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { createCandidate } from './redux';

class SectionAdvisoryForm extends React.Component {
    state = {};
    componentDidMount() {
        $(document).ready(() => {
            this.props.viewId && ajaxGetCourseType(this.props.viewId, data =>
                this.courseType.value(data && data.item ? { id: data.item._id, text: data.item.title } : null));

            const { lastname, firstname, email, phoneNumber } = this.props.system && this.props.system.user ?
                this.props.system.user : { lastname: '', firstname: '', email: '', phoneNumber: '' };
            if (this.props.system && this.props.system.user) {
                this.phoneNumber.value = phoneNumber;
            } else {
                this.lastname.value = lastname;
                this.firstname.value = firstname;
                this.email.value = email;
            }

            this.setState({ lastname, firstname, email, phoneNumber });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        const user = this.props.system.user;
        if (!user){
            if (this.lastname.value == '') {
                T.notify('Họ bị trống!', 'danger');
                this.lastname.focus();
                return;
            }
            if (this.firstname.value == '') {
                T.notify('Tên bị trống!', 'danger');
                this.firstname.focus();
                return;
            }
            if (this.email.value == '' || !T.validateEmail(this.email.value)) {
                T.notify('Email không hợp lệ!', 'danger');
                (this.email).focus();
                return;
            }
            if (this.phoneNumber.value == '') {
                T.notify('Số điện thoại bị trống!', 'danger');
                this.phoneNumber.focus();
                return;
            }
         }
         else{
            if (this.phoneNumber.value == '') {
                T.notify('Số điện thoại bị trống!', 'danger');
                this.phoneNumber.focus();
                return;
            }
         }
         const data = {
            courseType: this.courseType.value(),
            firstname: user ? user.firstname : this.firstname.value,
            lastname: user ? user.lastname : this.lastname.value,
            email: user ? user.email : this.email.value,
            phone: this.phoneNumber.value
        };
        this.props.createCandidate(data, () => {
            !user ? this.firstname.value = this.lastname.value = this.email.value = this.phoneNumber.value = '' : null;
            T.notify('Đăng ký tư vấn của bạn đã được gửi!', 'success', true, 3000);
        });
    }

    render() {
        const readOnly = this.props.system && this.props.system.user ? true : false;
        const { lastname, firstname, email } = this.state;
        return (
            <div className='intro'>
                <div className='intro_col'>
                    <div className='intro_form_container'>
                        <div className='intro_form_title' id='formTitle'>Đăng ký tư vấn</div>
                        <form action='#' className='intro_form' id='intro_form' onSubmit={this.onSubmit}>
                            <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                {readOnly ?
                                    <div className='w-100'>
                                        <p style={{ width: '100%' }}>Họ và Tên: <b>{lastname} {firstname}</b></p>
                                        <p style={{ width: '100%' }}>Email: <b>{email}</b></p>
                                        <p style={{ width: '100%' }}>Số điện thoại:</p>
                                        <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                            type='tel' className='intro_input w-100' placeholder='Số điện thoại' ref={e => this.phoneNumber = e} />
                                        <div className='intro_input w-100 mb-5' style={{ padding: 0, border: 'none' }} >
                                            <p style={{ width: '100%' }}>Loại khóa học:</p>
                                            <FormSelect ref={e => this.courseType = e} label='' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} />
                                        </div>
                                    </div> :
                                    <>
                                        <input type='text' className='intro_input' placeholder='Họ' ref={e => this.lastname = e}/>
                                        <input type='text' className='intro_input' placeholder='Tên' ref={e => this.firstname = e} readOnly={readOnly} />
                                        <input type='text' className='intro_input' ref={e => this.email = e} placeholder='Email' readOnly={readOnly} />
                                        <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                            type='tel' className='intro_input' placeholder='Số điện thoại' ref={e => this.phoneNumber = e} readOnly={readOnly} />
                                        <div className='intro_input w-100 mb-5' style={{ padding: 0, border: 'none' }} >
                                            <FormSelect ref={e => this.courseType = e} label='' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} />
                                        </div>
                                    </>}
                            </div>
                            <button className='button button_1 intro_button trans_200'>Đăng ký</button>
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
