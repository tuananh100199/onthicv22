import React from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import { getLessonByStudent } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class adminEditPage extends AdminPage {
    state = { showQuestionButton: false, questionVisibility: 'hidden' };
    componentDidMount() {
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/:_id').parse(window.location.pathname);
        if (params._id) {
            this.props.getLessonByStudent(params._id, params.courseId, params.subjectId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user');
                } else if (data.item) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    this.setState({ lessonId: params._id, subjectId: params.subjectId, courseId: params.courseId, ...data.item });
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }

    render() {
        const { lessonId, subjectId, title, courseId } = this.state;
        const videos = this.props.lesson && this.props.lesson.item && this.props.lesson.item && this.props.lesson.item.videos ? this.props.lesson.item.videos : [];
        const videosRender = videos.length ? videos.map((video, index) => (
            <div key={index} className='d-flex justify-content-center pb-5'>
                <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} onClick={e => this.onView(e, video._id, index)}>
                    <YouTube videoId={video.link} containerClassName='embed embed-youtube' />
                </div>
            </div>)) : 'Chưa có video bài giảng!';

        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Bài học'],
            content: lessonId ? (
                <div className='tile'>
                    <a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/thong-tin/' + lessonId} style={{ color: 'black' }}><h5>Thông tin bài học</h5></a>
                    <h3 className='tile-title'>Bài giảng</h3>
                    <div className='tile-body'>{videosRender}</div>
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <Link to={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/cau-hoi/' + lessonId} className='btn btn-primary'>Câu hỏi ôn tập</Link>
                    </div>
                </div>) : null,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson });
const mapActionsToProps = { getLessonByStudent };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);