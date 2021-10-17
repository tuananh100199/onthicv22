import React from 'react';
import { connect } from 'react-redux';
import { getCourse } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';

const previousRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const route = T.routeMatcher('/user/course/:_id'),
                _id = route.parse(window.location.pathname)._id;
            if (_id) {
                this.setState({ _id });
                this.props.getCourse(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        const { name } = data.item;
                        this.setState({ name });
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            } else {
                this.props.history.push(previousRoute);
            }
        });
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = currentUser,
            { name, _id } = this.state;

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Chi tiết khóa học'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${_id}/info`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    <PageIcon visible={isLecturer || isCourseAdmin} to={`/user/course/${_id}/subject`} icon='fa-briefcase' iconBackgroundColor='#1488db' text='Môn học' />
                    <PageIcon to={`/user/course/${_id}/forum`} icon='fa-address-book' iconBackgroundColor='#8d6e63' text='Forum' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${_id}/learning`} icon='fa-line-chart' iconBackgroundColor='#0D0' text='Tiến độ học tập' />

                    <PageIconHeader text='Nhân sự' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${_id}/manager`} icon='fa-user-secret' iconBackgroundColor='#D00' text='Gán Quản trị viên khóa học' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${_id}/student`} icon='fa-users' iconBackgroundColor='#8A0' text='Gán Học viên' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${_id}/teacher`} icon='fa-user-circle' iconBackgroundColor='#CC0' text='Gán Cố vấn học tập' />
                    <PageIcon visible={isCourseAdmin} to={`/user/course/${_id}/representer`} icon='fa-user-circle-o' iconBackgroundColor='#CAC' text='Gán Giáo viên' />

                    <PageIconHeader text='Học viên' />

                    <PageIconHeader text='Chat' />
                </div>
            ),
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
