import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getRatePage, getRateByCourse } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/rate-teacher/:_id').parse(window.location.pathname);
            if (params && params._courseId && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({teacherId: params._id});
                if (course) {
                    this.props.getRateByCourse(course._id);
                } else {
                    this.props.getCourse(params._courseId, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._courseId);
                        } else {
                            this.props.getRateByCourse(params._courseId);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        // const permission = this.getUserPermission('course');
        const item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        let listRate  = this.props.rate && this.props.rate.list ?
            this.props.rate.list : [];
        const list = [], teacherId = this.state.teacherId;
        let name = '';
        if(item.teacherGroups && item.teacherGroups.length){
            const index = item.teacherGroups.findIndex(group => group.teacher._id == teacherId);
            if(index != -1){
                name = item.teacherGroups[index].teacher ? (item.teacherGroups[index].teacher.lastname + item.teacherGroups[index].teacher.firstname) : '';
                listRate.forEach(rate => {
                    if(rate._refId == (item.teacherGroups[index].teacher && item.teacherGroups[index].teacher._id))
                        list.push(rate);
                });
            }
        }
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số sao</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nội dung đánh giá</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user ? item.user.lastname : ''} ${item.user ? item.user.firstname : ''}`}/>
                    <TableCell type='text' content={item.value} />
                    <TableCell type='text' content={item.note} />
                </tr>),
        });

        const backRoute = `/user/course/${item._id}/rate-teacher`;
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên: ' + name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={`/user/course/${item._id}`}>{item.name}</Link> : '',item._id ? <Link key={0} to={backRoute}>{'Đánh giá Giáo viên'}</Link> : '', name],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, rate: state.framework.rate });
const mapActionsToProps = { getCourse, getRatePage, getRateByCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
