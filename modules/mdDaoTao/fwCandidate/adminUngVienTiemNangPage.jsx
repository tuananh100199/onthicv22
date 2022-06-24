import React from 'react';
import { connect } from 'react-redux';
import { getCandidatePage, getCandidate, updateCandidate, deleteCandidate,updateUngVienTiemNang } from './redux';
import Pagination from 'view/component/Pagination';
import { getCourseTypeAll, ajaxSelectCourseType, ajaxGetCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, FormSelect, FormDatePicker,TableHead,TableHeadCell } from 'view/component/AdminPage';
import Dropdown from 'view/component/Dropdown';
import { ajaxSelectDivision, ajaxGetDivision, getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import {ajaxSelectCourseFeeByCourseType,getCourseFeeAll} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectCoursePayment,getCoursePaymentAll} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectDiscount,getDiscountAll} from 'modules/_default/fwDiscount/redux';
import {ajaxSelectPlanCourseByCourseType} from 'modules/_default/fwPlanCourse/redux';
class CandidateModal extends AdminModal {
    state = {giayToDangKy:[]};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = ({ _id, courseFee , discount , coursePayment , firstname = '', lastname = '', email = '', phoneNumber = '',
     identityCard = '', birthday = null, plannedCourse = '', onUpdated, courseType = null, division = '',
     giayToDangKy=[] }) => {
        this.onUpdated = onUpdated;
        this.itemFirstname.value(firstname);
        this.itemLastname.value(lastname);
        this.itemEmail.value(email);
        this.itemPhoneNumber.value(phoneNumber);
        this.itemIdentityCard.value(identityCard);
        this.itemBirthday.value(birthday);
        ajaxGetCourseType(courseType, data => { //TODO: cần xem lại đoạn code này
            this.setState({ courseTypeTitle: data.item.title,courseFee });
        });
        this.courseType.value(courseType?{id:courseType._id,text:courseType.title}:null);
        ajaxGetDivision(division, data => //TODO: cần xem lại đoạn code này
            this.division.value(data && data.item ? { id: data.item._id, text: data.item.title } : null));
        this.setValueDiscount(discount);
        this.setValueCoursePayment(coursePayment);
        
        const courseTypes = this.props.courseTypes;
        this.setState({ _id,courseId:courseType._id, giayToDangKy, courseType:courseTypes.find(item=>item._id==courseType._id) },()=>{
            this.setValueCourseFee(courseType?courseType._id:null,courseFee);
            this.setValuePlannedCourse(courseType?courseType._id:null,plannedCourse);
        });
        // this.itemIsDon.value(isDon);
        // this.itemIsHinh.value(isHinh);
        // this.itemIsIdentityCard.value(isIdentityCard);
        // this.itemIsGiayKhamSucKhoe.value(isGiayKhamSucKhoe);
        // this.itemIsBangLaiA1.value(isBangLaiA1);
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
        else if(courseFee && courseFee.courseType==courseTypeId){
            // cho trường hợp không bị thay đổi courseType từ bên ngoài modal
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
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            birthday: this.itemBirthday.value(),
            plannedCourse: this.itemPlannedCourse.value(),
            courseType: this.courseType.value(),
            division: this.division.value(),
            courseFee:this.itemCourseFee.value(),
            discount:this.itemDiscount.value(),
            coursePayment:this.itemCoursePayment.value(),
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
        } else if (data.email !== '' && !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else if (data.division == null) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.division.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (!data.plannedCourse) {
            T.notify('Khóa dự kiến không được trống!', 'danger');
            this.itemPlannedCourse.focus();
        }else if (!data.courseFee) {
            T.notify('Gói học phí không được trống!', 'danger');
            this.itemCourseFee.focus();
        }else if (!data.coursePayment) {
            T.notify('Số lần thanh toán không được trống!', 'danger');
            this.itemCoursePayment.focus();
        } else {
            this.props.update(this.state._id, data, (error) => {
                this.onUpdated && this.onUpdated(error);
                this.hide();
            });
        }
    }

    onUpStudent = (e) => {
        e.preventDefault();
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            birthday: this.itemBirthday.value(),
            plannedCourse: this.itemPlannedCourse.value(),
            courseType: this.courseType.value(),
            division: this.division.value(),
            _id: this.state._id,
            courseFee:this.itemCourseFee.value()!=''?this.itemCourseFee.value():null,
            discount:this.itemDiscount.value()!=''?this.itemDiscount.value():null,
            coursePayment:this.itemCoursePayment.value()?this.itemCoursePayment.value():null,
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
        } else if (data.email !== '' && !T.validateEmail(data.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else if (data.division == null) {
            T.notify('Cơ sở đào tạo không được trống', 'danger');
            this.division.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh người dùng bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (data.plannedCourse == '') {
            T.notify('Khóa dự kiến không được trống!', 'danger');
            this.itemPlannedCourse.focus();
        }else if (!data.courseFee) {
            T.notify('Gói học phí không được trống!', 'danger');
            this.itemCourseFee.focus();
        }else if (!data.coursePayment) {
            T.notify('Số lần thanh toán không được trống!', 'danger');
            this.itemCoursePayment.focus();
        } else {
            data.state = 'UngVien';
            this.props.upStudent(e, data, this.state.courseTypeTitle);
            this.hide();
        }
    }

    onChangeCourseType = data => data && data.id && this.setState({courseId:data.id,courseType:this.props.courseTypes.find(item=>item._id==data.id)},()=>{
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
        const {profileType} = this.state.courseType||{};
        const profiles = profileType && profileType.profiles ? profileType.profiles:null;
        return this.renderModal({
            title: 'Đăng ký tư vấn',
            size: 'large',
            body: <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.itemLastname = e} label='Họ' required/>
                <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' required/>
                <FormTextBox className='col-md-4' ref={e => this.itemEmail = e} type='email' label='Email' />
                <FormTextBox className='col-md-4' ref={e => this.itemPhoneNumber = e} type='phone' label='Số điện thoại' required/>
                <FormSelect className='col-md-4' ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} onChange = {this.onChangeCourseType} required/>
                <FormSelect className='col-md-4' ref={e => this.division = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} required/>
                <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' required/>
                <FormDatePicker className='col-md-4' ref={e => this.itemBirthday = e} label='Ngày sinh' type='date-mask' required/>
                <FormSelect className='col-md-4' ref={e => this.itemPlannedCourse = e} label='Khóa dự kiến' data={ajaxSelectPlanCourseByCourseType(this.state.courseId)} required/>
                <FormSelect className='col-md-4' ref={e => this.itemCourseFee = e} label='Gói học phí' data={ajaxSelectCourseFeeByCourseType(this.state.courseId)} required/>
                <FormSelect className='col-md-4' ref={e => this.itemDiscount = e} label='Giảm giá' data={ajaxSelectDiscount} />
                <FormSelect className='col-md-4' ref={e => this.itemCoursePayment = e} label='Số lần thanh toán' data={ajaxSelectCoursePayment} required/>
                {profileType ? <div className="col-12"><p><b>Hồ sơ đăng ký:</b> {profileType.title||''}</p></div>:null}
                {profiles && profiles.length ? profiles.map(item=>this.renderHoSoDangKy(item)) :null}
            </div>,
            buttons: this.props.permission.write ?
                <a className='btn btn-warning' href='#' onClick={e => this.onUpStudent(e)} style={{ color: 'white' }}>
                    <i className='fa fa-lg fa-paper-plane' /> Chuyển thành ứng viên
                </a> : null
        });
    };
}

class CandidatePage extends AdminPage {
    state = { courseTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.getPage(null,null,'',{},{});
        this.props.getCourseTypeAll(courseTypes => {
            this.setState({ courseTypes });
        });
        this.props.getDivisionAll(list => {
            const division = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ division });
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
        T.onSearch = (searchText) => this.getPage(1, 50, {searchText});
    }

    getPage = (pageNumber,pageSize,searchText='',filter,sort)=>this.props.getCandidatePage(pageNumber, pageSize, {state:'UngVienTiemNang',searchText},filter,sort);

    edit = (e, item) => e.preventDefault() || this.candidateModal.show(item);

    updateCourseType = (item, courseType) => this.props.updateCandidate(item._id, { courseType });

    updateDivision = (item, division) => this.props.updateCandidate(item._id, { division });

    updateState = (item, state) => this.props.updateCandidate(item._id, { state });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá ứng viên tiềm năng', 'Bạn có chắc muốn xoá ứng viên tiềm năng này?', true, isConfirm =>
        isConfirm && this.props.deleteCandidate(item._id));

    upStudent = (e, item, courseTypeText) => e.preventDefault() || T.confirm('Trở thành ứng viên ', `Bạn có chắc muốn ${item.lastname + ' ' + item.firstname} trở thành ứng viên ${courseTypeText}?`, true, isConfirm =>
        isConfirm && this.props.updateCandidate(item._id, item));

    render() {
        const permission = this.getUserPermission('candidate', ['read', 'write', 'delete', 'export']);
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.candidate && this.props.candidate.page ?
            this.props.candidate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
            const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <TableHead getPage={this.props.getCandidatePage}>
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                <TableHeadCell name='fullName' sort={true} style={{ width: '100%' }} content='Họ và tên' nowrap='true'  filter='search'/> 
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} content='Email' nowrap='true' name='email' filter='search'/>
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} content='Số điện thoại' nowrap='true' name='phoneNumber' filter='search'/>
                <TableHeadCell name='createdDate' sort={true} style={{ width: 'auto', textAlign: 'center' }} content='Ngày tạo' nowrap='true'/> 
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true' content = 'Cơ sở đào tạo' />
                <TableHeadCell name='courseType' filter='select' filterData = {ajaxSelectCourseType} style={{ width: 'auto', textAlign: 'center' }} nowrap='true' content='Loại khóa học' /> 
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} content = 'Nhân viên xử lý' />
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
            </TableHead>
                ),
            renderRow: (item, index) => {
                const courseTypeText = item.courseType ? item.courseType.title : '',
                    dropdownCourseType = <Dropdown items={this.state.courseTypes.map(item=>({id:item._id,text:item.title}))} item={courseTypeText} onSelected={e => this.updateCourseType(item, e.id)} />;
                const divisionText = item.division ? item.division.title : 'Chưa gán',
                    dropdownDivision = <Dropdown items={this.state.division} item={divisionText} onSelected={e => this.updateDivision(item, e.id)} />;
                const dates = <>
                    <p style={{ margin: 0 }}>{item.staff ? item.staff.lastname + ' ' + item.staff.firstname : 'Chưa xử lý!'}</p>
                    <p style={{ margin: 0 }} className='text-secondary'>{new Date(item.createdDate).getText()}</p>
                    {item.modifiedDate ? <p style={{ margin: 0 }} className='text-success'>{new Date(item.modifiedDate).getText()}</p> : null}
                </>;
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.lastname + ' ' + item.firstname} onClick={e => this.edit(e, item)} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.email} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell content={item.phoneNumber} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.createdDate ? T.dateToText(item.createdDate, 'dd/mm/yyyy') : ''} />
                        <TableCell content={dropdownDivision} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dropdownCourseType} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={dates} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete = {this.delete}>
                        </TableCell>
                    </tr>);
            },
        });

        return this.renderPage({
            icon: 'fa fa-user-plus',
            title: 'Ứng viên tiềm năng',
            breadcrumb: ['Ứng viên tiềm năng'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageCandidate' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber,pageSize)=>this.getPage(pageNumber,pageSize)} />
                <CandidateModal ref={e => this.candidateModal = e} update={this.props.updateCandidate} upStudent={this.upStudent} permission={permission} courseTypes = {this.state.courseTypes}
                 defaultCourseFees={this.state.defaultCourseFees} defaultDiscount={this.state.defaultDiscount} defaultCoursePayment={this.state.defaultCoursePayment} />
            </>,
            // onExport: permission.export ? exportCandidateToExcel : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, candidate: state.communication.candidate });
const mapActionsToProps = { getCourseTypeAll, getCandidatePage, getCandidate, updateCandidate, deleteCandidate, getDivisionAll,getCourseFeeAll,getCoursePaymentAll,getDiscountAll,updateUngVienTiemNang };
export default connect(mapStateToProps, mapActionsToProps)(CandidatePage);