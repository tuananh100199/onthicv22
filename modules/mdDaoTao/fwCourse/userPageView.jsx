import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux.jsx';
import { AdminPage, CirclePageButton, PageIconHeader, PageIcon } from 'view/component/AdminPage';

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
                        this.props.history.push('/user');
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push('/user');
                    } else if (data.item && data._studentId) {
                        this.setState(data.item);
                    } else {
                        this.props.history.push('/user');
                    }
                });
            });
        } else {
            this.props.history.push('/user');
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
                            this.props.history.push('/user');
                        } else if (data.notify) {
                            T.alert(data.notify, 'error', false, 2000);
                            this.props.history.push('/user');
                        } else if (data.item) {
                            this.setState(data.item);
                        } else {
                            this.props.history.push('/user');
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
        const { name, courseId } = this.state;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: `Khóa học: ${name}`,
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />

                    <PageIcon to={`/user/hoc-vien/khoa-hoc/thong-tin/${courseId}`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/thoi-khoa-bieu`} icon='fa-calendar' iconBackgroundColor='#ffc107' text='Thời khóa biểu' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/forum`} icon='fa-users' iconBackgroundColor='#8d6e63' text='Forum' />

                    <PageIcon to={`/user/chat/${courseId}`} icon='fa-comments-o' iconBackgroundColor='#28a745' text='Chat' visible={this.state.chatActive} />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/phan-hoi`} icon='fa-commenting-o' iconBackgroundColor='#dc3545' text='Phản hồi' />

                    {subjects.length ? <>
                        <PageIconHeader text='Môn học lý thuyết' />
                        {/* <h4 style={{ width: '100%' }}>Môn học lý thuyết</h4> */}
                        {subjects.map((subject, index) =>
                            <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${courseId}/mon-hoc/${subject._id}`} icon='fa-briefcase' iconBackgroundColor='#1488db' text={subject ? subject.title : ''} />
                        )}
                    </> : null}

                    <PageIconHeader text='Môn học thực hành' />
                    {/* TODO: hiển thị môn học thực hành */}

                    <CirclePageButton type='custom' customClassName='btn-success' customIcon='fa-comments-o' onClick={() => this.props.history.push('/user/chat/' + this.state.courseId)} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getCourseByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);