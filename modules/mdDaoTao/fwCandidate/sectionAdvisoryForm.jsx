import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';
import { createCandidate } from './redux';
import T from 'view/js/common';

class SectionAdvisoryForm extends React.Component {
    state = {};
    componentDidMount() {
        $(document).ready(() => {
            this.props.viewId && ajaxGetCourseType(this.props.viewId, data =>
                this.courseType.value(data && data.item ? { id: data.item._id, text: data.item.title } : null));

            const { firstname, lastname, email, phoneNumber } = this.props.system && this.props.system.user ?
                this.props.system.user : { firstname: '', lastname: '', email: '', phoneNumber: '' };
            if (this.firstname) this.firstname.value = lastname;
            if (this.lastname) this.lastname.value = lastname;
            if (this.email) this.email.value = lastname;
            this.phoneNumber.value = phoneNumber || '';

            this.setState({ lastname, firstname, email });
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
            this.firstname.focus();
        } else if (data.firstname == '' && this.firstname) {
            T.notify('Tên bị trống!', 'danger');
            this.lastname.focus();
        } else if (this.email && data.email != '' && !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.email.focus();
        } else if (data.phoneNumber == '' && this.phoneNumber) {
            T.notify('Số điện thoại bị trống!', 'danger');
            this.phoneNumber.focus();
        } else {
            this.props.createCandidate(data, () => {
                !user ? this.firstname.value = this.lastname.value = this.email.value = this.phoneNumber.value = '' : null;
                T.notify('Đăng ký tư vấn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        const readOnly = this.props.system && this.props.system.user != null;
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
                                <p className='mb-5' style={{ width: '100%', padding: '0 8px', margin: 0 }}>Loại khóa học:
                                    <FormSelect ref={e => this.courseType = e} label='' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} />
                                </p>
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
