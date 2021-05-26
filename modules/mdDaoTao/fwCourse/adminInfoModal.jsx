import React from 'react';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { FormImageBox, FormDatePicker, FormTextBox, FormRichTextBox, FormSelect } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';

export default class AdminInfoModal extends React.Component {
    state = {};
    modal = React.createRef();

    show = (item) => {
        const { _id, firstname, lastname, birthday, user, image, residence, regularResidence, courseType, sex, division, identityCard, planCourse } = item || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', identityCard: '', planCourse: '' };
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(user.email || '');
        this.itemPhoneNumber.value(user.phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemPlanCourse.value(planCourse || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemResidence.value(residence || '');
        this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`pre-student:${_id || 'new'}`);

        this.setState({ _id, image });
        $(this.modal.current).modal('show');
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            planCourse: this.itemPlanCourse.value(),
            sex: this.itemSex.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            image: this.state.image,
            courseType: this.itemCourseType.value(),
            division: this.itemDivision.value(),
        };
        if (data.lastname == '') {
            T.notify('Họ không được trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.firstname == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại không được trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (!data.courseType) {
            T.notify('Hạng đăng ký không được trống!', 'danger');
            this.itemCourseType.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
            // } else if (data.planCourse == '') {
            //     T.notify('Khóa dự kiến không được trống!', 'danger');
            //     this.itemPlanCourse.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Tạo ứng viên thành công!', 'success') && this.props.create(data, this.hide());
        }
    }
    render() {
        const readOnly = this.props.permissionCourse;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin chi tiết</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                        <div className='row'>
                            <div className='col-md-8'>
                                <div className='row'>
                                    <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} />
                                    <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} />
                                </div>
                                <FormTextBox ref={e => this.itemEmail = e} label='Email' readOnly={this.state._id ? true : readOnly} type='email' />
                            </div>
                            <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='PreStudentImage' image={this.state.image} readOnly={readOnly}
                                onSuccess={this.onUploadSuccess} />

                            <FormTextBox type='phone' ref={e => this.itemPhoneNumber = e} className='col-md-4' label='Số điện thoại' />
                            <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-4' label='Ngày sinh' readOnly={readOnly} />
                            <FormSelect ref={e => this.itemSex = e} className='col-md-4' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                            <FormSelect className='col-md-6' ref={e => this.itemCourseType = e} label='Hạng đăng ký' data={ajaxSelectCourseType} readOnly={readOnly} />
                            <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                            <FormTextBox className='col-md-6' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} />
                            <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} />
                            <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-12' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                            <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-12' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
                        </div >
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}