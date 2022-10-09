import React from 'react';
import { connect } from 'react-redux';
import { getCommentWaitingPage } from 'modules/_default/fwComment/redux';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import T from 'view/js/common';

class AdminCommentPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/comment').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getCommentWaitingPage({ courseId: course._id, filter: 'all' }, undefined, undefined);
                    this.setState({ courseId: course._id });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getCommentWaitingPage({ courseId: params._id, filter: 'all' }, undefined, undefined);

                            this.setState({ courseId: params._id });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getPage = (pageNumber, pageSize, data) => {
        const filter = data ? data : this.state.filter;
        this.setState({ filter });
        this.props.getCommentWaitingPage({ courseId: this.state.courseId, filter: filter }, pageNumber, pageSize);
    }

    render() {
        const user = this.props.system.user;
        const item = this.props.comment && this.props.comment.page && this.props.comment.page.list ? this.props.comment.page.list : [];
        item.sort((a, b) => (new Date(a.createdDate) - new Date(b.createdDate)));
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.comment && this.props.comment.page ?
            this.props.comment.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const dataSelect = this.props.comment && this.props.comment.page && this.props.comment.page.listLesson ? this.props.comment.page.listLesson : [];
        const course = this.props.course && this.props.course.item ? this.props.course.item : {};
        const table = renderTable({
            getDataSource: () => item, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Nội dung bình luận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Người bình luận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Bài học</th>
                    <th style={{ width: 'auto%' }} nowrap='true'>Ngày bình luận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.content} url={`/user/course/${course._id}/comment/${item._id}`} />
                    <TableCell type='text' content={item.author ? (item.author.lastname + ' ' + item.author.firstname) : ''} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.lessonName} />
                    <TableCell type='text' content={item.createdDate ? T.dateToText(item.createdDate, 'dd/mm/yyyy') : ''} />
                    <TableCell type='buttons' content={item} permission={{ write: true }} onEdit={`/user/course/${course._id}/comment/${item._id}`} />
                </tr>),
        });

        const backRoute = `/user/course/${course._id}`;
        return this.renderPage({
            icon: 'fa fa-comment-o',
            title: user.isCourseAdmin ? 'Bình luận chờ duyệt: ' : 'Bình luận của học viên: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>{course.name}</Link> : '', user.isCourseAdmin ? 'Bình luận chờ duyệt' : 'Bình luận của học viên'],
            content: (
                <div className='tile'>
                    <FormSelect ref={e => this.filter = e} data={dataSelect} onChange={data => this.getPage(undefined, undefined, data.id)} style={{ marginBottom: '10px', width: '300px' }} />
                    <div className='tile-body'>{table}</div>
                    <Pagination name='adminCommentPage' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} style={{ marginLeft: 45 }} />
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, comment: state.framework.comment, course: state.trainning.course });
const mapActionsToProps = { getCommentWaitingPage, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminCommentPage);
