import React from 'react';
import { connect } from 'react-redux';
import { getStaffInfo, updateStaffInfo } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormRichTextBox, FormSelect,FormDatePicker, FormImageBox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectDepartment } from 'modules/_default/fwDepartment/redux';

class StaffEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/staff-info', () => {
            const route = T.routeMatcher('/user/staff-info/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                this.props.getStaffInfo(params._id, data => {
                    if (data.item) {
                        this.setState({item:data.item});
                        const { _id,image, firstname, lastname, birthday,email,phoneNumber, sex, division, identityCard,identityDate,identityIssuedBy,department,
                            msnv,chucVu,ngayBatDauLam,trinhDoDaoTao,trinhDoVanHoa,chuyenNganh,truongDaoTao,bangCapKhac,residence,regularResidence } = data.item || 
                            {_id:null,image:'',firstname:'',lastname:'',birthday:'',email:'',phoneNumber:'',user:null,sex:null,division:null,identityCard:'',identityDate:'',identityIssuedBy:'',department:'',
                        msnv:'',chucVu:'',ngayBatDauLam:'',trinhDoDaoTao:'',trinhDoVanHoa:'',chuyenNganh:'',truongDaoTao:'',bangCapKhac:'',residence:'',regularResidence:''};
                            this.itemFirstname.value(firstname || '');
                            this.itemLastname.value(lastname || '');
                            this.itemBirthday.value(birthday);
                            this.itemEmail.value(email || '');
                            this.itemPhoneNumber.value(phoneNumber || '');
                            this.itemIdentityCard.value(identityCard || '');
                            this.itemIdentityDate.value(identityDate || '');
                            this.itemIdentityIssuedBy.value(identityIssuedBy || '');
                            this.itemSex.value(sex ? sex : 'male');
                            this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
                            this.itemDepartment.value(department?{id:department._id,text:department.title}:null);
                            this.itemMsnv.value(msnv||'');
                            this.itemChucVu.value(chucVu||'');
                            this.itemNgayBatDauLam.value(ngayBatDauLam||'');
                            this.itemTrinhDoDaoTao.value(trinhDoDaoTao||'');
                            this.itemTrinhDoVanHoa.value(trinhDoVanHoa||'');
                            this.itemChuyenNganh.value(chuyenNganh||'');
                            this.itemTruongDaoTao.value(truongDaoTao||'');
                            this.itemBangCapKhac.value(bangCapKhac||'');
                            this.itemResidence.value(residence||'');
                            this.itemRegularResidence.value(regularResidence||'');
                            this.imageBox.setData(`staffInfo:${_id || 'new'}`);
                            this.setState({ _id,image });
                        this.itemFirstname.focus();
                    } else {
                        this.props.history.push('/user/staff-info');
                    }
                });
            }else{
                this.props.history.push('/user/staff-info');   
            }
        });
    }

    onUploadSuccess = ({ error, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
        }
    }

    save = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            identityDate:this.itemIdentityDate.value(),
            identityIssuedBy:this.itemIdentityIssuedBy.value(),
            sex: this.itemSex.value(),
            division: this.itemDivision.value(),
            department: this.itemDepartment.value(),
            msnv: this.itemMsnv.value().toUpperCase(),
            chucVu:this.itemChucVu.value(),
            ngayBatDauLam:this.itemNgayBatDauLam.value(),
            trinhDoDaoTao:this.itemTrinhDoDaoTao.value(),
            trinhDoVanHoa:this.itemTrinhDoVanHoa.value(),
            chuyenNganh:this.itemChuyenNganh.value(),
            truongDaoTao:this.itemTruongDaoTao.value(),
            bangCapKhac:this.itemBangCapKhac.value(),
            residence:this.itemResidence.value(),
            regularResidence:this.itemResidence.value(),
            image:this.state.image
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
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else if (!data.department) {
            T.notify('Phòng ban không được trống!', 'danger');
            this.itemDepartment.focus();
        }else {
            this.props.updateStaffInfo(this.state._id, data);
        }
    }

    render() {
        const permission = this.getUserPermission('staff-info');
        const readOnly = !permission.write;
        const item = this.state.item ? this.state.item:null;
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Thông tin nhân viên: ' + (item ? `${item.lastname} ${item.firstname}`:''),
            breadcrumb: [<Link key={0} to='/user/staff-info'>Thông tin nhân viên</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                <div className='row'>
                    <div className='col-md-9'>
                        <div className='row'>
                            <FormTextBox className='col-md-4' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} required />
                            <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} required />
                            <FormSelect className='col-md-4' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                            <FormDatePicker className='col-md-4' ref={e => this.itemBirthday = e} label='Ngày sinh' readOnly={readOnly} type='date-mask' required />
                            <FormTextBox className='col-md-4' ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                            <FormTextBox className='col-md-4' type='phone' ref={e => this.itemPhoneNumber = e} readOnly={readOnly} label='Số điện thoại' required />
                        </div>
                    </div>
                    <FormImageBox ref={e => this.imageBox = e} className='col-md-3' label='Hình đại diện' uploadType='StaffInfoImage' image={this.state.image} readOnly={readOnly}
                            onSuccess={this.onUploadSuccess} />
                        <FormTextBox className='col-md-3' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} required />
                        <FormDatePicker className='col-md-3' ref={e => this.itemIdentityDate = e} label='Ngày cấp CMND/CCCD' type='date-mask' readOnly={readOnly} />
                        <FormTextBox className='col-md-6' ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp CMND/CCCD' readOnly={readOnly} />
                        <FormSelect className='col-md-3' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} required />
                        <FormSelect className='col-md-3' ref={e => this.itemDepartment = e} label='Phòng ban' data={ajaxSelectDepartment} readOnly={readOnly} required />
                        <FormTextBox className='col-md-3' ref={e => this.itemChucVu = e} label='Chức vụ' readOnly={readOnly}/>
                        <FormTextBox className='col-md-3' ref={e => this.itemMsnv = e} label='Mã số nhân viên' readOnly={readOnly}/>
                        <FormDatePicker className='col-md-3' ref={e => this.itemNgayBatDauLam = e} label='Ngày bắt đầu làm'readOnly={readOnly} type='date-mask'/>
                        <FormTextBox className='col-md-3' ref={e => this.itemTrinhDoVanHoa = e} label='Trình độ văn hóa'readOnly={readOnly}/>
                        <FormTextBox className='col-md-3' ref={e => this.itemTrinhDoDaoTao = e} label='Trình độ đào tạo'readOnly={readOnly}/>
                        <FormTextBox className='col-md-3' ref={e => this.itemChuyenNganh = e} label='Chuyên ngành'readOnly={readOnly}/>
                        <FormTextBox className='col-md-6' ref={e => this.itemTruongDaoTao = e} label='Trường đào tạo'readOnly={readOnly}/>
                        <FormTextBox className='col-md-6' ref={e => this.itemBangCapKhac = e} label='Bằng cấp khác' readOnly={readOnly}/>
                        <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                        <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
                    </div >
                </div>
            </>,
            backRoute: '/user/staff-info',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, staffInfo: state.framework.staffInfo });
const mapActionsToProps = { updateStaffInfo, getStaffInfo };
export default connect(mapStateToProps, mapActionsToProps)(StaffEditPage);