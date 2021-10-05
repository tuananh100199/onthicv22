import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux.jsx';
import { Link } from 'react-router-dom';
import { AdminPage, CirclePageButton } from 'view/component/AdminPage';
// import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';

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
                    } else if (data.item && data._studentId) {
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

    componentDidUpdate(prevProps) {
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
    }

    render() {
        const subjects = this.props.course && this.props.course.item && this.props.course.item.subjects ? this.props.course.item.subjects : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row user-course'>
                    <h4 style={{ width: '100%' }}>Thông tin chung</h4>
                    <Link className='col-md-6 col-lg-4' to={'/user/hoc-vien/khoa-hoc/thong-tin/' + this.state.courseId}>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa-info' />
                            <div className='info'>
                                <h4>Thông tin khóa học</h4>
                            </div>
                        </div>
                    </Link>
                    {/* {this.state.chatActive &&
                        <Link className='col-md-4' to={'/user/chat/' + this.state.courseId}>
                            <div className='widget-small coloured-icon info'>
                                <i className='icon fa fa-3x fa-comments-o' />
                                <div className='info'>
                                    <h4>Chat</h4>
                                </div>
                            </div>
                        </Link>} */}
                    <Link className='col-md-4' to='#'>
                        <div className='widget-small coloured-icon info'>
                            <i className='icon fa fa-3x fa-comments-o' />
                            <div className='info'>
                                <h4>Chat</h4>
                            </div>
                        </div>
                    </Link>


                    {/* //TODO chức năng phản hồi */}
                    <Link className='col-md-6 col-lg-4' to={`/user/hoc-vien/khoa-hoc/${this.state.courseId}/phan-hoi`}>
                        <div className='widget-small coloured-icon warning'>
                            <i className='icon fa fa-3x fa-commenting-o' />
                            <div className='info'>
                                <h4>Phản hồi</h4>
                            </div>
                        </div>
                    </Link>


                    <h4 style={{ width: '100%' }}>Môn học</h4>
                    {subjects.length ? subjects.map((subject, index) => (
                        <div key={index} className='col-md-6 col-lg-4'>
                            <Link to={`/user/hoc-vien/khoa-hoc/${this.state.courseId}/mon-hoc/${subject._id}`}>
                                <div className='widget-small coloured-icon primary'>
                                    <i className='icon fa fa-3x fa fa-briefcase' />
                                    <div className='info'>
                                        <h4>{subject && subject.title}</h4>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )) : <div className='col-md-4'>Chưa có môn học!</div>}

                    {/* //TODO chức năng chat */}
                    <CirclePageButton type='custom' customClassName='btn-success' customIcon='fa-comments-o' onClick={() => alert('Chat')} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);
