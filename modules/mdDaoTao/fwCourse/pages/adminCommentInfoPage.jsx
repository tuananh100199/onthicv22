import React from 'react';
import { connect } from 'react-redux';
import { getCommentLessonId } from 'modules/_default/fwComment/redux';
import CommentSection from 'modules/_default/fwComment/CommentSection';
import { getCourse } from '../redux';
import { Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { getLesson } from 'modules/mdDaoTao/fwLesson/redux';
import { AdminPage, AdminModal } from 'view/component/AdminPage';


class TaiLieuHocTapModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => { });
    }

    onShow = () => {
        const taiLieuThamKhao = this.props.taiLieuThamKhao;
        this.setState({ taiLieuThamKhao });
    }

    render = () => {
        const taiLieuThamKhao = this.props.taiLieuThamKhao;
        return this.renderModal({
            title: 'Tài liệu học tập',
            body:
                <p dangerouslySetInnerHTML={{ __html: taiLieuThamKhao }} />
        });
    }
}

class QuestionsModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => { });
    }

    onShow = () => {
        const questions = this.props.questions;
        this.setState({ questions });
    }

    render = () => {
        const questions = this.props.questions;
        const content = questions && questions.length ?
            questions.map((question, index) => (
                <div key={index} className='col-md-12 pb-5'>
                    <div className='row'>
                        <div className='col-md-8'>
                            <h6>Câu hỏi {index + 1 + '/' + questions.length}: </h6>
                            <h6>{question.title}</h6>
                        </div>
                    </div>
                    {question.image ? <img src={question.image} alt='question' style={{ width: 'auto', height: '300px', display: 'block', margin: 'auto', padding: '15px 0px' }} /> : null}
                    <div className='form-check'>
                        {question.answers.split('\n').map((answer, i) => (
                            <div key={i} className='custom-control custom-radio' style={{ paddingBottom: '10px' }}>
                                <input className='custom-control-input' type='radio' checked={i == question.trueAnswer} name={question._id} id={question._id + i} value={i} disabled={true} />
                                <label className={'custom-control-label ' + (i == question.trueAnswer ? 'text-success' : '')} htmlFor={question._id + index} style={{ cursor: 'pointer' }} >
                                    {answer}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))
            : null;
        return this.renderModal({
            title: 'Tài liệu học tập',
            size: 'large',
            body:
                <div>
                    {content}
                </div>
        });
    }
}

class AdminCommentInfoPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_courseId/comment/:_id').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getCommentLessonId(params._id, data => {
                        if (data && data.lessonId) {
                            this.setState({ courseId: course._id, lessonId: data.lessonId, lessonName: data.lessonName });
                            this.props.getLesson(data.lessonId, data => {
                                if (data.error) {
                                    T.notify('Lấy bài học bị lỗi!', 'danger');
                                    this.props.history.push('/user');
                                } else if (data.item) {
                                    this.setState({ lesson: data.item });
                                } else {
                                    this.props.history.push('/user');
                                }
                            });
                        }
                        else this.props.history.push('/user/course/' + params._id + '/comment');
                    });
                } else {
                    this.props.getCourse(params._courseId, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getCommentLessonId(params._courseId, data => {
                                if (data && data.lessonId) {
                                    this.setState({ courseId: params._courseId, lessonId: data.lessonId, lessonName: data.lessonName });
                                    this.props.getLesson(data.lessonId, data => {
                                        if (data.error) {
                                            T.notify('Lấy bài học bị lỗi!', 'danger');
                                            this.props.history.push('/user');
                                        } else if (data.item) {
                                            this.setState({ lesson: data.item });
                                        } else {
                                            this.props.history.push('/user');
                                        }
                                    });
                                }
                                else this.props.history.push('/user/course/' + params._id + '/comment');
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    render() {
        const { courseId, lessonId, lessonName } = this.state;
        const course = this.props.course && this.props.course.item ? this.props.course.item : {},
            lesson = this.props.lesson && this.props.lesson.item,
            videos = lesson && lesson.videos ? lesson.videos : [],
            taiLieuThamKhao = lesson && lesson.taiLieuThamKhao,
            questions = lesson && lesson.questions,
            videosRender = videos.length ? videos.map((video, index) => (
                <div key={index} className=' pb-5'>
                    <div className='d-flex justify-content-center'>
                        <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} >
                            <YouTube opts={{ playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0, 'modestbranding': 1, 'showinfo': 0 } }} videoId={video.link} containerClassName='embed embed-youtube' />
                        </div>
                    </div>
                    <p id={video._id} className='text-center' ></p>
                </div>
            )) : 'Chưa có video bài giảng!';
        console.log(lesson);
        const backRoute = `/user/course/${course._id}/comment`;
        return this.renderPage({
            icon: 'fa fa-comment-o',
            title: 'Bình luận bài học: ' + lessonName,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, course._id ? <Link key={0} to={backRoute}>Bình luận chờ duyệt</Link> : '', 'Bình luận'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Bài giảng</h3>
                        <div className='tile-body'>
                            {videosRender}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {taiLieuThamKhao != '' ? <button className='btn btn-success' onClick={() => this.modal.show()}>Tài liệu học tập</button> : null}
                                {questions && questions.length ? <button className='btn btn-success' onClick={() => this.questionsModal.show()}>Câu hỏi ôn tập</button> : null}
                            </div>
                        </div>
                    </div>
                    <div className='tile'>
                        {courseId && lessonId ? <div className='tile-body'><CommentSection refParentId={courseId} refId={lessonId} /></div> : <div>Không tìm thấy bình luận!</div>}
                    </div>
                    <TaiLieuHocTapModal ref={e => this.modal = e} taiLieuThamKhao={taiLieuThamKhao} />
                    <QuestionsModal ref={e => this.questionsModal = e} questions={questions} />
                </>

            ),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, comment: state.framework.comment, course: state.trainning.course, lesson: state.trainning.lesson });
const mapActionsToProps = { getCommentLessonId, getCourse, getLesson };
export default connect(mapStateToProps, mapActionsToProps)(AdminCommentInfoPage);