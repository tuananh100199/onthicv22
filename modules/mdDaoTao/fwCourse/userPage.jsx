import React from 'react';
import { connect } from 'react-redux';
import { getStudentCourse } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';

class UserCoursePage extends AdminPage {
    componentDidMount() {
        this.props.getStudentCourse();
        T.ready();
    }

    render() {
        // const permission = this.getUserPermission('course');
        const list = this.props.course && this.props.course.item ? this.props.course.item : [];
        // const table = renderTable({
        //     getDataSource: () => list, stickyHead: true,
        //     renderHead: () => (
        //         <tr>
        //             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
        //             <th style={{ width: '100%' }}>Tên khóa học</th>
        //             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khai giảng</th>
        //             <th style={{ width: 'auto' }} nowrap='true'>Quản trị viên</th>
        //             <th style={{ width: 'auto' }} nowrap='true'>Cố vấn học tập</th>
        //             <th style={{ width: 'auto' }} nowrap='true'>Học viên</th>
        //         </tr>),
        //     renderRow: (item, index) => (
        //         <tr key={index}>
        //             <TableCell type='number' content={index + 1} />
        //             <TableCell type='link' content={item.name} url={'/user/hoc-vien/khoa-hoc/' + item._id} />
        //             <TableCell type='date' content={item.thoiGianKhaiGiang} style={{ whiteSpace: 'nowrap' }} />
        //             <TableCell type='number' content={item.admins ? item.admins.length : 0} />
        //             <TableCell type='number' content={item.groups ? item.groups.length : 0} />
        //             <TableCell type='number' content={item.groups ? item.groups.reduce((a, b) => (a.student ? a.student.length : 0) + (b.student ? b.student.length : 0), 0) : 0} />
        //         </tr>),
        // });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row'>
                    {list && list.map((course, index) => (
                        <div key={index} className='col-md-12 col-lg-6'>
                            <Link to={'/user/hoc-vien/khoa-hoc/' + course._id}>
                                <div className='widget-small coloured-icon info'>
                                    <i className='icon fa fa-3x fa fa-cubes' />
                                    <div className='info'>
                                        <h4>Khóa học hạng {course && course.courseType ? course.courseType.title : ''}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))
                    }
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getStudentCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePage);
