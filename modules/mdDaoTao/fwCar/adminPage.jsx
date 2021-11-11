import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, PageIconHeader, PageIcon } from 'view/component/AdminPage';
import { getCar } from './redux';

class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/car', () => {
            const user = this.props.system && this.props.system.user,
                { isLecturer, isCourseAdmin } = user;
            if (isLecturer && !isCourseAdmin) {
                this.props.getCar({ user: user._id }, data => {
                    this.setState({ data });
                });
            }
            this.setState({ isLecturer, isCourseAdmin });
        });
    }

    render() {
        const permission = this.getUserPermission('car', ['read', 'write', 'delete', 'fuel']);
        const { car, isLecturer, isCourseAdmin } = this.state;
        return this.renderPage({
            icon: 'fa fa-car',
            title: 'Quản lý xe',
            breadcrumb: ['Quản lý xe'],
            content: (
                <div className='row user-course'>
                    {car && car._id ? null : <PageIconHeader text='Thông tin chung' />}
                    <PageIcon visible={permission.write} to={'/user/car/manager'} icon='fa-info' iconBackgroundColor='#17a2b8' text='Danh sách xe' />
                    <PageIcon visible={permission.write} to={'/user/car/repair'} icon='fa-wrench' iconBackgroundColor='#8e24aa' text='Danh sách xe sửa chữa, thanh lý' />
                    <PageIcon visible={permission.write} to={'/user/car/category'} icon='fa-list' iconBackgroundColor='#8e24aa' text='Danh mục nhãn hiệu xe ' />
                    <PageIconHeader text='Quản lý hồ sơ' />
                    <PageIcon visible={permission.write} to={'/user/car/practice'} icon='fa-road' iconBackgroundColor='#dc143c' text='Đăng ký xe tập lái' />
                    <PageIcon visible={permission.write} to={'/user/car/registration'} icon='fa-file-text-o' iconBackgroundColor='#CC0' text='Đăng kiểm xe' />
                    <PageIcon visible={permission.write} to={'/user/car/course'} icon='fa-cubes' iconBackgroundColor='#D00' text='Xe đi khóa' />
                    {car && car._id ? <PageIcon visible={permission.fuel} to={'/user/car/fuel/' + car._id} icon='fa-thermometer-empty' iconBackgroundColor='#900' text='Cấp phát nhiên liệu' /> : null}
                    <PageIcon visible={isLecturer} to={'/user/car/lecturer/calendar'} icon='fa-calendar' iconBackgroundColor='#3e24aa' text='Lịch xe' />
                    <PageIcon visible={isCourseAdmin} to={'/user/car/calendar'} icon='fa-calendar' iconBackgroundColor='#64b5f6' text='Tổng quan lịch xe' />
                    <PageIcon visible={isCourseAdmin} to={'/user/car/history-calendar'} icon='fa-history' iconBackgroundColor='#be231b' text='Lịch sử lịch xe' />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCar };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
