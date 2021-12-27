import React from 'react';
import { connect } from 'react-redux';
import { getListPhoto } from 'modules/_default/_init/redux';
import { getCourse } from '../redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker } from 'view/component/AdminPage';

class AdminPhotoPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/photo/:_id').parse(window.location.pathname);
            const course = this.props.course ? this.props.course.item : null;
            if (course) {
                if (params._id) {
                    this.props.getStudent(params._id, data => {
                        this.setState({ studentId: data._id, studentName: data.lastname + ' ' + data.firstname, userId: data && data.user && data.user._id });
                    });
                }
            } else {
                this.props.getCourse(params._courseId, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user/course/' + params._id);
                    } else {
                        if (params._id) {
                            this.props.getStudent(params._id, data => {
                                this.setState({ studentId: data._id, studentName: data.lastname + ' ' + data.firstname, userId: data && data.user && data.user._id });
                            });
                        }
                    }
                });
            }


        });
    }

    handleFilterByTime = (item) => {
        const user = this.state.userId;
        this.props.getListPhoto(item, user, data => {
            this.setState({ data });
        });
    }

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { studentName, data } = this.state;
        const backRoute = `/user/course/${item._id}/learning`;
        return this.renderPage({
            icon: 'fa fa-camera',
            title: 'Hình ảnh học viên: ' + studentName,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={'/user/course/' + item._id}>{item.name}</Link> : '', item._id ? <Link key={0} to={backRoute}>Tiến độ học tập</Link> : '', 'Hình ảnh học viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <FormDatePicker className='col-md-2' ref={e => this.itemNgayLuaChon = e} label='Ngày chụp' onChange={(item) => this.handleFilterByTime(item)} />
                        <div className='row'>
                            {data && data.item && data.item.length ? data.item.map((image, index) => (
                                <div key={index} className='col-md-6 col-lg-4 col-xs-12'>
                                    <img src={data.path + '/' + image}></img>
                                    <p>{T.dateToText(new Date(parseInt(image.slice(0, 13))))}</p>
                                </div>
                            )) : <p className='col-md-3'>Chưa có dữ liệu!</p>}
                        </div>

                    </div>

                </div>
            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getListPhoto, getStudent, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminPhotoPage);