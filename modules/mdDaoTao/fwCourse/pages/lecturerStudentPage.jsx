import React from 'react';
import { connect } from 'react-redux';
import { getCourse, getLearningProgressPage } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/your-students').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id, filter: 'all' });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getLearningProgressPage(undefined, undefined, { courseId: params._id, filter: 'all' });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    checkMonLyThuyet = (student, subject) => {
        const tienDoThiHetMon = student && student.tienDoThiHetMon;
        const result = tienDoThiHetMon && tienDoThiHetMon[subject._id] && tienDoThiHetMon[subject._id].score && parseInt(tienDoThiHetMon[subject._id].score) >= 5;
        return result;
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {},
            students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
            subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [];
        const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false);
        const subjectColumns = [];
        (monLyThuyet || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', whiteSpace: 'pre', textAlign: 'center' }}  >{subject.title}</th>);
        });
        // const teacherGroup = item && item.teacherGroups ? item.teacherGroups.find(group => group.teacher && group.teacher._id == currentUser._id) : null;
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    {subjectColumns}
                    <th style={{ width: 'auto' }} nowrap='true'>Thực hành</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thi tốt nghiệp</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thi sát hạch</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.user ? item.user.phoneNumber : ''} />
                    {monLyThuyet && monLyThuyet.length && monLyThuyet.map((subject, i) => (<TableCell key={i} type='text' style={{ textAlign: 'center' }} content={this.checkMonLyThuyet(item, subject) ? 'Đạt' : 'X'} />))}
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(item.diemThucHanh && item.diemThucHanh >= 5) ? 'Đạt' : 'X'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.totNghiep ? 'Đạt' : 'X'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.datSatHach ? 'Đạt' : 'X'} />
                </tr>),
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-users',
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
const mapActionsToProps = { getCourse, getLearningProgressPage };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);