import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from '../redux';
import { getRatePage, getRateByCourse } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';
import StarRatings from 'react-star-ratings';

class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/rate-teacher').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    // this.getCourseRate(course._id);
                    this.props.getRateByCourse(course._id);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            // this.getCourseRate(params._id);
                            this.props.getRateByCourse(params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    // getCourseRate = (_courseId) => {
    //     const condition = { type: 'teacher', _courseId };
    //     this.props.getRatePage(1, 50, condition, data => {
    //         if (data.error) {
    //             T.notify('Lấy đánh giá bị lỗi!', 'danger');
    //             this.props.history.push('/user/course/' + _courseId);
    //         }
    //     });
    // }

    star = (score, count) => {
        return (
            score ?
            <div className='d-flex align-items-center justify-content-center'>
                <span className='text-primary' style={{ fontSize:'40px', paddingRight: '15px', color:'#ffca08'}}>{Number(score/count).toFixed(1)+'   '}</span>
                <div>
                    <StarRatings
                        rating={score/count}
                        starRatedColor={(score/count) >=4  ? '#28a745' : ((score/count) < 3 ? '#dc3545' : '#ffca08')}
                        numberOfStars={5}
                        name='rating'
                        starDimension='20px'
                    />
                    <p><i className='fa fa-user-o' aria-hidden='true'></i>{'  ' + count}</p>
                </div>
                 
            </div>  : ''
        );
    }

    render() {
        // const permission = this.getUserPermission('course');
        const course = this.props.course && this.props.course.item ? this.props.course.item : { admins: [] };
        let listRate  = this.props.rate && this.props.rate.list ?
            this.props.rate.list : [];
        const list = {};
        const count = {};
        const listTeacher = [];
        if(course.teacherGroups && course.teacherGroups.length){
            for(let i = 0; i < course.teacherGroups.length; i++){
                listTeacher.push(course.teacherGroups[i].teacher);
                listRate.forEach(rate => {
                    if(rate._refId == (course.teacherGroups[i].teacher && course.teacherGroups[i].teacher._id)){
                        list[rate._refId] = list[rate._refId] ?  (list[rate._refId] + rate.value) : (rate.value);
                        count[rate._refId] = count[rate._refId] ? (count[rate._refId] + 1) : 1;
                    }
                });
            }
        }
        const table = renderTable({
            getDataSource: () => listTeacher, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto' }}>#</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Giáo viên</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh giáo viên</th>
                    <th style={{ width: '60%', textAlign: 'center' }} nowrap='true'>Điểm đánh giá</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={`${item.lastname} ${item.firstname}`} url={`/user/course/${course._id}/rate-teacher/${item._id}`} />
                    <TableCell type='image' height='50px' content={item.image ? item.image : '/img/avatar-default.png'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.star(list[item._id], count[item._id])} />
                </tr>),
        });

        const backRoute = `/user/course/${course._id}`;
        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>{course.name}</Link> : '', 'Đánh giá Giáo viên'],
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
