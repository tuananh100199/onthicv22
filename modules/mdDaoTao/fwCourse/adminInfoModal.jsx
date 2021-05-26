import React from 'react';
import { FormImageBox, FormDatePicker, FormTextBox, FormRichTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';

export default class AdminInfoModal extends React.Component {
    state = {hinh3x4: false};
    modal = React.createRef();
    show = (item) => {
        //identityCardImage1, identityCardImage2
        const { _id, firstname, lastname, birthday, image, residence, regularResidence, nationality, identityIssuedBy, 
                identityDate, giayPhepLaiXe2BanhSo, giayPhepLaiXe2BanhNgay, giayPhepLaiXe2BanhNoiCap, 
                giayKhamSucKhoe, giayKhamSucKhoeNgayKham,  hinhThe3x4, hinhChupTrucTiep, sex, division, identityCard } = item || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', identityCard: '' };
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        // this.itemEmail.value(user.email || '');
        // this.itemPhoneNumber.value(user.phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemIdentityIssuedBy.value(identityIssuedBy || '');
        this.itemIdentityDate.value(identityDate);
        this.itemGiayPhepLaiXe2BanhSo.value(giayPhepLaiXe2BanhSo || '');
        this.itemGiayPhepLaiXe2BanhNgay.value(giayPhepLaiXe2BanhNgay);
        this.itemGiayPhepLaiXe2BanhNoiCap.value(giayPhepLaiXe2BanhNoiCap || '');
        this.itemGiayKhamSucKhoe.value(giayKhamSucKhoe ? giayKhamSucKhoe : false);
        this.itemGiayKhamSucKhoeNgayKham.value(giayKhamSucKhoeNgayKham || null);
        this.itemHinhThe3x4.value(hinhThe3x4 ? hinhThe3x4 : false);
        this.itemHinhChupTrucTiep.value(hinhChupTrucTiep ? hinhChupTrucTiep : false);
        this.itemSex.value(sex ? sex : 'male');
        this.itemResidence.value(residence || '');
        this.itemNationality.value( nationality || '');
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`student:${_id || 'new'}`);
        // this.imageBox.setData(`identityCardImage1:${_id || 'new'}`);
        this.setState({ _id, image, giayKhamSucKhoeNgayKham });
        $(this.modal.current).modal('show');
    }

    hide = () => $(this.modal).modal('hide');
  
    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            // email: this.itemEmail.value(),
            // phoneNumber: this.itemPhoneNumber.value(),
            nationality: this.itemNationality.value(),
            identityCard: this.itemIdentityCard.value(),
            identityIssuedBy: this.itemIdentityIssuedBy.value(),
            identityDate: this.itemIdentityDate.value(),
            giayPhepLaiXe2BanhSo: this.itemGiayPhepLaiXe2BanhSo.value(),
            giayPhepLaiXe2BanhNgay: this.itemGiayPhepLaiXe2BanhNgay.value(),
            giayPhepLaiXe2BanhNoiCap: this.itemGiayPhepLaiXe2BanhNoiCap.value(),
            giayKhamSucKhoe: this.itemGiayKhamSucKhoe.value(),
            giayKhamSucKhoeNgayKham: this.itemGiayKhamSucKhoeNgayKham.value(),
            hinhThe3x4: this.itemHinhThe3x4.value(),
            hinhChupTrucTiep: this.itemHinhChupTrucTiep.value(),
            sex: this.itemSex.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            image: this.state.image,
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
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
        } else {
            this.props.updateStudent(this.state._id, data, this.hide);
        }
    }
    render() {
        const readOnly = this.props.permissionCourse,  isLoading = false;
        // { giayKhamSucKhoeNgayKham } = this.state;


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
                                    <FormTextBox className='col-md-12' ref={e => this.itemEmail = e} label='Email' readOnly={this.state._id ? true : readOnly} type='email' />
                                    <FormTextBox className='col-md-12' type='phone' ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={this.state._id ? true : readOnly}/>

                                </div>
                            </div>
                            <FormImageBox className='col-md-4' ref={e => this.imageBox = e} label='Hình đại diện' uploadType='PreStudentImage' image={this.state.image} readOnly={readOnly}
                                onSuccess={this.onUploadSuccess} />

                            <FormDatePicker className='col-md-4'  ref={e => this.itemBirthday = e}label='Ngày sinh' readOnly={readOnly} />
                            <FormSelect className='col-md-4' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                            <FormTextBox className='col-md-6' ref={e => this.itemNationality = e} label='Quốc tịch' readOnly={readOnly} />
                            <FormSelect className='col-md-6' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} />
                            <FormTextBox className='col-md-6' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} />
                            <FormDatePicker className='col-md-6' ref={e => this.itemIdentityDate = e} label='Ngày cấp CMND/CCCD' readOnly={readOnly} />
                            <FormRichTextBox className='col-md-12' ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp CMND/CCCD' readOnly={readOnly} rows='2'/>
                            <FormTextBox className='col-md-6' ref={e => this.itemGiayPhepLaiXe2BanhSo = e} label='Giấy phép lái xe 2 bánh' readOnly={readOnly} />
                            <FormDatePicker className='col-md-6' ref={e => this.itemGiayPhepLaiXe2BanhNgay = e} label='Ngày cấp giấy phép lái xe 2 bánh' readOnly={readOnly} />
                            <FormRichTextBox className='col-md-12' ref={e => this.itemGiayPhepLaiXe2BanhNoiCap = e} label='Nơi cấp giấy phép lái xe 2 bánh' readOnly={readOnly} rows='2' />
                            <FormCheckbox  className='col-md-12' ref={e => this.itemGiayKhamSucKhoe = e} label='Đã có giấy khám sức khỏe' onChange={active => this.setState({hinh3x4: active})} readOnly={readOnly} />
                            {/* { this.state.hinh3x4 && giayKhamSucKhoeNgayKham ?  */}
                            <FormDatePicker className='col-md-12' ref={e => this.itemGiayKhamSucKhoeNgayKham = e} label='Ngày khám sức khỏe' readOnly={readOnly} /> 
                            {/* : null } */}
                            <FormCheckbox className='col-md-6' ref={e => this.itemHinhThe3x4 = e} label='Đã có hình thẻ 3x4' readOnly={readOnly} />
                            <FormCheckbox className='col-md-6' ref={e => this.itemHinhChupTrucTiep = e} label='Đã có hình chụp trực tiếp' readOnly={readOnly} />
                            <FormRichTextBox className='col-md-12' ref={e => this.itemResidence = e} label='Nơi cư trú' readOnly={readOnly} rows='2' />
                            <FormRichTextBox className='col-md-12' ref={e => this.itemRegularResidence = e} label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
                        </div >
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            {!readOnly ?
                                <button type='submit' className='btn btn-primary' disabled={isLoading} onClick={this.onSubmit}>
                                    {isLoading ? <i className='fa fa-spin fa-lg fa-spinner' /> : <i className='fa fa-fw fa-lg fa-save' />} Lưu
                                </button> : null}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}