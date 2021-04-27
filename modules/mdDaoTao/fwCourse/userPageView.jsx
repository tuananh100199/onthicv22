import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux.jsx';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import { getAllDriveTests } from 'modules/mdDaoTao/fwDriveTest/redux';


const previousRoute = '/user';
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
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
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.url != this.props.match.url) {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
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
                this.props.history.push('/user');
            }
        }
        if (this.state.courseType && this.state.courseType !== prevState.courseType) {
            this.setState({ _courseTypeId: this.state.courseType._id });
            this.props.getAllDriveTests({ courseType: this.state.courseType._id });
        }
    }

    render() {
        const subjects = this.props.course && this.props.course.item && this.props.course.item.subjects ? this.props.course.item.subjects : [];
        const _courseTypeId = this.state && this.state._courseTypeId ? this.state._courseTypeId : '';
        const { list } = this.props.driveTest ? this.props.driveTest : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row'>
                    <div className='col-12'>
                        <h4>Thông tin chung</h4>
                        <div className='row'>
                            <div className='col-md-6'>
                                <Link to={'/user/hoc-vien/khoa-hoc/thong-tin/' + this.state.courseId}>
                                    <div className='widget-small coloured-icon info'>
                                        <i className='icon fa fa-3x fa-info' />
                                        <div className='info'>
                                            <h4>Thông tin khóa học</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className='col-12'>
                        <h4>Môn học</h4>
                        <div className='row'>
                            {subjects.length ? subjects.map((subject, index) => (
                                <div key={index} className='col-md-6 col-lg-4'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/mon-hoc/' + subject._id}>
                                        <div className='widget-small coloured-icon primary'>
                                            <i className='icon fa fa-3x fa fa-briefcase' />
                                            <div className='info'>
                                                <h4>{subject && subject.title}</h4>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )) : <div className='col-md-4'>Chưa có môn học!</div>
                            }
                        </div>
                    </div>
                    <div className='col-12'>
                        <h4>Ôn tập đề thi</h4>
                        <div className='row'>
                            <div className='col-md-4'>
                                <Link to={'/user/hoc-vien/khoa-hoc/de-thi-ngau-nhien/' + _courseTypeId}>
                                    <div className='widget-small coloured-icon info'>
                                        <i className='icon fa fa-3x fa-cubes' />
                                        <div className='info'>
                                            <h4>Đề thi ngẫu nhiên</h4>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            {list && list.map((driveTest, index) => (
                                <div key={index} className='col-md-4'>
                                    <Link to={'/user/hoc-vien/khoa-hoc/de-thi-thu/' + driveTest._id}>
                                        <div className='widget-small coloured-icon info'>
                                            <i className='icon fa fa-3x fa fa-cubes' />
                                            <div className='info'>
                                                <h4>{driveTest.title}</h4>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))
                            }
                        </div>
                    </div>
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course, driveTest: state.driveTest });
const mapActionsToProps = { getCourseByStudent, getAllDriveTests };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);
