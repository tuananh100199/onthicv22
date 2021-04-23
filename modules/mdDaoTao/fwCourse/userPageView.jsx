import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent, updateCourse } from './redux.jsx';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';
import UserSubjectView from './tabView/userSubjectView';
import UserDriveTestView from './tabView/userDriveTestView';

const previousRoute = '/user/hoc-vien/khoa-hoc';
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/hoc-vien/khoa-hoc', () => {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
                _id = route.parse(window.location.pathname)._id;
            if (_id) {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        this.setState(data.item)
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
        const tabInfo = <div className='row'>
            <label className='col-md-6'>Tên khóa học: <b>{this.state.name}</b></label>
            <label className='col-md-3'>Loại khóa học: <b>{this.state.courseType && this.state.courseType.title}</b></label>
            <label className='col-md-3'>Học phí:  <b>{this.state.courseFee}</b></label>
            <label className='col'>Thời gian khai giảng: <b>{T.dateToText(this.state.thoiGianKhaiGiang, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian bắt đầu: <b>{T.dateToText(this.state.thoiGianBatDau, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian kết thúc: <b>{T.dateToText(this.state.thoiGianKetThuc, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian kết thúc môn dự kiến: <b>{T.dateToText(this.state.thoiGianThiKetThucMonDuKien, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian kết thúc môn chính thức: <b>{T.dateToText(this.state.thoiGianThiKetThucMonChinhThuc, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian tốt nghiệp dự kiến: <b>{T.dateToText(this.state.thoiGianThiTotNghiepDuKien, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-6'>Thời gian tốt nghiệp chính thức: <b>{T.dateToText(this.state.thoiGianThiTotNghiepChinhThuc, 'dd/mm/yyyy h:mm')}</b></label>
            <label className='col-md-12'>Giới thiệu ngắn khóa học:</label> <b>{this.state.shortDescription}</b>
        </div>;
        const tabs = [
            { title: 'Thông tin chung', component: tabInfo },
            { title: 'Môn học', component: <UserSubjectView /> },
            { title: 'Ôn tập đề thi', component: <UserDriveTestView /> },
        ];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: [<Link to='/user/course'>Khóa học</Link>, 'Chi tiết khóa học'],
            content: <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCourseByStudent, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);
