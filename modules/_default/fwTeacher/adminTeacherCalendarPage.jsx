import React from 'react';
import { connect } from 'react-redux';
import { getTeacherPage,createTeacher,updateTeacher,deleteTeacher } from './redux';
import { AdminPage, TableCell, renderTable, TableHead,TableHeadCell } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getDivisionAll } from 'modules/mdDaoTao/fwDivision/redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import {getCourseAll} from 'modules/mdDaoTao/fwCourse/redux';
import { Link } from 'react-router-dom';
class AdminTeacherPage extends AdminPage {
    state = { course:'' };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox();
            this.props.getTeacherPage(1,null,{},{},{});

            this.props.getCourseAll({isDefault:false},list=>{
                let courses = [{id:'null',text:'Chưa có'}];
                list.forEach(course=>courses.push({id:course._id,text:course.name}));
                this.setState({courses});
            });

            // this.itemCourse.value({id:'all',text:'Tất cả khóa học'});
            // this.props.
            T.onSearch = (searchText) =>{
                this.props.getTeacherPage(1,undefined,{searchText},()=>{
                    this.setState({searchText});
                });
            }; 
        });
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        let condition = { searchText };
        // if(course && course!='all') condition.course=course;
        this.props.getTeacherPage(pageNumber,pageSize,condition,page=>{
            done && done(page);
            this.setState({searchText});
        });
    }

    handleChangeFilter = filterCondition=>{
        this.onSearch({filterCondition},()=>{
            this.setState({filterCondition});
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa thông tin giáo viên', 'Bạn có chắc bạn muốn xóa thông tin giáo viên này?', true, isConfirm =>
        isConfirm && this.props.deleteTeacher(item._id));
    
    renderListCourse = courses=>(<>
        {courses.map((course,index)=>
        <Link key={index} to={`/user/course/${course._id}`} className='mb-1' style={{ textDecoration: 'none',display:'block' }}>{course.name}</Link>
        // <p style={{marginBottom:0}} key={index}>{course.name}</p>
        )}
    </>)
    render() {
        const permission = this.getUserPermission('teacher');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.teacher && this.props.teacher.page ?
        this.props.teacher.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const table = renderTable({
            getDataSource: () => list,
            stickyHead:true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getTeacherPage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell name='maGiaoVien' sort={true} style={{ display:'inline-block',width: 170, textAlign: 'center' }} content='Mã giáo viên' nowrap='true'  filter='search'/> 
                    <TableHeadCell sort={true} style={{ width: '100%' }} content='Họ tên' nowrap='true' name='firstname' filter='search'/>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở đào tạo</TableHeadCell>

                    <TableHeadCell name='courses' style={{ width: 'auto', textAlign: 'center' }} menuStyle={{width:200}} filter='select' filterData = {this.state.courses}>Khóa học đang dạy</TableHeadCell>

                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số buổi dạy</TableHeadCell>
                    {/* <TableHeadCell name='courseTypes' filter='select' filterData = {ajaxSelectCourseType} style={{ width: 'auto', textAlign: 'center' }} nowrap='true' content='Loại khóa học' />  */}
                    {/* <TableHeadCell name='doneCourses' style={{ width: 'auto', textAlign: 'center' }} menuStyle={{width:200}} filter='select' filterData = {this.state.courses}>Khóa học đã dạy</TableHeadCell> */}
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) =>{
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                        <TableCell  content={item.maGiaoVien} />
                        <TableCell type='link' content={<>{`${item.lastname} ${item.firstname}`} <br /> {item.identityCard}</>} url={'/user/teacher-calendar/' + item._id} />
                        <TableCell  style={{whiteSpace:'nowrap'}} content={item.division? item.division.title:''} />

                        <TableCell  content={item.courses && item.courses.length ? this.renderListCourse(item.courses):'chưa có'} />

                        <TableCell  content={item.numOfCalendar} type='number'/>
                        {/* <TableCell  content={item.courseTypes && item.courseTypes.length ? item.courseTypes.reduce((result,item)=> result+(result!=''?(', '+item.title):item.title),''):'chưa có'} /> */}
                        {/* <TableCell  content={item.doneCourses && item.doneCourses.length ? this.renderListCourse(item.doneCourses):'Chưa có'} /> */}
                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/teacher-calendar/' + item._id}>
                        </TableCell>
                    </tr>);
            } ,
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Thời khóa biểu giáo viên',
            breadcrumb: ['Giáo viên'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <Pagination name='pageTeacher' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherPage} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacher: state.enrollment.teacher });
const mapActionsToProps = { getTeacherPage,createTeacher,updateTeacher,deleteTeacher,getDivisionAll,getCategoryAll,getCourseAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherPage);