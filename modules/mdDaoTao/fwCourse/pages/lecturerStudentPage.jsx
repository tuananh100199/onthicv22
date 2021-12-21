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

    checkMonLyThuyet = (student, subjects) => {
        const tienDoThiHetMon = student && student.tienDoThiHetMon;
        const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false);
        const listIdThiHetMon = tienDoThiHetMon ? Object.keys(tienDoThiHetMon) : [];
        let lyThuyet = true;
        if (listIdThiHetMon.length) {
            for (let i = 0; i < monLyThuyet.length; i++) {
                const index = listIdThiHetMon.findIndex(monThi => monThi == monLyThuyet[i]._id);
                if( index == -1){
                    lyThuyet = false;
                    break;
                } else{
                    if(!(tienDoThiHetMon[listIdThiHetMon[index]].score && (parseInt(tienDoThiHetMon[listIdThiHetMon[index]].score) >= 5))){
                        lyThuyet = false;
                        break;
                    }
                }
            }
        } else {
            lyThuyet = false;
        }
        return lyThuyet;
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {},
        students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
        subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [];
        // const teacherGroup = item && item.teacherGroups ? item.teacherGroups.find(group => group.teacher && group.teacher._id == currentUser._id) : null;
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Lý thuyết</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thực hành</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thi tốt nghiệp</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    <TableCell type='text' content={item.user ? item.user.phoneNumber : ''} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.checkMonLyThuyet(item,subjects) ? 'Đạt' : 'X'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={(item.diemThucHanh && item.diemThucHanh >=5) ? 'Đạt' : 'X'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.totNghiep ? 'Đạt' : 'X'} />
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