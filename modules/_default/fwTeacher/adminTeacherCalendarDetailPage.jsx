import React from 'react';
import { connect } from 'react-redux';
import { getTeacher, updateTeacher } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage,renderTable,TableCell,TableHead,TableHeadCell  } from 'view/component/AdminPage';
import {getTimeTablePage} from 'modules/mdDaoTao/fwTimeTable/redux';
import Pagination from 'view/component/Pagination';
import { ajaxSelectStudent } from 'modules/mdDaoTao/fwStudent/redux';
class StaffEditPage extends AdminPage {
    state = {course:null};
    componentDidMount() {
        T.ready('/user/teacher-calendar', () => {
            const route = T.routeMatcher('/user/teacher-calendar/:_id'), params = route.parse(window.location.pathname);
            if(params && params._id){
                this.props.getTeacher(params._id, item => {
                    if (item) {
                        const lecturer = item && item.user ?item.user._id:null;
                        const course = [...item.courses,...item.doneCourses].map(item=>({id:item._id,text:item.name}));
                        this.props.getTimeTablePage(1,null,{lecturer,state:'approved'},{},{});
                        this.setState({item,_id:params._id,lecturer,course});
                    } else {
                        this.props.history.push('/user/teacher-calendar');
                    }
                });
            }else{
                this.props.history.push('/user/teacher-calendar');   
            }
        });
    }

    save = () => {
        const data = {
            dayLyThuyet:this.itemDayLyThuyet.value()?1:0,
            courseTypes:this.itemCourseTypes.value().length?this.itemCourseTypes.value():' ',
        };
        this.props.updateTeacher(this.state._id, data);
    }

    handleChange = value=>this.itemDayLyThuyet.value(value)||this.itemDayThucHanh.value(!value);
    renderType = type=>{
        return type=='add'?<span className='text font-weight-bold text-primary'>Gán khóa</span>
        :<span className='text font-weight-bold text-danger'>Hủy khóa</span>;
    }
    render() {
        const item = this.state.item ? this.state.item:null;
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
        this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            autoDisplay:true,stickyHead:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getTimeTablePage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell name='student' filter='select' filterData={ajaxSelectStudent} style={{ width: '70%',minWidth:200 }} menuStyle={{width:200}} nowrap='true'>Học viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</TableHeadCell>
                    <TableHeadCell name='date' sort={true} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</TableHeadCell>
                    <TableHeadCell style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Xe học</TableHeadCell>
                    {/* <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell> */}
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='text' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student ? item.student.identityCard : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span></>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.car?item.car.licensePlates:''} />
                    {/* <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} /> */}
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-user',
            title: 'Thời khóa biểu giáo viên: ' + (item ? `${item.lastname} ${item.firstname}`:''),
            breadcrumb: [<Link key={0} to='/user/teacher-calendar'>Thời khóa biểu giáo viên</Link>, 'Chỉnh sửa'],
            content: <>

                <div className='tile'>
                    <div className="tile-body">
                        {table}
                    </div>
                    <Pagination name='pageTeacher' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherPage} />
                </div>
            </>,
            backRoute: '/user/teacher-calendar',
        });
    }
}

const mapStateToProps = state => ({ system: state.system,timeTable: state.trainning.timeTable });
const mapActionsToProps = { updateTeacher, getTeacher,getTimeTablePage };
export default connect(mapStateToProps, mapActionsToProps)(StaffEditPage);