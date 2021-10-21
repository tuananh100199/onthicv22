import React from 'react';
import { connect } from 'react-redux';
import { getStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import { getStudentByAdmin, getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class CourseAdminView extends AdminPage {
    state = {};
    componentDidMount() {
    T.ready('/user/course', () => {
        const route = T.routeMatcher('/user/course/:courseId/calendar'),
        courseId = route.parse(window.location.pathname).courseId;
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user;
        const course = this.props.course ? this.props.course.item : null;
        if (!course) {
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/' + courseId);
                }
            });
        }
        if (courseId) {
            this.setState({ courseId, isLecturer, isCourseAdmin });
            if (isCourseAdmin){
                this.props.getStudentPage(undefined, undefined, { course: courseId });
            } else if (isLecturer) {
                this.props.getStudentByAdmin(courseId, data => {
                    this.setState({ listStudent: data.item });
                });
            }
        } else {
            this.props.history.push(`/user/course/${this.state.courseId}`);
        }  
    });
    }
    
    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        console.log('courseItem', courseItem);
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
        this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const backRoute = `/user/course/${courseItem._id}`;
        const table = renderTable({
        getDataSource: () => (this.state.listStudent || list).filter(item => item.course != null),
        renderHead: () => (
            <tr>
                <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                <th style={{ width: '50%' }}>Họ và Tên</th>
                <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                <th style={{ width: 'auto' }} nowrap='true'>Thông tin liên hệ</th>
                <th style={{ width: '50%' }} nowrap='true'>Cơ sở đào tạo</th>
                <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
            </tr>),
        renderRow: (item, index) => (
            <tr key={index}>
                <TableCell type='text' content={index + 1}/>
                <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                <TableCell type='text' content={item.identityCard} />
                <TableCell type='text' content={item.user && item.user.email} />
                <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.division ? item.division.title : ''} />
                <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + this.state.courseId + '/calendar/student/' + item._id} />
            </tr >),
        });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Thời khóa biểu: ' + courseItem.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, courseItem._id ? <Link key={0} to={backRoute}>{courseItem.name}</Link> : '', 'Danh sách học viên'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination name='adminStudent' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getStudentPage} />
                </div>
                </>,
            backRoute : '/user/course/' + courseItem._id,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course: state.trainning.course });
const mapActionsToProps = { getStudentPage, getStudentByAdmin, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(CourseAdminView);

