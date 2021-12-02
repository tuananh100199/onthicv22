import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getRatePage } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/rate-teacher').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.getCourseRate(course._id);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.getCourseRate(params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getCourseRate = (_courseId) => {
        const condition = { type: 'teacher', _courseId };
        this.props.getRatePage(1, 50, condition, data => {
            if (data.error) {
                T.notify('Lấy đánh giá bị lỗi!', 'danger');
                this.props.history.push('/user/course/' + _courseId);
            }
        });
    }

    render() {
        // const permission = this.getUserPermission('course');
        const item = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.rate && this.props.rate.page ?
            this.props.rate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Học viên đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Giáo viên được đánh giá</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số sao</th>
                    <th style={{ width: '100%' }}>Nội dung đánh giá</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user && item.user.lastname} ${item.user && item.user.firstname}`} />
                    <TableCell type='text' content={`${item._refId && item._refId.lastname} ${item._refId && item._refId.firstname}`} />
                    <TableCell type='number' content={item.value} />
                    <TableCell type='text' content={item.note || ''} />
                </tr>),
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Đánh giá Giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getRatePage} />
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, rate: state.framework.rate });
const mapActionsToProps = { getCourse, getRatePage };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
