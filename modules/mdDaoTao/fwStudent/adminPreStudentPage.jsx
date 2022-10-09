import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentPage, createPreStudent, updatePreStudent, deletePreStudent,exportPreStudent } from './redux';
import { ajaxSelectCourseType,getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { ajaxSelectLecturer } from 'modules/_default/fwUser/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, CirclePageButton, FormImageBox, FormDatePicker, AdminModal, FormTextBox, FormRichTextBox, FormSelect, TableCell, renderTable,TableHead,TableHeadCell } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import {ajaxSelectCourseFeeByCourseType,getCourseFeeAll} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectCoursePayment,getCoursePaymentAll} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectDiscount,getDiscountAll} from 'modules/_default/fwDiscount/redux';
import {ajaxSelectPlanCourseByCourseType} from 'modules/_default/fwPlanCourse/redux';
class PreStudenModal extends AdminModal {
    state = {courseType:'', giayToDangKy:[]};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday, user, image, residence, regularResidence, courseType, sex, division, planLecturer, identityCard,courseFee,discount,coursePayment, plannedCourse,giayToDangKy } = item 
        || { _id: null, firstname: '', lastname: '', birthday: '', user: {}, image, residence: '', regularResidence: '', identityCard: '', planCourse: '', hocPhiPhaiDong: '',isDon:false,isHinh:false,isIdentityCard:false,isGiayKhamSucKhoe:false,isBangLaiA1:false,giayToDangKy:[] };
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(user.email || '');
        this.itemPhoneNumber.value(user.phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        // this.itemPlanCourse.value(planCourse || '');
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
        
        // this.itemIsDon.value(isDon);
        // this.itemIsHinh.value(isHinh);
        // this.itemIsIdentityCard.value(isIdentityCard);
        // this.itemIsGiayKhamSucKhoe.value(isGiayKhamSucKhoe);
        // this.itemIsBangLaiA1.value(isBangLaiA1);

        const courseTypes = this.props.courseTypes;

        this.setState({ _id,giayToDangKy:giayToDangKy.length ? giayToDangKy.map(item=>item._id):[], divisionId: division && division._id, image,courseType:courseTypes.find(item=>courseType && item._id==courseType._id)}, () => {
            this.itemPlanLecturer.value(planLecturer ? { id: planLecturer._id, text: `${planLecturer.lastname} ${planLecturer.firstname}` } : null);
            this.setValueCourseFee(courseType?courseType._id:null,courseFee);
            this.setValuePlannedCourse(courseType?courseType._id:null,plannedCourse);
            // this.itemCourseFee.value(courseFee?{id:courseFee._id,text:courseFee.name}:null);
            // this.itemDiscount.value(discount?{id:discount._id,text:discount.name}:null);
            // this.itemCoursePayment.value(coursePayment?{id:coursePayment._id,text:coursePayment.title}:null);
        });
    }

    setValuePlannedCourse = (courseTypeId,plannedCourse=null)=>{
        if( !courseTypeId || !plannedCourse || !plannedCourse.courseType || plannedCourse.courseType!=courseTypeId){
            this.itemPlannedCourse.value(null);
        }else{
            this.itemPlannedCourse.value({id:plannedCourse._id,text:plannedCourse.title});
        }
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
            plannedCourse: this.itemPlannedCourse.value(),
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
            // isDon:this.itemIsDon.value(),
            // isHinh:this.itemIsHinh.value(),
            // isIdentityCard:this.itemIsIdentityCard.value(),
            // isGiayKhamSucKhoe:this.itemIsGiayKhamSucKhoe.value(),
            // isBangLaiA1:this.itemIsBangLaiA1.value(),
            giayToDangKy:this.state.giayToDangKy
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
        }else if (!data.plannedCourse) {
            T.notify('Khóa dự kiến không được trống!', 'danger');
            this.itemPlannedCourse.focus();
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

    onChangeCourseType = (data) =>data && data.id && this.setState({courseType:this.props.courseTypes.find(item=>item._id==data.id)},()=>{
        this.setValueCourseFee(data.id);
        this.setValuePlannedCourse(data.id);
    });

    selectProfile = (giayTo) => {
        let giayToDangKy = this.state.giayToDangKy;
        const isSelected = giayToDangKy.find(item=>item==giayTo._id)!=undefined;
        if(isSelected){
            this.setState({ giayToDangKy:giayToDangKy.filter(item=>item!=giayTo._id)});
        }else{
            this.setState({giayToDangKy:[...giayToDangKy,giayTo._id]});
        }
    }

    renderHoSoDangKy = (profile)=>{
        const {type} = profile;
        return( 
        <a key={profile._id} className='col-md-4 mt-1 d-flex align-items-center text-secondary' href='#' onClick={e => e.preventDefault()|| e.stopPropagation() || this.selectProfile(type)}>
            <div className={'animated-checkbox'}>
                <input type='checkbox' checked={type._id && (this.state.giayToDangKy.find(id=>id==type._id)!=undefined)} onChange={e=>e.preventDefault()} />
                <span className={'label-text'}></span>
            </div>
            <span style={{whiteSpace:'normal'}}> {type ? type.title : ''}</span>
        </a>
        );
    }

    render = () => {
        const readOnly = this.props.readOnly;
        const {profileType} = this.state.courseType||{};
        const profiles = profileType && profileType.profiles ? profileType.profiles:null;
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
                <div className="col-md-12">
                    <div className="row">
                        {profileType ? <div className="col-12"><p className='mb-0'><b>Hồ sơ đăng ký:</b> {profileType.title||''}</p></div>:null}
                        {profiles && profiles.length ? profiles.map(item=>this.renderHoSoDangKy(item)) :null}
                    </div>
                </div>
                <FormSelect className='col-md-6' ref={e => this.itemPlanLecturer = e} label='Giáo viên dự kiến' data={ajaxSelectLecturer(this.state.divisionId)} readOnly={readOnly} required />
                <FormSelect className='col-md-6' ref={e => this.itemPlannedCourse = e} label='Khóa dự kiến' data={ajaxSelectPlanCourseByCourseType(this.state.courseType)} required/>
                {/* <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} /> */}
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}

class PreStudentPage extends AdminPage {
    state = { searchText: '', isSearching: false, courseTypes:[] };

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

        this.props.getCourseTypeAll(courseTypes=>this.setState({courseTypes}));
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
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} create={this.props.createPreStudent} update={this.props.updatePreStudent} courseTypes={this.state.courseTypes}
                defaultCourseFees={this.state.defaultCourseFees} defaultDiscount={this.state.defaultDiscount} defaultCoursePayment={this.state.defaultCoursePayment} />
                {permission.import ? <CirclePageButton type='import' style={{ right: '70px' }} onClick={() => this.props.history.push('/user/pre-student/import')} /> : null}
                {permission.export ? <CirclePageButton type='export' style={{ right: '130px' }} onClick={(e) => e.preventDefault()||this.props.exportPreStudent()} /> : null}
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getPreStudentPage, deletePreStudent, createPreStudent, updatePreStudent,getCourseFeeAll,getCoursePaymentAll,getDiscountAll,exportPreStudent, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(PreStudentPage);
