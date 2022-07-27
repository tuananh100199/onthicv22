import React from 'react';
import { connect } from 'react-redux';
import { getProfileStudentPage,updateProfileStudent } from './redux';
import { AdminPage, renderTable, TableCell,FormSelect,TableHeadCell,TableHead } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {  getCourseTypeAll,ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {ajaxSelectOfficialCourseByCourseType} from 'modules/mdDaoTao/fwCourse/redux';

const filterCondition = [
    {id:'1',text:'Hoàn tất'},
    {id:'0',text:'Chưa hoàn tất'},
];
class ProfileStudentPage extends AdminPage {
    state = {courseType:{},course:{}};
    componentDidMount() {
        T.ready('/user/profile-student', () => {
            // T.showSearchBox();
            // T.onSearch = (searchText) => this.onSearch({searchText},()=>this.setState({searchText}));
            
            // this.props.getCourseTypeAll(data => {
            //     const courseTypes = data.length && data.map(item => ({ id: item._id, text: item.title }));
            //     this.courseType.value(courseTypes.length ? courseTypes[0] : null);
            // });
            // this.onSearch({});
            this.props.getProfileStudentPage(1,null,{},{},data=>{
                const {courseType,course} = data;
                this.setState({course,courseType},()=>{
                    this.courseType.value(courseType?{id:courseType._id,text:courseType.title}:'');
                    this.course.value(course?{id:course._id,text:course.name}:'');
                });
            });
        });
    }

    onSearch = ({pageNumber,pageSize,_courseTypeId = this.courseType.value(),_courseId=this.course.value()},done)=>{        
        this.props.getProfileStudentPage(pageNumber, pageSize, {_courseId,_courseTypeId}, (data) => {
            done && done(data);
            const {courseType,course} = data;
            this.setState({course,courseType},()=>{
                this.courseType.value(courseType?{id:courseType._id,text:courseType.title}:'');
                this.course.value(course?{id:course._id,text:course.name}:'');
            });
        });
    }
    
    update = (student,giayTo,active)=>{
        let giayToDangKy = student.giayToDangKy?student.giayToDangKy.map(item=>item._id):[];
        if(active){
            giayToDangKy=[...giayToDangKy,giayTo];
        }else{
            giayToDangKy=giayToDangKy.filter(item=>item!=giayTo);
        }
        console.log({giayToDangKy});
        this.props.updateProfileStudent(student._id,{giayToDangKy},()=>{
            this.onSearch({});
        });
    };

    onChangeCourseType = (courseType) => {
        if(!this.state.courseType || this.state.courseType._id!=courseType.id){
            this.onSearch({_courseId:null});
        } 
    }

    onChangeCourse = (courseId) => {
        if(!this.state.course || this.state.course._id!=courseId.id){
            this.onSearch({});
        } 
    }

    renderGiayToDangKyHeader = (profile)=>{
        const {type} = profile;
        return (
            <TableHeadCell key={profile._id} name={`giayToDangKy:${type._id}`} content={`${type.title}`} style={{width:'auto'}} nowrap='true' filter='select' filterData = {filterCondition}/>
        );
    }

    renderGiayToDangKyBody = (profile,student,permission)=>{
        const {type} = profile;
        return (
            <TableCell key={profile._id} type='checkbox' isSwitch={false} content={student.giayToDangKy && student.giayToDangKy.length && student.giayToDangKy.find(item=>item._id==type._id)!=undefined} permission={permission} onChanged={active => this.update(student,type._id,active)}/>
        );
    }

    checkNopDuGiayTo = (profiles,student)=>{
        if(!profiles||!profiles.length) return false;
        if(!student || !student.giayToDangKy || !student.giayToDangKy.length) return false;
        const giayToDangKy = student.giayToDangKy;
        for(const profile of profiles){
            if(profile.required && giayToDangKy.find(giayTo=>profile.type && giayTo._id==profile.type._id)==undefined){
                return false;
            }
        }
        return true;
    }
    render() {
        const permission = this.getUserPermission('profileStudent');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.profileStudent && this.props.profileStudent.page ?
            this.props.profileStudent.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const {profileType} = this.state.course;
        const profiles = profileType && profileType.profiles ? profileType.profiles :null;
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,autoDisplay:true,
        renderHead: () => (
            <TableHead getPage = {this.props.getProfileStudentPage}>
                <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                <TableHeadCell name='fullName' content='Học viên' style={{width:'100%'}} filter='search' />
                <TableHeadCell name='identityCard' content='CMND/CCCD' style={{width:'auto'}} nowrap='true' filter='search' />
                <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Thông tin liên lạc</TableHeadCell>
                {profiles && profiles.length ? profiles.map(profile=>this.renderGiayToDangKyHeader(profile)):null}
                
                <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Hoàn tất</TableHeadCell>
            </TableHead>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize +index + 1} />
                    <TableCell type='text' content={<>{item.lastname} {item.firstname}</>} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.user ? <>{item.user.email} <br/> {item.user.phoneNumber}</> : ''} />
                    {profiles && profiles.length ? profiles.map(profile=>this.renderGiayToDangKyBody(profile,item,permission)):null}
                    <TableCell type='checkbox' content={this.checkNopDuGiayTo(profiles,item)} />
                
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Theo dõi hồ sơ học viên',
            breadcrumb: ['Theo dõi hồ sơ học viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                    {/* <div className='row' style={{marginBottom:'10px'}}>
                        <div className='col-auto'>
                            <label className='col-form-label'>Loại khóa học: </label>
                        </div>
                        <FormSelect ref={e => this.courseType = e} data={this.state.courseTypes} placeholder='Loại khóa học'
                            onChange={data => this.onSearch(data.id)} style={{ margin: 0, width: '200px' }} />
                    </div> */}
                    <div className='row mb-2'>
                        <div className='col-auto'>
                            <label className='col-form-label'>Loại khóa học: </label>
                        </div>
                        <FormSelect ref={e => this.courseType = e} data={ajaxSelectCourseType} placeholder='Loại khóa học'
                            onChange={data => this.onChangeCourseType(data)} style={{ margin: 0, width: '200px' }} />
                        <div className='col-auto'>
                            <label className='col-form-label'>Khóa học: </label>
                        </div>
                        <FormSelect ref={e => this.course = e} data={ajaxSelectOfficialCourseByCourseType(this.state.courseType._id)} placeholder='Khóa học'
                            onChange={data =>this.onChangeCourse(data)} style={{ margin: 0, width: '200px' }} />
                        <div className="col-12">
                            {profileType && <p className='mb-0 mt-2'><b>Hồ sơ đăng ký: </b>{profileType.title}</p>}
                        </div>
                    </div>
                        {table}
                    </div>
                    <Pagination name='pageProfileStudent' getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}  />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, profileStudent: state.trainning.profileStudent });
const mapActionsToProps = { getProfileStudentPage,updateProfileStudent,getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(ProfileStudentPage);