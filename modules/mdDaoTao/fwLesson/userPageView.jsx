import React from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import { getLessonByStudent, checkQuestion } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';

class adminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/:_id').parse(url);
        this.setState({ lessonId: params._id })
        if (params._id) {
            this.props.getLessonByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user');
                } else if (data.item && data.currentCourse && data.currentSubject) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + data.currentCourse);
                    const { _id, title, shortDescription, detailDescription, questions } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription, questions, courseId: data.currentCourse, subjectId: data.currentSubject });
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push(userPageLink);
        }
        $('#questionBtn').css({ 'visibility': 'hidden' });
    }

    render() {
        const videos = this.props.lesson && this.props.lesson.item && this.props.lesson.item ? this.props.lesson.item.videos : [];
        const userPageLink = '/user/hoc-vien/khoa-hoc/mon-hoc/' + this.state.subjectId;
        const checkElapsedTime = (e, _id, index) => {
            if (e.target.playerInfo.playerState == 1) {
                this.setState(prevState => ({
                    viewed: { ...prevState.viewed, [_id]: index }
                }), () => {
                    if (Object.keys(this.state.viewed).length == videos.length) {
                        $('#questionBtn').css({ 'visibility': 'visible' });
                    }
                })

            }
        };
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Khóa học</Link>, 'Bài học'],
            content: (
                <div className='tile'>
                    <a href={'/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/thong-tin/' + this.state.lessonId} style={{ color: 'black' }}><h5>Thông tin bài học</h5></a>
                    <h3 className='tile-title'>Bài giảng</h3>
                    <div className='tile-body'>
                        <div className='tile-body'>
                            {videos.length ? videos.map((video, index) =>
                            (
                                <div key={index} className='d-flex justify-content-center pb-5'>
                                    <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} onClick={e => this.onView(e, video._id, index)}>
                                        <YouTube
                                            videoId={video.link.slice(17)}
                                            containerClassName='embed embed-youtube'
                                            onStateChange={(e) => checkElapsedTime(e, video._id, index)}
                                        />
                                    </div>
                                </div>
                            )
                            ) : <div className='tile-body'>Chưa có video bài giảng!</div>}
                        </div>
                    </div>
                    <div className='tile-footer' style={{ textAlign: 'right' }} >
                        <a id='questionBtn' href={'/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/cau-hoi/' + this.state.lessonId} className='btn btn-primary'>Câu hỏi ôn tập</a>
                    </div>
                </div>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLessonByStudent, checkQuestion };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);