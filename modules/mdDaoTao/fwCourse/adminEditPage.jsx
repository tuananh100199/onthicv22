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
                this.props.getCourse(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(backRoute);
                    }
                });
            } else {
                this.props.history.push(backRoute);
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = currentUser,
            item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const permission = this.getUserPermission('course', ['read', 'write', 'delete', 'lock']),
        permissionFeedback = this.getUserPermission('feedback'),
        permissionTimeTable = this.getUserPermission('timeTable');
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + item.name,
            breadcrumb: [<Link key={0} to={backRoute}>Khóa học</Link>, item.name],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />
                    <PageIcon visible={isLecturer || isCourseAdmin || permission.write} to={`/user/course/${item._id}/info`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    <PageIcon visible={permission.delete} to={`/user/course/${item._id}/subject`} icon='fa-briefcase' iconBackgroundColor='#1488db' text='Môn học' />
                    <PageIcon visible={permission.delete} to={`/user/course/${item._id}/graduation-subject`} icon='fa-clone' iconBackgroundColor='#F0E68C' text='Môn thi tốt nghiệp' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin)} to={`/user/course/${item._id}/final-exam-setting`} icon='fa-sliders' iconBackgroundColor='#dc143c' text='Thiết lập thi hết môn' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin)} to={`/user/course/${item._id}/study-program`} icon='fa-tasks' iconBackgroundColor='#4B0082' text='Chương trình học' />
                    {item.chatActive && (isLecturer || isCourseAdmin || permission.write) && <PageIcon to={`/user/chat/${item._id}`} icon='fa-comments-o' iconBackgroundColor='#9ccc65' text='Chat' />}

                    {!item.isDefault && (isCourseAdmin || permission.write) ? <PageIconHeader text='Nhân sự' /> : null}
                    <PageIcon visible={!item.isDefault && permission.lock} to={`/user/course/${item._id}/manager`} icon='fa-user-secret' iconBackgroundColor='#D00' text='Gán Quản trị viên khóa học' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin || permission.write)} to={`/user/course/${item._id}/student`} icon='fa-user-plus' iconBackgroundColor='#8A0' text='Gán Học viên' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin || permission.write)} to={`/user/course/${item._id}/teacher`} icon='fa-user-circle' iconBackgroundColor='#CC0' text='Gán Giáo viên' />

                    {(isCourseAdmin || permission.write) ? <PageIconHeader text='Học viên' /> : null}
                    <PageIcon visible={!item.isDefault && (isCourseAdmin || permission.write)} to={`/user/course/${item._id}/rate-teacher`} icon='fa-star' iconBackgroundColor='orange' text='Đánh giá Giáo viên' />
                    <PageIcon visible={isCourseAdmin || permission.write || permissionFeedback.read} to={`/user/course/${item._id}/feedback`} icon='fa-heartbeat' iconBackgroundColor='teal' text='Phản hồi' />
                    <PageIcon to={`/user/course/${item._id}/forum`} icon='fa-users' iconBackgroundColor='#9ced65' text='Forum' />
                    <PageIcon visible={!item.isDefault && (isLecturer || isCourseAdmin)} to={`/user/course/${item._id}/comment`} icon='fa-comment-o' iconBackgroundColor='#900' text={isCourseAdmin ? 'Bình luận chờ duyệt' : 'Bình luận của học viên'} />
                    <PageIcon visible={!item.isDefault && isCourseAdmin} to={`/user/course/${item._id}/report`} icon='fa-file-text' iconBackgroundColor='#DAA520' text={'Báo cáo'} />
                    <PageIcon visible={!item.isDefault && isCourseAdmin} to={`/user/course/${item._id}/class`} icon='fa-table' iconBackgroundColor='#9400D3' text={'Phân lớp'} />
                    {isLecturer ? <PageIcon to={`/user/course/${item._id}/feedback-lecturer`} icon='fa-commenting-o' iconBackgroundColor='#dc3545' text='Phản hồi' /> : null}
                    <PageIconHeader text='Đào tạo' />
                    <PageIcon visible={ permission.delete } to={`/user/course/${item._id}/additional-profile`} icon='fa-folder' iconBackgroundColor='#1488db' text='Bổ sung hồ sơ học viên' />
                    <PageIcon visible={isLecturer} to={`/user/course/${item._id}/your-students`} icon='fa-graduation-cap' iconBackgroundColor='#18ffff' text='Học viên của bạn' />
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${item._id}/learning`} icon='fa-line-chart' iconBackgroundColor='#69f0ae' text='Tiến độ học tập' />
                    <PageIcon visible={!item.isDefault && permission.delete} to={`/user/course/${item._id}/rate-subject`} icon='fa-folder-open' iconBackgroundColor='#900' text='Đánh giá bài học' />
                    <PageIcon visible={!item.isDefault && (isLecturer && !isCourseAdmin)} to={`/user/course/${item._id}/lecturer/calendar`} icon='fa-calendar' iconBackgroundColor='#3e24aa' text='Thời khoá biểu' />
                    <PageIcon visible={!item.isDefault && (isLecturer && !isCourseAdmin)} to={`/user/course/${item._id}/lecturer/register-calendar`} icon='fa-calendar-plus-o' iconBackgroundColor='#8d74aa' text='Đăng ký lịch nghỉ' />
                    <PageIcon visible={!item.isDefault && (isLecturer && !isCourseAdmin)} to={`/user/course/${item._id}/lecturer/student-register-calendar`} icon='fa fa-list-alt' iconBackgroundColor='#4e25a2' text='Danh sách lịch học học viên đăng ký' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin||permissionTimeTable.read) && !isLecturer} to={`/user/course/${item._id}/calendar`} icon='fa-calendar' iconBackgroundColor='#64b5f6' text='Thời khoá biểu toàn khoá' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin||permissionTimeTable.read) && !isLecturer} to={`/user/course/${item._id}/register-calendar`} icon='fa-calendar-plus-o' iconBackgroundColor='#8d74aa' text='Lịch nghỉ giáo viên' />
                    <PageIcon visible={!item.isDefault && (isCourseAdmin||permissionTimeTable.read) && !isLecturer} to={`/user/course/${item._id}/student-register-calendar`} icon='fa fa-list-alt' iconBackgroundColor='#4e25a2' text='Danh sách lịch học học viên đăng ký' />
                    {/* <PageIcon visible={permission.delete} to={`/user/course/${item._id}/photo`} icon='fa-camera' iconBackgroundColor='#900' text='Theo dõi' /> */}
                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
