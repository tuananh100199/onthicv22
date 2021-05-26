import React from 'react';
import { connect } from 'react-redux';
import { getLecturerCoursePage } from '../../fwCourse/redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CoursePageFilter extends AdminPage {
    state = { courseType: null };
    componentDidMount() {
        T.ready(() => {
            const courseType = this.props.courseType;
            this.props.getLecturerCoursePage(courseType, undefined, undefined, {});
            this.setState({ courseType });
        });

    }

    render() {
        const { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.course && this.props.course[this.state.courseType] ?
            this.props.course[this.state.courseType] : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, pageCondition: '', list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khai giảng</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Quản trị viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cố vấn học tập</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Học viên</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.name} url={'/user/lecturer/' + item._id} />
                    <TableCell type='date' content={item.thoiGianKhaiGiang} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.admins ? item.admins.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.reduce((a, b) => (b.student ? b.student.length : 0) + a, 0) : 0} />
                </tr>),
        });

        return (
            <div className='tile-body'>
                {table}
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition}
                    getPage={(pageNumber, pageSize) => this.props.getCoursePage(this.state.courseType, pageNumber, pageSize, {})} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLecturerCoursePage };
export default connect(mapStateToProps, mapActionsToProps)(CoursePageFilter);
