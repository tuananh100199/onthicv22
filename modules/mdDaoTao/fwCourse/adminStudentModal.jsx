import React from 'react';
import {AdminModal, FormDatePicker, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
export default class AdminStudentModal extends AdminModal {
    state = {};
    onShow = (item) => {
        let { _id,
            firstname,
            lastname,
            user,
            sex,
            birthday,
            nationality,
            residence,
            regularResidence,
            identityCard,
            identityIssuedBy,
            identityDate,
            giayPhepLaiXe2BanhSo,
            giayPhepLaiXe2BanhNgay,
            giayPhepLaiXe2BanhNoiCap,
            division,
            giayKhamSucKhoe,
            giayKhamSucKhoeNgayKham,
            hinhThe3x4,
            hinhChupTrucTiep } = item ||
            {
                firstname: '',
                lastname: '',
                user: {
                    email: '',
                    phoneNumber: ''
                },
                sex: '',
                birthday: '',
                nationality: '',
                residence: '',
                regularResidence: '',
                identityCard: '',
                identityIssuedBy: '',
                identityDate: '',
                giayPhepLaiXe2BanhSo: '',
                giayPhepLaiXe2BanhNgay: '',
                giayPhepLaiXe2BanhNoiCap: '',
                division: '',
                giayKhamSucKhoe: '',
                giayKhamSucKhoeNgayKham: '',
                hinhThe3x4: '',
                hinhChupTrucTiep: ''
            };
        this.setState({ _id, className: giayKhamSucKhoe ? 'col-md-6' : 'invisible' });
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemEmail.value(user && user.email || '');
        this.itemPhoneNumber.value(user && user.phoneNumber || '');
        this.itemSex.value(sex || 'male');
        this.itemBirthday.value(birthday || '');
        this.itemNationality.value(nationality || '');
        this.itemResidence.value(residence || '');
        this.itemRegularResidence.value(regularResidence || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemIdentityIssuedBy.value(identityIssuedBy || '');
        this.itemIdentityDate.value(identityDate || '');
        this.itemLincenseNumber.value(giayPhepLaiXe2BanhSo || '');
        this.itemLincenseDate.value(giayPhepLaiXe2BanhNgay || '');
        this.itemLincenseIssuedBy.value(giayPhepLaiXe2BanhNoiCap || '');
        this.itemDivision.value(division ? { id: division._id, text: division.title + (division.isOutside ? ' (cơ sở ngoài)' : '') } : null);
        this.itemGiayKhamSucKhoe.value(giayKhamSucKhoe || false);
        this.itemGiayKhamSucKhoeNgayKham.value(giayKhamSucKhoeNgayKham || '');
        this.itemHinhThe3x4.value(hinhThe3x4 || false);
        this.itemHinhChupTrucTiep.value(hinhChupTrucTiep || false);
    }

    isChecked = (checked) => {
        this.setState({ className: checked ? 'col-md-6' : 'invisible' });
    }

    onSubmit = () => {
        const data = {
            _id: this.state._id,
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            sex: this.itemSex.value(),
            birthday: this.itemBirthday.value(),
            nationality: this.itemNationality.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            identityCard: this.itemIdentityCard.value(),
            identityIssuedBy: this.itemIdentityIssuedBy.value(),
            identityDate: this.itemIdentityDate.value(),
            giayPhepLaiXe2BanhSo: this.itemLincenseNumber.value(),
            giayPhepLaiXe2BanhNgay: this.itemLincenseDate.value(),
            giayPhepLaiXe2BanhNoiCap: this.itemLincenseIssuedBy.value(),
            division: this.itemDivision.value(),
            giayKhamSucKhoe: this.itemGiayKhamSucKhoe.value(),
            giayKhamSucKhoeNgayKham: this.itemGiayKhamSucKhoe.value() ? this.itemGiayKhamSucKhoeNgayKham.value() : null,
            hinhThe3x4: this.itemHinhThe3x4.value(),
            hinhChupTrucTiep: this.itemHinhChupTrucTiep.value(),
        };
        if (data.lastname == '') {
            T.notify('Họ không được trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.firstname == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.email == '') {
            T.notify('Địa chỉ email không được trống!', 'danger');
            this.itemEmail.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại không được trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (data.sex == '') {
            T.notify('Giới tính không được trống!', 'danger');
            this.itemSex.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh không được trống!', 'danger');
            this.itemBirthday.focus();
        } else if (data.nationality == '') {
            T.notify('Quốc tịch không được trống!', 'danger');
            this.itemNationality.focus();
        } else if (data.residence == '') {
            T.notify('Nơi cư trú không được trống!', 'danger');
            this.itemResidence.focus();
        } else if (data.regularResidence == '') {
            T.notify('Nơi đăng ký hộ khẩu thường trú không được trống!', 'danger');
            this.itemRegularResidence.focus();
        } else if (data.identityCard == '') {
            T.notify('CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.identityDate == '') {
            T.notify('Ngày cấp CMND/CCCD không được trống!', 'danger');
            this.itemIdentityDate.focus();
        } else if (data.identityIssuedBy == '') {
            T.notify('Nơi cấp CMND/CCCD không được trống!', 'danger');
            this.itemIdentityIssuedBy.focus();
        } else if (data.division == null) {
            T.notify('Cơ sở đào tạo không được trống', 'danger');
            this.itemDivision.focus();
        } else if (data.giayKhamSucKhoe && data.giayKhamSucKhoeNgayKham == '') {
            T.notify('Ngày khám sức khỏe không được trống!', 'danger');
            this.itemGiayKhamSucKhoeNgayKham.focus();
        } else {
            this.props.updateStudent(this.state._id, data);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Chỉnh sửa học viên',
        size: 'large',
        body: (
            <div className='row'>
                <FormTextBox ref={e => this.itemLastname = e} label='Họ ứng viên' className='col-md-8' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemFirstname = e} label='Tên ứng viên' className='col-md-4' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemEmail = e} label='Email' className='col-md-6'  readOnly={this.state._id ? true : this.props.readOnly} />
                <FormTextBox ref={e => this.itemPhoneNumber = e} label='Số điện thoại' className='col-md-6'  readOnly={this.state._id ? true : this.props.readOnly} />
                <FormSelect ref={e => this.itemSex = e} className='col-md-3' label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemBirthday = e} className='col-md-3' label='Ngày sinh' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemNationality = e} label='Quốc tịch' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemResidence = e} label='Nơi cư trú' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemRegularResidence = e} label='Nơi đăng ký hộ khẩu thường trú' className='col-md-6' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemIdentityCard = e} label='Số CMND,CCCD' className='col-md-4' readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemIdentityDate = e} className='col-md-4' label='Ngày cấp' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp' className='col-md-4' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLincenseNumber = e} label='Số giấy phép lái xe 2 bánh' className='col-md-4' readOnly={this.props.readOnly} />
                <FormDatePicker ref={e => this.itemLincenseDate = e} className='col-md-4' label='Ngày trúng tuyển' readOnly={this.props.readOnly} />
                <FormTextBox ref={e => this.itemLincenseIssuedBy = e} label='Nơi cấp' className='col-md-4' readOnly={this.props.readOnly} />
                <FormSelect ref={e => this.itemDivision = e} className='col-md-8' label='Thuộc cơ sở đào tạo' data={ajaxSelectDivision} readOnly={this.props.readOnly} required />
                <FormCheckbox ref={e => this.itemGiayKhamSucKhoe = e} className='col-md-6' label='Đã có giấy khám sức khỏe' readOnly={this.props.readOnly} onChange={this.isChecked} />
                <FormDatePicker ref={e => this.itemGiayKhamSucKhoeNgayKham = e} className={this.state.className} label='Ngày khám sức khỏe' readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemHinhThe3x4 = e} className='col-md-6' label='Hình thẻ 3x4' readOnly={this.props.readOnly} />
                <FormCheckbox ref={e => this.itemHinhChupTrucTiep = e} className='col-md-6' label='Hình chụp trực tiếp' readOnly={this.props.readOnly} />
            </div>
        ),
    });
}
   