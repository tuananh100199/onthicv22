import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';


const previousRoute = '/user';
class UserCourseInfo extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/thong-tin/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        this.setState(data.item);
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Chi tiết khóa học'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin chung</h3>
                        <div className='tile-body row'>
                            <label className='col-md-6'>Tên khóa học: <b>{this.state.name}</b></label>
                            <label className='col-md-3'>Loại khóa học: <b>{this.state.courseType ? this.state.courseType.title : ''}</b></label>
                            <label className='col-md-3'>Học phí:  <b>{this.state.courseFee ? T.numberDisplay(this.state.courseFee) + ' đồng' : ''}</b></label>
                            {this.state.shortDescription ? <div className='col-md-12'><label>Giới thiệu ngắn khóa học:</label> <b>{this.state.shortDescription}</b></div> : <></>}
                            {this.state.detailDescription ? <div className='col-md-12'><label>Mô tả chi tiết: </label><p dangerouslySetInnerHTML={{ __html: this.state.detailDescription }} /> </div> : <></>}
                        </div>
                    </div>

                    <div className='tile'>
                        <h3 className='tile-title'>Thời gian</h3>
                        <label className='col'>Thời gian khai giảng: <b>{T.dateToText(this.state.thoiGianKhaiGiang, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian bắt đầu: <b>{T.dateToText(this.state.thoiGianBatDau, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian kết thúc: <b>{T.dateToText(this.state.thoiGianKetThuc, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian kết thúc môn dự kiến: <b>{T.dateToText(this.state.thoiGianThiKetThucMonDuKien, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian kết thúc môn chính thức: <b>{T.dateToText(this.state.thoiGianThiKetThucMonChinhThuc, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian tốt nghiệp dự kiến: <b>{T.dateToText(this.state.thoiGianThiTotNghiepDuKien, 'dd/mm/yyyy h:mm')}</b></label>
                        <label className='col-md-6'>Thời gian tốt nghiệp chính thức: <b>{T.dateToText(this.state.thoiGianThiTotNghiepChinhThuc, 'dd/mm/yyyy h:mm')}</b></label>
                    </div>

                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseInfo);
