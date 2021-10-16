import React from 'react';
import { connect } from 'react-redux';
import YouTube from 'react-youtube';
import { getLessonByStudent, rateLesson } from './redux';
import { getStudentScore } from '../fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import 'view/component/ratingStar.scss';

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
                    this.props.getStudentScore(params.courseId, data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            this.setState({ tienDoHocTap: data[params.subjectId] });
                        }
                    });
                    this.setState({ lessonId: params._id, subjectId: params.subjectId, courseId: params.courseId, ...data.item });
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }

    saveRating = (value) => {
        this.props.rateLesson(this.state.lessonId, this.state.subjectId, this.state.courseId, value);
    }

    render() {
        const { lessonId, subjectId, title, courseId, tienDoHocTap } = this.state,
            lesson = this.props.lesson && this.props.lesson.item,
            videos = lesson && lesson.videos ? lesson.videos : [];
        const videosRender = videos.length ? videos.map((video, index) => (
            <div key={index} className='d-flex justify-content-center pb-5'>
                <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} onClick={e => this.onView(e, video._id, index)}>
                    <YouTube videoId={video.link} containerClassName='embed embed-youtube' />
                </div>
            </div>)) : 'Chưa có video bài giảng!';
        const isShowRating = tienDoHocTap && tienDoHocTap[lessonId] || (lesson && lesson.questions && !lesson.questions.length);
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId;
        if (tienDoHocTap && tienDoHocTap[lessonId]) {
            $('#' + tienDoHocTap[lessonId].rating).prop('checked', true);
        }
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Bài học'],
            content: lessonId ? (
                <div className='tile'>
                    <a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/thong-tin/' + lessonId} style={{ color: 'black' }}><h5>Thông tin bài học</h5></a>
                    <h3 className='tile-title'>Bài giảng</h3>
                    <div className='tile-body'>{videosRender}</div>
                    <div className='tile-footer' >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={isShowRating ? 'visible' : 'invisible'}>
                                <h6>Đánh giá cuối bài học</h6>
                                <div className='starrating risingstar d-flex justify-content-center flex-row-reverse'>
                                    <input type='radio' id='5' name='rating' value='5' onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor='5' title='5 star'></label>
                                    <input type='radio' id='4' name='rating' value='4' onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor='4' title='4 star'></label>
                                    <input type='radio' id='3' name='rating' value='3' onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor='3' title='3 star'></label>
                                    <input type='radio' id='2' name='rating' value='2' onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor='2' title='2 star'></label>
                                    <input type='radio' id='1' name='rating' value='1' onClick={(e) => this.saveRating(e.target.value)} /><label htmlFor='1' title='1 star'></label>
                                </div>
                            </div>
                            <div>
                                <Link to={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/cau-hoi/' + lessonId} className='btn btn-primary'>Câu hỏi ôn tập</Link>
                            </div>
                        </div>
                    </div>
                </div>) : null,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson });
const mapActionsToProps = { getLessonByStudent, getStudentScore, rateLesson };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);