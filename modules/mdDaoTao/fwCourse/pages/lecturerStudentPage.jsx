import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/your-students').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const teacherGroup = item && item.teacherGroups ? item.teacherGroups.find(group => group.teacher && group.teacher._id == currentUser._id) : null;
        console.log(teacherGroup);

        const table = renderTable({
            getDataSource: () => teacherGroup ? teacherGroup.student : [], stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.user ? item.user.phoneNumber : ''} />
                </tr>),
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Học viên của bạn: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Học viên của bạn'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);