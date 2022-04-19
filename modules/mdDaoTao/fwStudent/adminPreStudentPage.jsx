import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, createPreStudent, updatePreStudent, deletePreStudent,exportPreStudent } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { ajaxSelectLecturer } from 'modules/_default/fwUser/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormImageBox, FormDatePicker, AdminModal, FormTextBox, FormRichTextBox, FormSelect, TableCell, renderTable,FormCheckbox,TableHead,TableHeadCell } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import {ajaxSelectCourseFeeByCourseType,getCourseFeeAll} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectCoursePayment,getCoursePaymentAll} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectDiscount,getDiscountAll} from 'modules/_default/fwDiscount/redux';
class PreStudenModal extends AdminModal {
    state = {courseType:''};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday, user, image, residence, regularResidence, courseType, sex, division, planLecturer, identityCard, planCourse,courseFee,discount,coursePayment,isDon,isHinh,isIdentityCard,isGiayKhamSucKhoe,isBangLaiA1 } = item 
        || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', identityCard: '', planCourse: '', hocPhiPhaiDong: '',isDon:false,isHinh:false,isIdentityCard:false,isGiayKhamSucKhoe:false,isBangLaiA1:false };
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
        // this.itemHocPhiPhaiDong.value(hocPhiPhaiDong || '');
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`pre-student:${_id || 'new'}`);
        this.setValueDiscount(discount);
        // this.itemCoursePayment.value(coursePayment?{id:coursePayment._id,text:coursePayment.title}:null);
        this.setValueCoursePayment(coursePayment);
        
        this.itemIsDon.value(isDon);
        this.itemIsHinh.value(isHinh);
        this.itemIsIdentityCard.value(isIdentityCard);
        this.itemIsGiayKhamSucKhoe.value(isGiayKhamSucKhoe);
        this.itemIsBangLaiA1.value(isBangLaiA1);
        this.setState({ _id, divisionId: division && division._id, image,courseType:courseType?courseType._id:'' }, () => {
            this.itemPlanLecturer.value(planLecturer ? { id: planLecturer._id, text: `${planLecturer.lastname} ${planLecturer.firstname}` } : null);
            this.setValueCourseFee(courseType?courseType._id:null,courseFee);
            // this.itemCourseFee.value(courseFee?{id:courseFee._id,text:courseFee.name}:null);
            // this.itemDiscount.value(discount?{id:discount._id,text:discount.name}:null);
            // this.itemCoursePayment.value(coursePayment?{id:coursePayment._id,text:coursePayment.title}:null);
        });
    }

    setValueCourseFee = (courseTypeId,courseFee=null)=>{
        if(!courseTypeId){
            this.itemCourseFee.value(null);    
        }
        else if(courseFee){
            this.itemCourseFee.value({id:courseFee._id,text:courseFee.name});    
        }else{
            courseFee = this.props.defaultCourseFees.find(item=>item.courseType._id==courseTypeId);
            this.itemCourseFee.value(courseFee?{id:courseFee._id,text:courseFee.name}:null);
        }
    }

    setValueDiscount = (discount)=>{
        if(discount){
            this.itemDiscount.value({id:discount._id,text:discount.name});
        }else{
            this.itemDiscount.value(this.props.defaultDiscount?{id:this.props.defaultDiscount._id,text:this.props.defaultDiscount.name}:null);
        }
    }

    setValueCoursePayment = coursePayment=>{
        if(coursePayment){
            this.itemCoursePayment.value({id:coursePayment._id,text:coursePayment.title});
        }else{
            this.itemCoursePayment.value(this.props.defaultCoursePayment?{id:this.props.defaultCoursePayment._id,text:this.props.defaultCoursePayment.title}:null);
        }
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
            planLecturer: this.itemPlanLecturer.value(),
            // hocPhiPhaiDong: this.itemHocPhiPhaiDong.value(),
            courseFee:this.itemCourseFee.value(),
            discount:this.itemDiscount.value(),
            coursePayment:this.itemCoursePayment.value(),
            isDon:this.itemIsDon.value(),
            isHinh:this.itemIsHinh.value(),
            isIdentityCard:this.itemIsIdentityCard.value(),
            isGiayKhamSucKhoe:this.itemIsGiayKhamSucKhoe.value(),
            isBangLaiA1:this.itemIsBangLaiA1.value(),
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
        } else if (!data.courseType) {
            T.notify('Hạng đăng ký không được trống!', 'danger');
            this.itemCourseType.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        }else if(!data.courseFee){
            T.notify('Gói học phí không được trống!', 'danger');
            this.itemCourseFee.focus();
        }else if(!data.coursePayment){
            T.notify('Số lần đóng học phí không được trống!', 'danger');
            this.itemCoursePayment.focus();
        } 
        // else if (!data.hocPhiPhaiDong) {
        //     T.notify('Học phí không được trống!', 'danger');
        //     this.itemHocPhiPhaiDong.focus();
        // } 
        else if (!data.planLecturer) {
            T.notify('Giáo viên dự kiến không được trống!', 'danger');
            this.itemPlanLecturer.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Tạo ứng viên thành công!', 'success') && this.props.create(data, this.hide());
        }
    }

    // eslint-disable-next-line no-unused-vars
    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
        }
    }

    onChangeDivision = (data) => data && data.id && this.setState({ divisionId: data.id }, () => {
        this.itemPlanLecturer.value(null);
    });

    onChangeCourseType = (data) =>data && data.id && this.setState({courseType:data.id},()=>{
        this.setValueCourseFee(data.id);
    });

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Ứng viên',
            size: 'large',
            body: <div className='row'>
                <div className='col-md-8'>
                    <div className='row'>
                        <FormTextBox className='col-md-8' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} required />
                        <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} required />
                        <FormTextBox className='col-md-6' ref={e => this.itemEmail = e} label='Email' readOnly={this.state._id ? true : readOnly} type='email' />
                        <FormTextBox className='col-md-6' type='phone' ref={e => this.itemPhoneNumber = e} label='Số điện thoại' required />
                    </div>
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='PreStudentImage' image={this.state.image} readOnly={readOnly}
                    onSuccess={this.onUploadSuccess} />
                <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly} required />
                <FormDatePicker className='col-md-4' ref={e => this.itemBirthday = e} label='Ngày sinh' readOnly={readOnly} type='date-mask' required />
                <FormSelect className='col-md-4' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                <FormSelect className='col-md-4' ref={e => this.itemCourseType = e} label='Hạng đăng ký' data={ajaxSelectCourseType} readOnly={readOnly} required onChange = {this.onChangeCourseType}/>
                <FormSelect className='col-md-4' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} onChange={this.onChangeDivision} readOnly={readOnly} required />
                {/* <FormTextBox className='col-md-4' ref={e => this.itemHocPhiPhaiDong = e} label='Học phí' readOnly={readOnly} required /> */}
                <FormSelect className='col-md-4' ref={e => this.itemCourseFee = e} label='Gói học phí' data={ajaxSelectCourseFeeByCourseType(this.state.courseType,true)} readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.itemDiscount = e} label='Giảm giá' data={ajaxSelectDiscount} readOnly={readOnly} />
                <FormSelect className='col-md-6' ref={e => this.itemCoursePayment = e} label='Số lần thanh toán' data={ajaxSelectCoursePayment} readOnly={readOnly} required/>
                <FormCheckbox className='col-md-2' ref={e => this.itemIsDon = e} label='Đơn' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsHinh = e} label='Hình' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsGiayKhamSucKhoe = e} label='GKSK' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsIdentityCard = e} label='CMND/CCCD' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsBangLaiA1 = e} label='Bằng lái A1' readOnly={this.props.readOnly} />
                <FormSelect className='col-md-6' ref={e => this.itemPlanLecturer = e} label='Giáo viên dự kiến' data={ajaxSelectLecturer(this.state.divisionId)} readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}

class PreStudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getPreStudentPage(1, 50, undefined,{},{});
        T.onSearch = (searchText) => this.props.getPreStudentPage(undefined, undefined, searchText ? { searchText } : null,null,null, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });

        this.props.getCourseFeeAll({isDefault:true},defaultCourseFees=>{//get default courseFee
            this.setState({defaultCourseFees});
        });

        this.props.getDiscountAll({isDefault:true},defaultDiscounts=>{//get default discount
            this.setState({defaultDiscount:defaultDiscounts? defaultDiscounts[0]:null});
        });

        this.props.getCoursePaymentAll({default:true},defaultCoursePayments=>{//get default coursePayment
            this.setState({defaultCoursePayment:defaultCoursePayments? defaultCoursePayments[0]:null});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên', 'Bạn có chắc muốn xoá ứng viên này?', true, isConfirm =>
        isConfirm && this.props.deletePreStudent(item._id));

    create = (e) => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('pre-student', ['read', 'write', 'delete', 'import', 'export']),
            permissionUser = this.getUserPermission('user', ['read']);
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.prePage ?
            this.props.student.prePage : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getPreStudentPage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell name='fullName' sort={true} filter='search' style={{ width: '50%' }}>Họ và Tên</TableHeadCell>
                    <TableHeadCell name='identityCard' style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Thông tin liên hệ</TableHeadCell>
                    <TableHeadCell name='courseType' filter='select' filterData={ajaxSelectCourseType} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</TableHeadCell>
                    <TableHeadCell name='division' filter='select' filterData={ajaxSelectDivision} style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={<label>{permissionUser.read ?
                        <a href={`/user/member?user=${item.user && item.user._id}`}>{item.user && item.user.email}</a> : item.user && item.user.email}<br />{T.mobileDisplay(item.user && item.user.phoneNumber)}</label>} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType && item.courseType.title} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Ứng viên',
            breadcrumb: ['Ứng viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminPreStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getPreStudentPage} />
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} create={this.props.createPreStudent} update={this.props.updatePreStudent} 
                defaultCourseFees={this.state.defaultCourseFees} defaultDiscount={this.state.defaultDiscount} defaultCoursePayment={this.state.defaultCoursePayment} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px' }} onClick={() => this.props.history.push('/user/pre-student/import')} /> : null}
                {permission.export ? <CirclePageButton type='export' style={{ right: '130px' }} onClick={(e) => e.preventDefault()||this.props.exportPreStudent()} /> : null}
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getPreStudentPage, deletePreStudent, createPreStudent, updatePreStudent,getCourseFeeAll,getCoursePaymentAll,getDiscountAll,exportPreStudent };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);
