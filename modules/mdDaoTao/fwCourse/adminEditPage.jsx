import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

const backRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (!course) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push(backRoute);
                        }
                    });
                }
            } else {
                this.props.history.push(backRoute);
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = currentUser,
            item = this.props.course && this.props.course.item ? this.props.course.item : {};

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, item.name],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${item._id}/info`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${item._id}/subject`} icon='fa-briefcase' iconBackgroundColor='#1488db' text='Môn học' />
                    {/* <PageIcon to={`/user/course/${item._id}/forum`} icon='fa-address-book' iconBackgroundColor='#8d6e63' text='Forum' /> */}

                    {isCourseAdmin ? <PageIconHeader text='Nhân sự' /> : null}
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/manager`} icon='fa-user-secret' iconBackgroundColor='#D00' text='Gán Quản trị viên khóa học' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/student`} icon='fa-users' iconBackgroundColor='#8A0' text='Gán Học viên' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${item._id}/teacher`} icon='fa-user-circle' iconBackgroundColor='#CC0' text='Gán Cố vấn học tập' />
                    <PageIcon visible={isCourseAdmin && currentUser && currentUser.division && !currentUser.division.isOutside} to={`/user/course/${item._id}/representer`} icon='fa-user-circle-o' iconBackgroundColor='#CAC' text='Gán Giáo viên' />

                    {isCourseAdmin || !isLecturer ? <PageIconHeader text='Học viên' /> : null}
                    <PageIcon visible={isCourseAdmin || !isLecturer} to={`/user/course/${item._id}/rate-teacher`} icon='fa-star' iconBackgroundColor='orange' text='Đánh giá cố vấn học tập' />

                    <PageIconHeader text='Đào tạo' />
                    {/* <PageIcon visible={isLecturer} to={`/user/course/${item._id}/your-students`} icon='fa-graduation-cap' iconBackgroundColor='#18ffff' text='Học viên của bạn' /> */}
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${item._id}/learning`} icon='fa-line-chart' iconBackgroundColor='#69f0ae' text='Tiến độ học tập' />
                    {/* <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${item._id}/rate-subject`} icon='fa-folder-open' iconBackgroundColor='#900' text='Đánh giá bài học' /> */}

                    <PageIconHeader text='Chat' />
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
