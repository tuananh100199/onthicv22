import React from 'react';
import { connect } from 'react-redux';
import { getCoursePage, updateCourse, deleteCourse } from '../redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class CoursePageFilter extends AdminPage {
    componentDidMount() {
        T.ready();
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Khóa học', 'Bạn có chắc bạn muốn xóa khóa học này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteCourse(item._id, this.props.courseType));

    render() {
        const permission = this.getUserPermission('course');
        const list = this.props.courseFilter;
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
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.name} url={'/user/course/' + item._id} />
                    <TableCell type='date' content={item.thoiGianKhaiGiang} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.admins ? item.admins.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.reduce((a, b) => (b.student ? b.student.length : 0) + a, 0) : 0} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCourse(item._id, { active }, () => {
                        T.notify('Cập nhật thông tin khóa học thành công!');
                    })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return (
            <div className='tile-body'>
                {table}
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCoursePage, updateCourse, deleteCourse };
export default connect(mapStateToProps, mapActionsToProps)(CoursePageFilter);
