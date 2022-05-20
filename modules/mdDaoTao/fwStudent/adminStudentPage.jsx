import React from 'react';
import { connect } from 'react-redux';
import { getOfficialStudentPage ,updateOfficialStudent, exportOfficialStudent} from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell,AdminModal,FormTextBox,FormSelect,FormCheckbox,FormRichTextBox,FormImageBox,FormDatePicker  } from 'view/component/AdminPage';
import { ajaxSelectDivision } from 'modules/mdDaoTao/fwDivision/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {getCourseAll} from 'modules/mdDaoTao/fwCourse/redux';
import {ajaxSelectCourseFeeByCourseType} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectCoursePayment} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectDiscount} from 'modules/_default/fwDiscount/redux';
class PreStudenModal extends AdminModal {
    state = {courseType:''};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemLastname.focus()));
    }

    onShow = (item) => {
        const { _id, firstname, lastname, birthday,email,phoneNumber, user, image, residence, regularResidence, courseType,course, sex, division, identityCard,courseFee,discount,coursePayment,isDon,isHinh,isIdentityCard,isGiayKhamSucKhoe,isBangLaiA1 } = item 
        || { _id: null, firstname: '', lastname: '', birthday: '', image, residence: '', regularResidence: '', identityCard: '', planCourse: '', hocPhiPhaiDong: '',isDon:false,isHinh:false,isIdentityCard:false,isGiayKhamSucKhoe:false,isBangLaiA1:false };
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
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemRegularResidence.value(regularResidence || '');
        this.imageBox.setData(`pre-student:${_id || 'new'}`);
        this.itemCourseFee.value(courseFee ? courseFee.name : '');
        this.itemDiscount.value(discount ? discount.name : '');
        this.itemCoursePayment.value(coursePayment ? coursePayment.title : '');
        this.itemIsDon.value(isDon);
        this.itemIsHinh.value(isHinh);
        this.itemIsIdentityCard.value(isIdentityCard);
        this.itemIsGiayKhamSucKhoe.value(isGiayKhamSucKhoe);
        this.itemIsBangLaiA1.value(isBangLaiA1);
        this.setState({ _id, divisionId: division && division._id, image,courseType:courseType?courseType._id:'' });
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

    render = () => {
        const readOnly = this.props.readOnly;
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
                <FormCheckbox className='col-md-2' ref={e => this.itemIsDon = e} label='Đơn' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsHinh = e} label='Hình' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-2' ref={e => this.itemIsGiayKhamSucKhoe = e} label='GKSK' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsIdentityCard = e} label='CMND/CCCD' readOnly={this.props.readOnly} />
                <FormCheckbox className='col-md-3' ref={e => this.itemIsBangLaiA1 = e} label='Bằng lái A1' readOnly={this.props.readOnly} />
                {/* <FormTextBox className='col-md-6' ref={e => this.itemPlanCourse = e} label='Khóa dự kiến' readOnly={readOnly} /> */}
                <FormRichTextBox ref={e => this.itemResidence = e} className='col-md-6' label='Nơi cư trú' readOnly={readOnly} rows='2' />
                <FormRichTextBox ref={e => this.itemRegularResidence = e} className='col-md-6' label='Nơi đăng ký hộ khẩu thường trú' readOnly={readOnly} rows='2' />
            </div >
        });
    }
}
class StudentPage extends AdminPage {
    state = { searchText: '', isSearching: false, course: null };

    componentDidMount() {
        T.ready(() =>{
            T.showSearchBox();
            this.props.getOfficialStudentPage(1, 50, undefined,{},{});
            this.props.getCourseAll({isDefault:false},list=>{
                this.setState({course:list.map(item=>({id:item._id,text:item.name}))});   
            }
            );
        });
        
        T.onSearch = (searchText) => this.props.getOfficialStudentPage(undefined, undefined, searchText ? { searchText } : null,{},{}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

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
                    <TableHeadCell name='course' filter='select' filterData={this.state.course} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</TableHeadCell>
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
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit}/>
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
                <PreStudenModal readOnly={!permission.write} ref={e => this.modal = e} update={this.props.updateOfficialStudent} />
            </>,
            onExport:permission.write ? ()=>this.props.exportOfficialStudent() : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getOfficialStudentPage,getCourseAll,updateOfficialStudent,exportOfficialStudent };
export default connect(mapStateToProps, mapActionsToProps)(StudentPage);