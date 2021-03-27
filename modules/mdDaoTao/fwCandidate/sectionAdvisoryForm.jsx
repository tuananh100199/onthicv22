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
            $('#userFirstname').val(firstname);
            if (this.props.system && this.props.system.user) {
                //TODO
            } else {
                this.lastname.value = lastname;
            }
            $('#userEmail').val(email);
            $('#userPhone').val(phoneNumber);

            this.setState({ lastname, firstname, email, phoneNumber });
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        if (this.firstname.value == '') {
            T.notify('Họ bị trống!', 'danger');
            this.firstname.focus();
        } else if (this.lastname.value == '') {
            T.notify('Tên bị trống!', 'danger');
            this.lastname.focus();
        } else if (this.phone.value == '') {
            T.notify('Số điện thoại bị trống!', 'danger');
            this.phone.focus();
        } else if (this.email.value == '' || !T.validateEmail(this.email.value)) {
            T.notify('Email không hợp lệ!', 'danger');
            (this.email).focus();
        } else {
            const data = {
                courseType: this.courseType.value(),
                firstname: this.firstname.value,
                lastname: this.lastname.value,
                email: this.email.value,
                phone: this.phone.value
            };
            this.props.createCandidate(data, () => {
                this.firstname.value = this.lastname.value = this.email.value = this.phone.value = '';
                T.notify('Đăng ký tư vấn của bạn đã được gửi!', 'success', true, 3000);
            });
        }
    }

    render() {
        const readOnly = this.props.system && this.props.system.user ? true : false;
        const { lastname, firstname, email, phoneNumber } = this.state;
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
                                            type='tel' className='intro_input w-100' placeholder='Số điện thoại' ref={e => this.phone = e} required='required' id='userPhone' readOnly={readOnly} />
                                    </div> :
                                    <>
                                        <input type='text' className='intro_input' placeholder='Họ' ref={e => this.lastname = e} required='required' />
                                        <input type='text' className='intro_input' placeholder='Tên' ref={e => this.firstname = e} required='required' id='userFirstname' readOnly={readOnly} />
                                        <input type='text' className='intro_input' ref={e => this.email = e} placeholder='Email' id='userEmail' readOnly={readOnly} />
                                        <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                            type='tel' className='intro_input' placeholder='Số điện thoại' ref={e => this.phone = e} required='required' id='userPhone' readOnly={readOnly} />
                                    </>}

                                <div className='intro_input w-100' style={{ padding: 0, border: 'none' }} >
                                    <FormSelect ref={e => this.courseType = e} label='' data={ajaxSelectCourseType} style={{ margin: 0, width: '100% !important' }} />
                                </div>
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
