import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent, viewLesson, timeLesson } from './redux';
import { getStudentScore } from '../fwStudent/redux';
import { getSubjectByStudent } from '../fwSubject/redux';
import YouTube from 'react-youtube';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal } from 'view/component/AdminPage';
import RateModal from 'modules/_default/fwRate/RateModal';
// import 'view/component/ratingStar.scss';
import CommentSection from 'modules/_default/fwComment/CommentSection';


class TaiLieuThamKhaoModal extends AdminModal {
    state = {};
    onShow = (item) => this.setState({ item });

    render = () => this.renderModal({
        title: 'Tài liệu tham khảo',
        body: <p dangerouslySetInnerHTML={{ __html: this.state.item }} />
    });
}
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
                    let totalSeconds = 0;
                    this.props.getSubjectByStudent(params.subjectId, data => {
                        if (data.item && data.item.lessons) {
                            const listLesson = data.item.lessons,
                                currentIndex = listLesson.findIndex(lesson => lesson._id == params._id);
                            if (currentIndex + 1 == listLesson.length) this.setState({ nextLesson: null, monThucHanh: data.item.monThucHanh });
                            else this.setState({ nextLesson: listLesson[currentIndex + 1], monThucHanh: data.item.monThucHanh });
                        }
                    });
                    if (data.item.questions) {
                        this.props.viewLesson(params._id, params.subjectId, params.courseId, true);
                    }
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    this.props.getStudentScore(params.courseId, data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            totalSeconds = (data[params.subjectId] && data[params.subjectId][params._id] && data[params.subjectId][params._id].totalSeconds) ? parseInt(data[params.subjectId][params._id].totalSeconds) : 0;
                            this.setState({ tienDoHocTap: data[params.subjectId], isView: data[params.subjectId] && data[params.subjectId][params._id] && data[params.subjectId][params._id].view });
                        }
                    });
                    let hours = 0;
                    let minutes = 0;
                    let seconds = 0;
                    window.interval = setInterval(() => {
                        ++totalSeconds;
                        this.setState({ totalSeconds });
                        hours = parseInt(totalSeconds / 3600) % 24;
                        minutes = parseInt(totalSeconds / 60) % 60;
                        seconds = totalSeconds % 60;
                        $('#time').text((hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds));
                    }, 1000);
                    this.setState({ lessonId: params._id, subjectId: params.subjectId, courseId: params.courseId, ...data.item });
                } else {
                    this.props.history.push('/user');
                }
            });
        } else {
            this.props.history.push('/user');
        }
    }

    componentWillUnmount() {
        const { lessonId, subjectId, courseId, totalSeconds } = this.state;
        clearInterval(window.interval);
        this.props.timeLesson(lessonId, subjectId, courseId, totalSeconds);

    }

    saveRating = (value) => {
        this.props.rateLesson(this.state.lessonId, this.state.subjectId, this.state.courseId, value);
    }

    render() {
        const { lessonId, subjectId, title, courseId, tienDoHocTap, isView, monThucHanh, nextLesson } = this.state,
            lesson = this.props.lesson && this.props.lesson.item,
            videos = lesson && lesson.videos ? lesson.videos : [],
            taiLieuThamKhao = lesson && lesson.taiLieuThamKhao,
            rate = this.props.rate && this.props.rate.item,
            isShowRating = tienDoHocTap && tienDoHocTap[lessonId] || (lesson && lesson.questions && !lesson.questions.length),
            videosRender = videos.length ? videos.map((video, index) => (
                <div key={index} className='d-flex justify-content-center pb-5'>
                    <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} onClick={e => this.onView(e, video._id, index)}>
                        <YouTube opts={{ playerVars: { 'autoplay': 0, 'controls': isView ? 1 : 0, 'rel': 0 } }} videoId={video.link} containerClassName='embed embed-youtube' />
                    </div>
                </div>)) : 'Chưa có video bài giảng!';
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId;
        if (tienDoHocTap && tienDoHocTap[lessonId]) {
            $('#' + tienDoHocTap[lessonId].rating).prop('checked', true);
        }
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Bài học'],
            content: lessonId ? <>
                <div className='tile'>
                    <div className='d-flex justify-content-between'>
                        <a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/thong-tin/' + lessonId} style={{ color: 'black' }}><h5>Thông tin bài học</h5></a>
                        <h3 id='time' ref={e => this.time = e}></h3>
                    </div>
                    <h3 className='tile-title'>Bài giảng</h3>
                    <div className='tile-body'>
                        {videosRender}
                        {taiLieuThamKhao != '' ?
                            // <button className='btn btn-primary' onClick={() => this.modalTaiLieuThamKhao.show(taiLieuThamKhao)}>
                            //     Tài liệu tham khảo
                            // </button>
                            <div><a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/tai-lieu/' + lessonId} className='btn btn-primary' ><div>Tài liệu học tập</div></a></div>
                            : null}
                    </div>
                    <div className='tile-footer' >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={isShowRating ? 'visible' : 'invisible'}>
                                <button className='btn btn-primary mb-2' onClick={(e) => { e.preventDefault(); this.modal.show(); }}>Đánh giá bài học</button>
                                {rate && <h5>Đã đánh giá:   <span className='text-warning'>{rate.value + ' sao'}</span></h5>}
                                <RateModal ref={e => this.modal = e} title='Đánh giá bài giảng' type='lesson' _refId={lessonId} />
                            </div>
                            {monThucHanh ?
                                <div>
                                    {nextLesson ?
                                        <a className='btn btn-warning ml-5' href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/' + nextLesson._id}>
                                            <i className='fa fa-lg fa-arrow-right' /> Sang bài tiếp theo
                                        </a> : null}
                                </div> :
                                <div>
                                    <Link to={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/cau-hoi/' + lessonId} className='btn btn-primary'>Câu hỏi ôn tập</Link>
                                </div>}
                        </div>
                    </div>
                </div>

                <div className='tile'>
                    <div className='tile-body'><CommentSection refParentId={courseId} refId={lessonId} /></div>
                </div>
                <TaiLieuThamKhaoModal ref={e => this.modalTaiLieuThamKhao = e} />
            </> : null,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson, rate: state.framework.rate });
const mapActionsToProps = { getLessonByStudent, getStudentScore, viewLesson, timeLesson, getSubjectByStudent };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);