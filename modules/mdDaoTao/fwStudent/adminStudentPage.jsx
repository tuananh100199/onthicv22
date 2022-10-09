import React from 'react';
import { connect } from 'react-redux';
import { getOfficialStudentPage ,updateOfficialStudent, exportOfficialStudent, deleteOfficialStudent} from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell,AdminModal,FormTextBox,FormSelect,FormRichTextBox,FormImageBox,FormDatePicker  } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {getCourse, ajaxSelectOfficialCourse} from 'modules/mdDaoTao/fwCourse/redux';
import {ajaxSelectCourseFeeByCourseType} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectCoursePayment} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectDiscount} from 'modules/_default/fwDiscount/redux';
class PreStudenModal extends AdminModal {
    state = {courseType:'',profileType:{}, giayToDangKy:[]};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday,email,phoneNumber, user, image, residence, regularResidence, courseType,course, sex, division, identityCard,courseFee,discount,coursePayment, giayToDangKy } = item 
        || { _id: null, firstname: '', lastname: '', birthday: '', image, residence: '', regularResidence: '', identityCard: '', planCourse: '', hocPhiPhaiDong: '',giayToDangKy:[] };
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemEmail.value(email||user.email || '');
        this.itemPhoneNumber.value(phoneNumber||user.phoneNumber || '');
        this.itemIdentityCard.value(identityCard || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemResidence.value(residence || '');
        this.itemCourseType.value(courseType ? courseType.title : '');
        this.itemCourse.value(course ? course.name : '');
        course && this.props.getCourse(course._id,data=>{
            const {profileType={}} = data.item||{};
            this.setState({profileType});
        });
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`pre-student:${_id || 'new'}`);
        this.itemCourseFee.value(courseFee ? courseFee.name : '');
        this.itemDiscount.value(discount ? discount.name : '');
        this.itemCoursePayment.value(coursePayment ? coursePayment.title : '');
        // this.itemIsDon.value(isDon);
        // this.itemIsHinh.value(isHinh);
        // this.itemIsIdentityCard.value(isIdentityCard);
        // this.itemIsGiayKhamSucKhoe.value(isGiayKhamSucKhoe);
        // this.itemIsBangLaiA1.value(isBangLaiA1);
        this.setState({ _id, giayToDangKy:giayToDangKy.length ? giayToDangKy.map(item=>item._id):[] , divisionId: division && division._id, image,courseType:courseType?courseType._id:'' });
    }

    onSubmit = () => {
        const data = {
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            email: this.itemEmail.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            identityCard: this.itemIdentityCard.value(),
            sex: this.itemSex.value(),
            residence: this.itemResidence.value(),
            regularResidence: this.itemRegularResidence.value(),
            image: this.state.image,
            division: this.itemDivision.value(),
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
        }else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : T.notify('Cập nhật học viên thành công!', 'success') && this.props.create(data, this.hide());
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
        const profileType = this.state.profileType||{};
        const profiles = profileType && profileType.profiles ? profileType.profiles:null;
        return this.renderModal({
            title: 'Thông tin học viên',
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
                <FormSelect className='col-md-4' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} onChange={this.onChangeDivision} readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.itemCourseType = e} label='Hạng đăng ký' readOnly={true}/>
                <FormTextBox className='col-md-4' ref={e => this.itemCourse = e} label='Khóa học' data={this.props.course} readOnly={true}/>
                <FormTextBox className='col-md-4' ref={e => this.itemCourseFee = e} label='Gói học phí' data={ajaxSelectCourseFeeByCourseType(this.state.courseType,true)} readOnly={true} />
                <FormTextBox className='col-md-4' ref={e => this.itemDiscount = e} label='Giảm giá' data={ajaxSelectDiscount} readOnly={true} />
                <FormTextBox className='col-md-4' ref={e => this.itemCoursePayment = e} label='Số lần thanh toán' data={ajaxSelectCoursePayment} readOnly={true}/>
                
                <div className="col-md-12">
                    <div className="row">
                        {profileType ? <div className="col-12"><p className='mb-0'><b>Hồ sơ đăng ký:</b> {profileType.title||''}</p></div>:null}
                        {profiles && profiles.length ? profiles.map(item=>this.renderHoSoDangKy(item)) :null}
                    </div>
                </div>
                {/* <FormCheckbox className='col-md-2' ref={e => this.itemIsDon = e} label='Đơn' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsHinh = e} label='Hình' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsGiayKhamSucKhoe = e} label='GKSK' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsIdentityCard = e} label='CMND/CCCD' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsBangLaiA1 = e} label='Bằng lái A1' readOnly={this.props.readOnly} /> */}
                {/* <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} /> */}
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}
class StudentPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready(() =>{
            T.showSearchBox();
            this.props.getOfficialStudentPage(1, 50, {},{},{});
        });
        
        T.onSearch = (searchText) => this.props.getOfficialStudentPage(undefined, undefined, searchText ? { searchText } : null,{},{}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá học viên', 'Bạn có chắc muốn xoá học viên này?', true, isConfirm =>
    isConfirm && this.props.deleteOfficialStudent(item._id));

    render() {
        const permission = this.getUserPermission('student', ['read', 'write', 'delete']);
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };
            const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,autoDisplay:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getOfficialStudentPage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell name='fullName' sort={true} filter='search' style={{ width: '50%' }}>Họ và Tên</TableHeadCell>
                    <TableHeadCell style={{ width: '30%' }}>CMND/CCCD</TableHeadCell>
                    <TableHeadCell name='division' filter='select' filterData={ajaxSelectDivision} style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</TableHeadCell>
                    <TableHeadCell name='courseType' filter='select' filterData={ajaxSelectCourseType} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hạng đăng ký</TableHeadCell>
                    <TableHeadCell name='course' filter='select' filterData={ajaxSelectOfficialCourse} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard||''} />
                    <TableCell type='text' content={item.division?item.division.title:''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.courseType ? item.courseType.title:''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.course ? item.course.name:''} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}/>
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-graduation-cap',
            title: 'Học viên',
            breadcrumb: ['Học viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminStudentOfficialPage' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getOfficialStudentPage} />
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateOfficialStudent} getCourse = {this.props.getCourse}/>
            </>,
            onExport:permission.write ? ()=>this.props.exportOfficialStudent() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getOfficialStudentPage,updateOfficialStudent,exportOfficialStudent,deleteOfficialStudent, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(StudentPage);