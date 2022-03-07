import React from 'react';
import { connect } from 'react-redux';
import { getTeacher, updateTeacher } from '../redux';
import { AdminPage, FormTextBox, FormRichTextBox, FormSelect,FormDatePicker, FormImageBox, CirclePageButton,FormCheckbox } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';

class TeacherInfoPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/teacher', () => {
            const route = T.routeMatcher('/user/teacher/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                // danh mục hợp đồng
                this.props.getCategoryAll('contract', null, (items) =>{
                    this.setState({ contracts: (items || []).map(item => ({ id: item._id, text: item.title })) },()=>{
                        if (this.props.teacherData) {
                            const { _id,image, firstname, lastname, birthday,email,phoneNumber, sex, division, identityCard,identityDate,identityIssuedBy,maGiaoVien,residence,regularResidence,contract,maSoThue,baoHiemXaHoi,thoiGianLamViec } = this.props.teacherData || 
                                {_id:null,image:'',firstname:'',lastname:'',birthday:'',email:'',phoneNumber:'',user:null,sex:null,division:null,identityCard:'',identityDate:'',identityIssuedBy:'',maGiaoVien:'',maSoThue:''};
                                this.itemFirstname.value(firstname || '');
                                this.itemLastname.value(lastname || '');
                                this.itemBirthday.value(birthday);
                                this.itemEmail.value(email || '');
                                this.itemPhoneNumber.value(phoneNumber || '');
                                this.itemSex.value(sex ? sex : 'male');
                                this.itemMaGiaoVien.value(maGiaoVien||'');
                                this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        
                                this.itemIdentityCard.value(identityCard || '');
                                this.itemIdentityDate.value(identityDate||'');
                                this.itemIdentityIssuedBy.value(identityIssuedBy||'');
                                this.itemContract.value(contract && contract.category ? contract.category:null);
                                this.itemContractStartDate.value(contract && contract.startDate?contract.startDate:'');
                                this.itemContractExpireDate.value(contract && contract.expireDate?contract.expireDate:'');
                                
                                this.itemMaSoThue.value(maSoThue);
                                this.itemSoBhxh.value(baoHiemXaHoi?baoHiemXaHoi.number:'');
                                this.itemNoiDongBhxh.value(baoHiemXaHoi?baoHiemXaHoi.noiDong:'');
                                // thời gian làm việc
                                this.itemStartDate.value(thoiGianLamViec?thoiGianLamViec.startDate:'');
                                this.itemNghiViec.value(thoiGianLamViec?thoiGianLamViec.nghiViec:false);
                                this.itemEndDate.value(thoiGianLamViec?thoiGianLamViec.endDate:'');
                                //địa chỉ
                                this.itemResidence.value(residence);
                                this.itemRegularResidence.value(regularResidence);
                                this.imageBox.setData(`teacher:${_id || 'new'}`);
                                this.setState({ _id,image,nghiViec:thoiGianLamViec?thoiGianLamViec.nghiViec:false });
                                
                            this.itemLastname.focus();
                        } else {
                            this.props.history.push('/user/teacher');
                        }
                    });
                });
                
            }else{
                this.props.history.push('/user/teacher');   
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
            sex: this.itemSex.value(),
            division: this.itemDivision.value(),
            maGiaoVien: this.itemMaGiaoVien.value().toUpperCase(),
            identityCard: this.itemIdentityCard.value(),
            identityCardDate:this.itemIdentityDate.value(),
            identityIssuedBy:this.itemIdentityIssuedBy.value(),
            contract:{
                startDate:this.itemContractStartDate.value(),
                contractExpireDate:this.itemContractExpireDate.value(),
            },
            maSoThue:this.itemMaSoThue.value(),
            baoHiemXaHoi:{
                number:this.itemSoBhxh.value(),
                noiDong:this.itemNoiDongBhxh.value(),
            },
            thoiGianLamViec:{
                startDate:this.itemStartDate.value(),
                nghiViec:this.itemNghiViec.value(),
                endDate:this.itemEndDate.value(),
            }
            // image:this.state.image
        };

        if(this.itemContract.value()){
            data.contract.category=this.itemContract.value();
        }

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
        }else {
            this.props.updateTeacher(this.state._id, data);
        }
    }

    render() {
        const permission = this.getUserPermission('teacher');
        const readOnly = !permission.write;
        return<>
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
                        <FormImageBox ref={e => this.imageBox = e} className='col-md-3' label='Hình đại diện' uploadType='teacherImage' image={this.state.image} readOnly={readOnly}
                                onSuccess={this.onUploadSuccess} />
                        <FormTextBox className='col-md-3' ref={e => this.itemMaGiaoVien = e} label='Mã giáo viên'readOnly={readOnly} required/>
                        <FormTextBox className='col-md-3' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} required />
                        <FormDatePicker className='col-md-3' ref={e => this.itemIdentityDate = e} type='date-mask' label='Ngày cấp CMND/CCCD' readOnly={readOnly} />
                        <FormTextBox className='col-md-3' ref={e => this.itemIdentityIssuedBy = e} label='Nơi cấp CMND/CCCD'readOnly={readOnly}/>
                        <FormSelect className='col-md-3' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} required />
                        <FormSelect className='col-md-3' ref={e => this.itemContract = e} label='Loại hợp đồng' readOnly={readOnly} data = {this.state.contracts}/>
                        <FormDatePicker className='col-md-3' ref={e => this.itemContractStartDate = e} label='Ngày bắt đầu hợp đồng'readOnly={readOnly} type='date-mask'/>
                        <FormDatePicker className='col-md-3' ref={e => this.itemContractExpireDate = e} label='Ngày kết thúc hợp đồng'readOnly={readOnly} type='date-mask'/>
                        <FormTextBox className='col-md-3' ref={e => this.itemMaSoThue = e} label='Mã số thuế'readOnly={readOnly}/>
                        <FormTextBox className='col-md-3' ref={e => this.itemSoBhxh = e} label='Số BHXH'readOnly={readOnly}/>
                        <FormTextBox className='col-md-6' ref={e => this.itemNoiDongBhxh = e} label='Nơi đóng BHXH'readOnly={readOnly}/>
                        <FormDatePicker className='col-md-5' ref={e => this.itemStartDate = e} label='Ngày bắt đầu làm'readOnly={readOnly} type='date-mask'/>
                        <FormCheckbox className='col-md-2' ref={e => this.itemNghiViec = e} label='Nghỉ việc' readOnly={this.props.readOnly} onChange = {value=>this.setState({nghiViec:value})}/>
                        <div className="col-md-5" style={{display:this.state.nghiViec?'block':'none'}}>
                            <FormDatePicker ref={e => this.itemEndDate = e} label='Ngày nghỉ việc'readOnly={readOnly} type='date-mask'/>
                        </div>
                        <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Chỗ ở hiện tại' readOnly={readOnly} rows='2' />
                        <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Địa chỉ thường trú' readOnly={readOnly} rows='2' />

                    </div >
                </div>

            {permission.write ?<>
                <CirclePageButton type='save' style={{ right: '10px' }} onClick={this.save} />
            </>  : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateTeacher, getTeacher ,getCategoryAll};
export default connect(mapStateToProps, mapActionsToProps)(TeacherInfoPage);