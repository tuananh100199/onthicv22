import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent } from './redux.jsx';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

const previousRoute = '/user';
class UserCourseInfo extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/thong-tin/:_id').parse(window.location.pathname);
        if (params._id) {
            this.setState({ lessonId: params._id });
            T.ready('/user/hoc-vien/khoa-hoc/' + params._id, () => {
                this.props.getLessonByStudent(params._id, data => {
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
        const userPageLink = '/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/' + this.state.lessonId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (this.state.title),
            breadcrumb: [<Link key={0} to={userPageLink}>Bài học</Link>, 'Thông tin chung'],
            content: (
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body'>
                        <div className='form-group'>
                            Tên môn học: <b>{this.state.title}</b>
                        </div>
                        <div className='form-group'>
                            {this.state.shortDescription ? <><label >Giới thiệu ngắn khóa học:</label> <b>{this.state.shortDescription}</b></> : <></>}
                        </div>
                        <div className='form-group'>
                            {this.state.detailDescription ? <><label >Mô tả chi tiết: </label><p dangerouslySetInnerHTML={{ __html: this.state.detailDescription }} /> </> : <></>}
                        </div>
                    </div>
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course, driveTest: state.driveTest });
const mapActionsToProps = { getLessonByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCourseInfo);
