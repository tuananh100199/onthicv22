import React from 'react';
import { connect } from 'react-redux';
import { getCommentWaitingPage } from 'modules/_default/fwComment/redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell } from 'view/component/AdminPage';

class LecturerStudentPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/comment').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getCommentWaitingPage({ refParentId: course._id, state: 'waiting' }, undefined, undefined);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getCommentWaitingPage({ refParentId: params._id, state: 'waiting' }, undefined, undefined);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const item = this.props.comment && this.props.comment.page && this.props.comment.page.list ? this.props.comment.page.list  : [];
        const course = this.props.course && this.props.course.item ? this.props.course.item : {};
        // const teacherGroup = item && item.teacherGroups ? item.teacherGroups.find(group => group.teacher && group.teacher._id == currentUser._id) : null;
        const table = renderTable({
            getDataSource: () => item , stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Nội dung bình luận</th>
                    <th style={{ width: '100%' }} nowrap='true'>Người bình luận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.content} url={`/user/course/${course._id}/comment/${item._id}`} />
                    <TableCell type='text' content={item.author ? (item.author.lastname + ' ' + item.author.firstname) : ''} />
                    <TableCell type='buttons' content={item} permission={{ write: true }} onEdit={`/user/course/${course._id}/comment/${item._id}`} />
                </tr>),
        });

        const backRoute = `/user/course/${course._id}`;
        return this.renderPage({
            icon: 'fa fa-comment-o',
            title: 'Bình luận chờ duyệt: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>{course.name}</Link> : '', 'Bình luận chờ duyệt'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, comment: state.framework.comment, course: state.trainning.course });
const mapActionsToProps = { getCommentWaitingPage, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(LecturerStudentPage);