import React from 'react';
import { connect } from 'react-redux';
import { ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormSelect } from 'view/component/AdminPage';

class SectionAdvisoryForm extends React.Component {
    componentDidMount() {
        $(document).ready(() => this.props.viewId && ajaxGetCourseType(this.props.viewId, data =>
            this.courseType.value(data && data.item ? { id: data.item._id, text: data.item.title } : null)));
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
                courseType: this.courseType.value,
                firstname: this.firstname.value,
                lastname: this.lastname.value,
                email: this.email.value,
                phone: this.phone.value
            };
            //TODO
            // this.props.createDKTVListItem(data, () => {
            //     this.firstname.value = this.lastname.value = this.email.value = this.phone.value = '';
            //     T.notify('Bạn đã đăng ký thành công!', 'success', true, 3000);
            //     this.props.getAllCourseType(datacType => {
            //         if (datacType) {
            //             let courseType = datacType ? datacType.map(item => ({ id: item._id, text: item.title })) : null;
            //             $('#courseType').select2({ placeholder: 'Loại khóa học', data: courseType }).val(courseType.title).trigger('change');
            //         }
            //     });
            // });
        }
    }

    render() {
        return (
            <div className='intro'>
                <div className='intro_col'>
                    <div className='intro_form_container'>
                        <div className='intro_form_title' id='formTitle'>Đăng ký tư vấn</div>
                        <form action='#' className='intro_form' id='intro_form' onSubmit={this.onSubmit}>
                            <div className='d-flex flex-row align-items-start justify-content-between flex-wrap'>
                                <input type='text' className='intro_input' placeholder='Họ' ref={e => this.lastname = e} required='required' />
                                <input type='text' className='intro_input' placeholder='Tên' ref={e => this.firstname = e} required='required' />

                                <input type='text' className='intro_input' ref={e => this.email = e} placeholder='Email' />
                                <input onKeyPress={e => (!/[0-9]/.test(e.key)) && e.preventDefault()}
                                    type='tel' className='intro_input' placeholder='Số điện thoại' ref={e => this.phone = e} required='required' />

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
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(SectionAdvisoryForm);
