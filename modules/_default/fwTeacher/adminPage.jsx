import React from 'react';
import { connect } from 'react-redux';
import { getTeacherPage,createTeacher,updateTeacher,deleteTeacher } from './redux';
import { AdminPage, AdminModal,FormDatePicker,FormSelect, FormTextBox, TableCell, renderTable, FormRichTextBox, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectDivision,getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { Link } from 'react-router-dom';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {ajaxSelectCourseTeacher} from 'modules/mdDaoTao/fwCourse/redux';
class TeacherModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemMaGiaoVien.focus()));
    }

    onShow = (item) => {
        const { _id, maGiaoVien, firstname, lastname,sex, birthday,  identityCard, division,chungChiSuPham,dayLyThuyet,courseTypes} = item || 
        {_id:null,firstname:'',lastname:'',birthday:'',sex:null,division:null,identityCard:'',chungChiSuPham,dayLyThuyet:false,courseTypes:[]};

        this.itemMaGiaoVien.value(maGiaoVien||'');
        this.itemFirstname.value(firstname || '');
        this.itemLastname.value(lastname || '');
        this.itemBirthday.value(birthday);
        this.itemIdentityCard.value(identityCard || '');
        this.itemSex.value(sex ? sex : 'male');
        this.itemDivision.value(division ? { id: division._id, text: division.title } : null);
        this.itemDayLyThuyet.value(dayLyThuyet);
        this.itemDayThucHanh.value(!dayLyThuyet);
        this.itemCourseTypes.value(courseTypes);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            maGiaoVien:this.itemMaGiaoVien.value().toUpperCase(),
            firstname: this.itemFirstname.value(),
            lastname: this.itemLastname.value(),
            birthday: this.itemBirthday.value(),
            identityCard: this.itemIdentityCard.value(),
            sex: this.itemSex.value(),
            division: this.itemDivision.value(),
            email:this.itemEmail.value(),
            phoneNumber:this.itemPhoneNumber.value(),
            identityIssuedBy:this.itemIdentityCardIssuedBy.value(),
            identityDate:this.itemIdentityDate.value(),
            regularResidence:this.itemRegularResidence.value(),
            residence:this.itemResidence.value(),
            dayLyThuyet:this.itemDayLyThuyet.value()?1:0,
            courseTypes:this.itemCourseTypes.value(),
        };
        if (data.maGiaoVien == '') {
            T.notify('Mã giáo viên không được trống!', 'danger');
            this.itemMaGiaoVien.focus();
        }
        else if (data.lastname == '') {
            T.notify('Họ không được trống!', 'danger');
            this.itemLastname.focus();
        } else if (data.firstname == '') {
            T.notify('Tên không được trống!', 'danger');
            this.itemFirstname.focus();
        } else if (data.identityCard == '') {
            T.notify('Số CMND/CCCD không được trống!', 'danger');
            this.itemIdentityCard.focus();
        } else if (data.birthday == '') {
            T.notify('Ngày sinh bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (data.phoneNumber == '') {
            T.notify('Số điện thoại bị trống!', 'danger');
            this.itemBirthday.focus();
        } else if (!data.division) {
            T.notify('Cơ sở đào tạo không được trống!', 'danger');
            this.itemDivision.focus();
        }else {
            this.props.create(data,()=>{
                this.hide();
            });
        }
    }

    handleChange = value=>this.itemDayLyThuyet.value(value)||this.itemDayThucHanh.value(!value);

    // eslint-disable-next-line no-unused-vars

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Nhân viên',
            size: 'large',
            body: 
            <div className='row'>
                <FormTextBox className='col-md-4' ref={e => this.itemMaGiaoVien = e} label='Mã giáo viên' readOnly={readOnly} required/>
                <FormTextBox className='col-md-4' ref={e => this.itemLastname = e} label='Họ & tên đệm' readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.itemFirstname = e} label='Tên' readOnly={readOnly} required />
                <FormTextBox className='col-md-6' ref={e => this.itemEmail = e} label='Email' readOnly={readOnly}/>
                <FormTextBox className='col-md-6' ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={readOnly} required/>
                <FormSelect className='col-md-4' ref={e => this.itemSex = e} label='Giới tính' data={[{ id: 'female', text: 'Nữ' }, { id: 'male', text: 'Nam' }]} readOnly={readOnly} />
                <FormDatePicker className='col-md-4' ref={e => this.itemBirthday = e} label='Ngày sinh' readOnly={readOnly} type='date-mask' required />
                <FormSelect className='col-md-4' ref={e => this.itemDivision = e} label='Cơ sở đào tạo' data={ajaxSelectDivision} readOnly={readOnly} required />
                <FormTextBox className='col-md-4' ref={e => this.itemIdentityCard = e} label='CMND/CCCD' readOnly={readOnly}  />
                <FormDatePicker className='col-md-4' ref={e => this.itemIdentityDate = e} label='Ngày cấp' readOnly={readOnly}  />
                <FormTextBox className='col-md-4' ref={e => this.itemIdentityCardIssuedBy = e} label='Nơi cấp' readOnly={readOnly} required />
                <FormCheckbox className='col-md-3' ref={e => this.itemDayLyThuyet = e} isSwitch={true} label='Dạy lý thuyết' readOnly={readOnly} onChange={active => this.handleChange(active)} />
                <FormCheckbox className='col-md-3' ref={e => this.itemDayThucHanh = e} isSwitch={true} label='Dạy thực hành' readOnly={readOnly} onChange={active => this.handleChange(!active)} />
                <FormSelect className='col-md-6' ref={e => this.itemCourseTypes = e} label='Danh sách loại khóa học' data={ajaxSelectCourseType} multiple={true} readOnly={readOnly} />
                
                <FormRichTextBox className='col-md-6' ref={e => this.itemRegularResidence = e} label='Địa chỉ thường trú' readOnly={readOnly} rows='2'/>
                <FormRichTextBox className='col-md-6' ref={e => this.itemResidence = e} label='Chỗ ở hiện tại' readOnly={readOnly} rows='2'/>
            </div >
        });
    }
}

class AdminTeacherPage extends AdminPage {
    state = { course:'' };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getTeacherPage(1);
            this.props.getCategoryAll('teacher-certification', null, (items) =>{
                this.setState({ chungChiSuPhams: (items || []).map(item => ({ id: item._id, text: item.title })) });
            });

            this.itemCourse.value({id:'all',text:'Tất cả khóa học'});
            // this.props.
            T.onSearch = (searchText) =>{
                this.props.getTeacherPage(1,undefined,{searchText},()=>{
                    this.setState({searchText});
                });
            }; 
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText,course=this.itemCourse.value() }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        let condition = { searchText };
        if(course && course!='all') condition.course=course;
        console.log('condition: ',condition);
        this.props.getTeacherPage(pageNumber,pageSize,condition,page=>{
            done && done(page);
            this.setState({searchText});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin giáo viên', 'Bạn có chắc bạn muốn xóa thông tin giáo viên này?', true, isConfirm =>
        isConfirm && this.props.deleteTeacher(item._id));
    
    renderListCourse = courses=>(<>
        {courses.map((course,index)=><p style={{marginBottom:0}} key={index}>{course.name}</p>)}
    </>)
    render() {
        const permission = this.getUserPermission('teacher');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.teacher && this.props.teacher.page ?
        this.props.teacher.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Mã GV</th>
                    <th style={{ width: '100%' }}>Họ tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin liên lạc</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày sinh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại giáo viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại khóa học</th> 
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học đang dạy</th> 
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) =>{
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                        <TableCell  content={item.maGiaoVien} />
                        <TableCell type='link' content={<>{`${item.lastname} ${item.firstname}`} <br /> {item.identityCard}</>} url={'/user/teacher/' + item._id} />
                        <TableCell  content={<>{item.email}<br/> {item.phoneNumber}</>} />
                        <TableCell  content={item.birthday ? T.dateToText(item.birthday, 'dd/mm/yyyy') : ''} />
                        <TableCell  style={{whiteSpace:'nowrap'}} content={item.division? item.division.title:''} />
                        <TableCell  content={item.dayLyThuyet?'GV lý thuyết':'GV thực hành'} />
                        <TableCell  content={item.courseTypes && item.courseTypes.length ? item.courseTypes.reduce((result,item)=> result+(result!=''?(', '+item.title):item.title),''):'chưa có'} />
                        {/* <TableCell  content={item.courses && item.courses.length ? item.courses.reduce((result,item)=> result+(result!=''?('\n'+item.name):item.name),''):'chưa có'} /> */}
                        <TableCell  content={item.courses && item.courses.length ? this.renderListCourse(item.courses):'chưa có'} />
                        
                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/teacher/' + item._id} onDelete={this.delete}>
                            <Link className='btn btn-warning' to={`/user/manage-lecturer/${item.user._id}/rating`}>
                                <i className="fa fa-star" aria-hidden="true"></i>
                            </Link>
                        </TableCell>
                    </tr>);
            } ,
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Giáo viên',
            breadcrumb: ['Giáo viên'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <FormSelect ref={e => this.itemCourse = e} className='col-md-4' label='Khóa học đang dạy' data={ajaxSelectCourseTeacher} onChange={() => this.onSearch({})} readOnly={!permission.write} />
                    </div>    
                    {table}
                </div>
                <Pagination name='pageTeacher' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherPage} />
                <TeacherModal ref={e => this.modal = e} readOnly={!permission.write} history={this.props.history}
                    create={this.props.createTeacher} update={this.props.updateTeacher} chungChiSuPhams={this.state.chungChiSuPhams}/>
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacher: state.enrollment.teacher });
const mapActionsToProps = { getTeacherPage,createTeacher,updateTeacher,deleteTeacher,getDivisionAll,getCategoryAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherPage);