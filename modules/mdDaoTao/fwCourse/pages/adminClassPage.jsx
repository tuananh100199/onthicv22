import React from 'react';
import { connect } from 'react-redux';
import { getCourse, getLearningProgressPage } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormTabs } from 'view/component/AdminPage';

class AdminClassPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/class').parse(window.location.pathname);
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
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const tabs = [];
        item && item.teacherGroups && item.teacherGroups.forEach((group,index) => tabs.push(
            { title: item.name + ' - ' + (index + 1), component: 
            <>
                <p>Giáo viên: {group.teacher ? group.teacher.lastname + ' ' + group.teacher.firstname : ''}</p>
                {
                    renderTable({
                        getDataSource: () => group.student ? group.student : [], stickyHead: true,
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
                    })
                }
            </> 
            },
        ));

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-table',
            title: 'Phân lớp: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Phân lớp'],
            content: item && item.teacherGroups && item.teacherGroups.length ?  <FormTabs id='classPageTab' contentClassName='tile' tabs={tabs} /> : <div className='tile'>Chưa có dữ liệu lớp học</div>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminClassPage);