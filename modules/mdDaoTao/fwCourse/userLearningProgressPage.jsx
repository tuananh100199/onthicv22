import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/tien-do-hoc-tap'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    this.setState({ data });
                });
            });
        } else {
            this.props.history.goBack();
        }
    }

    checkMonLyThuyet = (student, subject) => {
        const tienDoThiHetMon = student && student.tienDoThiHetMon;
        const result = tienDoThiHetMon && tienDoThiHetMon[subject._id] && tienDoThiHetMon[subject._id].score && parseInt(tienDoThiHetMon[subject._id].score) >= 5;
        return result;
    }

    render() {
        const course = this.props.course;
        const subjects = course && course.item && course.item.subjects;
        const student = course && course.student;
        const monLyThuyet = subjects ? subjects.filter(subject => subject.monThucHanh == false) : [];
        const subjectColumns = [];
        (monLyThuyet || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', whiteSpace: 'pre', textAlign: 'center' }}  >{subject.title}</th>);
        });
        const list = student ? [student] : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
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

        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Tiến độ học tập: ',
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Tiến độ học tập'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);