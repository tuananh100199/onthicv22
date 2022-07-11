import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent, viewLesson, viewVideo, timeLesson } from './redux';
import { getCaptureSetting, savePhoto, logout } from 'modules/_default/_init/redux';
import { getStudentScore } from '../fwStudent/redux';
import { getSubjectByStudent } from '../fwSubject/redux';
import YouTube from 'react-youtube';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal } from 'view/component/AdminPage';
import RateModal from 'modules/_default/fwRate/RateModal';
// import 'view/component/ratingStar.scss';
import CommentSection from 'modules/_default/fwComment/CommentSection';
import Webcam from 'react-webcam';
import * as faceApi from 'face-api.js';

class ConfirmModal extends AdminModal {
    intervalCountDown;
    componentDidMount() {
        $(document).ready(() => { });
    }

    onShow = () => {
        faceApi.nets.ssdMobilenetv1.load('/models/');
        let minutesFaceDetect = 3;
        let secondsFaceDetect = 0;
        this.intervalCountDown = setInterval(() => {
            --secondsFaceDetect;
            minutesFaceDetect = (secondsFaceDetect < 0) ? --minutesFaceDetect : minutesFaceDetect;
            secondsFaceDetect = (secondsFaceDetect < 0) ? 59 : secondsFaceDetect;
            secondsFaceDetect = (secondsFaceDetect < 10) ? '0' + secondsFaceDetect : secondsFaceDetect;
            $('#timeFaceDetect').text(minutesFaceDetect + ':' + secondsFaceDetect).css('color', 'red');
            if (minutesFaceDetect < 0) clearInterval(this.intervalCountDown);
            if ((secondsFaceDetect <= 0) && (minutesFaceDetect <= 0)) {
                clearInterval(this.intervalCountDown);
                this.capture(null, 'end');
            }
        }, 1000);
    }

    capture = (e, type) => {
        e && e.preventDefault;
        const imageDetectSrc = this.webcamConfirm.getScreenshot();
        this.setState({ imageDetectSrc }, () => {
            faceApi.nets.ssdMobilenetv1.load('/models/').then(() => {
                const options = new faceApi.SsdMobilenetv1Options({
                    inputSize: 512,
                    scoreThreshold: 0.5
                });
                faceApi.detectSingleFace('img', options).then((result) => {
                    if (type == 'end') this.props.logout({ type: 'faceDetect' });
                    else {
                        if (result) {
                            this.hide();
                        } else {
                            this.hide();
                        }
                    }
                });
            });
        });
    }

    render = () => this.renderModal({
        title: 'Xác nhận học viên trực tuyến',
        dataBackdrop: 'static',
        body: <>
            <div >
                <div className='d-flex justify-content-center invisible' style={{ marginBottom: '-240px' }}>
                    <Webcam
                        audio={false}
                        height={240}
                        ref={e => this.webcamConfirm = e}
                        screenshotFormat='image/jpeg'
                        width={240}
                        videoConstraints={{
                            width: 1280,
                            height: 720,
                            facingMode: 'user'
                        }}
                    />
                </div>
                <div>
                    <p>Không phát hiện hoạt động trong thời gian dài, vui lòng xác nhận để tiếp tục học!</p>
                    <p>Thời gian còn lại: <span id='timeFaceDetect'></span></p>
                </div>
            </div>
        </>,
        buttons: <button className='btn btn-warning' onClick={(e) => this.capture(e, 'userCapture')}>Xác nhận</button>,
        hideCloseButton: true
    });
}
class adminEditPage extends AdminPage {
    state = { showQuestionButton: false, questionVisibility: 'hidden', listVideo: {}, totalSecondsVideo: 0, listPlayedVideo: {} };
    intervalVideo;
    intervalFaceDetect;
    componentDidMount() {
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/:_id').parse(window.location.pathname);
        if (params._id) {
            this.props.getLessonByStudent(params._id, params.courseId, params.subjectId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user');
                } else if (data.item) {
                    const lesson = data.item;
                    let totalSeconds = 0;
                    this.props.getSubjectByStudent(params.subjectId, data => {
                        if (data.item && data.item.lessons) {
                            const listLesson = data.item.lessons,
                                currentIndex = listLesson.findIndex(lesson => lesson._id == params._id);
                            if (currentIndex + 1 == listLesson.length) this.setState({ nextLesson: null, monThucHanh: data.item.monThucHanh });
                            else this.setState({ nextLesson: listLesson[currentIndex + 1], monThucHanh: data.item.monThucHanh });
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    this.props.getStudentScore(params.courseId, data => {
                        if (data.error) {
                            this.props.history.push('/user');
                        } else {
                            totalSeconds = (data[params.subjectId] && data[params.subjectId][params._id] && data[params.subjectId][params._id].totalSeconds) ? parseInt(data[params.subjectId][params._id].totalSeconds) : 0;
                            const listViewVideo = data[params.subjectId] && data[params.subjectId][params._id] && data[params.subjectId][params._id].viewedVideo ? Object.keys(data[params.subjectId][params._id].viewedVideo) : [];
                            const isView = data[params.subjectId] && data[params.subjectId][params._id] && data[params.subjectId][params._id].view ? data[params.subjectId][params._id].view : 'false';
                            setTimeout(() => {
                                lesson && lesson.videos && lesson.videos.forEach(video => {
                                    if (!(isView === 'false') || (listViewVideo.findIndex(viewVideo => viewVideo == video._id) != -1))
                                        $('#' + video._id).text('Đã hoàn thành').css('color', 'green');
                                });
                                const user = this.props.system && this.props.system.user;
                                const imageSrc = this.webcam.getScreenshot();
                                this.props.savePhoto(imageSrc, user._id, 'view' + lesson.title);
                            }, 5000);
                            this.props.getCaptureSetting(data => {
                                const user = this.props.system && this.props.system.user;
                                const { numberOfMinScreenCapture = 5, activeCapture = false } = data || {};
                                if (activeCapture && user && !(user.isCourseAdmin || user.isLecturer)) {
                                    this.intervalFaceDetect = setInterval(() => {
                                        const imageSrc = this.webcam.getScreenshot();
                                        this.setState({ imageSrc }, () => {
                                            faceApi.nets.ssdMobilenetv1.load('/models/').then(() => {
                                                const options = new faceApi.SsdMobilenetv1Options({
                                                    inputSize: 512,
                                                    scoreThreshold: 0.5
                                                });
                                                faceApi.detectSingleFace('img', options).then((result) => {
                                                    if (result) {
                                                        this.setState({ faceDetect: 0 });
                                                        this.props.savePhoto(imageSrc, user._id, 'view' + lesson.title);
                                                    }
                                                    else {
                                                        this.setState(prevState => ({
                                                            faceDetect: prevState.faceDetect ? prevState.faceDetect + 1 : 1
                                                        }), () => {
                                                            // if (this.state.faceDetect > 2) {
                                                            //     this.confirmModal.show();
                                                            // }
                                                        });
                                                    }
                                                });
                                            });
                                        });
                                    }, 60000 * numberOfMinScreenCapture);
                                }
                            });
                            this.setState({ tienDoHocTap: data[params.subjectId], isView, listViewVideo });
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
                    window.onbeforeunload = (event) => {
                        const e = event || window.event;
                        e.preventDefault();
                        clearInterval(window.interval);
                        this.props.timeLesson(params._id, params.subjectId, params.courseId, totalSeconds);
                    };
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
        clearInterval(this.intervalVideo);
        clearInterval(this.intervalFaceDetect);
        this.props.timeLesson(lessonId, subjectId, courseId, totalSeconds);
    }

    saveRating = (value) => {
        this.props.rateLesson(this.state.lessonId, this.state.subjectId, this.state.courseId, value);
    }

    onEnd(event) {
        const videoData = event.target.getVideoData(),
            videoId = videoData && videoData.video_id,
            lesson = this.props.lesson && this.props.lesson.item,
            videos = lesson && lesson.videos ? lesson.videos : [];
        const { lessonId, subjectId, courseId } = this.state;
        const viewedVideos = this.state.listViewVideo ? this.state.listViewVideo : [];
        if (viewedVideos.findIndex(video => video == videoId) == -1) {
            viewedVideos.push(videoId);
            this.setState({ listViewVideo: viewedVideos });
        }
        if (viewedVideos.length == videos.length) {
            this.setState({ isView: true });
            this.props.viewLesson(lessonId, subjectId, courseId, true);
        }
    }

    onStateChange(event, videoId) {
        const { lessonId, subjectId, courseId, listViewVideo } = this.state;
        const listPlayedVideo = this.state.listPlayedVideo;
        if (event.data == 1) {
            if (listViewVideo && listViewVideo.findIndex(viewedVideo => viewedVideo == videoId) != -1) {
                $('#' + videoId).text('Đã hoàn thành').css('color', 'green');
            } else {
                let time = 0,
                    hours = 0,
                    minutes = 0,
                    seconds = 0;
                this.intervalVideo = setInterval(() => {
                    time = event.target.getDuration() - event.target.getCurrentTime();
                    hours = parseInt(time / 3600) % 24;
                    minutes = parseInt(time / 60) % 60;
                    seconds = (time % 60).toFixed(0);
                    $('#' + videoId).text((hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)).css('color', 'black');
                }, 1000);
            }
            listPlayedVideo[videoId] = event;
            this.setState({ listIdPlayedVideo });
            const listIdPlayedVideo = Object.keys(listPlayedVideo);
            listIdPlayedVideo.forEach(id => {
                if (id != videoId) {
                    listPlayedVideo[id] && listPlayedVideo[id].target.stopVideo();
                }
            });
        } else if (event.data == 2 || event.data == 0) {
            clearInterval(this.intervalVideo);
            if (event.data == 0) {
                this.props.viewVideo(lessonId, subjectId, courseId, videoId);
                $('#' + videoId).text('Đã hoàn thành').css('color', 'green');
            }

            this.intervalVideo = null;
        }
    }

    onHandleRatingCourse = (e,rate)=>{
        e.preventDefault();
        if(rate) T.alert('Bạn đã thực hiện đánh giá rồi!', 'error', false, 2000);
        else{
            this.modal.show();
        }
    }
    render() {
        const { lessonId, subjectId, title, courseId, tienDoHocTap, isView, listViewVideo, monThucHanh, nextLesson } = this.state,
            lesson = this.props.lesson && this.props.lesson.item,
            videos = lesson && lesson.videos ? lesson.videos : [],
            taiLieuThamKhao = lesson && lesson.taiLieuThamKhao,
            rate = this.props.rate && this.props.rate.item,
            isShowRating = tienDoHocTap && tienDoHocTap[lessonId] || (lesson && lesson.questions && !lesson.questions.length),
            videosRender = videos.length ? videos.map((video, index) => (
                <div key={index} className=' pb-5'>
                    <div className='d-flex justify-content-center'>
                        <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }} >
                            <YouTube opts={{ playerVars: { 'autoplay': 0, 'disablekb': 1, 'controls': ((listViewVideo && (listViewVideo.findIndex(viewVideo => viewVideo == video._id) != -1)) || !(isView === 'false')) ? 1 : 0, 'rel': 0, 'modestbranding': 1, 'showinfo': 0 } }} videoId={video.link} containerClassName='embed embed-youtube' onEnd={(e) => this.onEnd(e)} onStateChange={(e) => this.onStateChange(e, video._id)} />
                        </div>
                    </div>
                    <p id={video._id} className='text-center' ></p>
                </div>
            )) : 'Chưa có video bài giảng!';
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId;
        if (tienDoHocTap && tienDoHocTap[lessonId]) {
            $('#' + tienDoHocTap[lessonId].rating).prop('checked', true);
        }
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user'
        };
        const imgSrc = this.state.imageSrc;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Bài học: ' + (title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Bài học'],
            content: lessonId ? <>
                <div className='tile'>
                    <span className='invisible float-left' style={{ marginRight: '-240px' }}>
                        <Webcam
                            audio={false}
                            height={240}
                            ref={e => this.webcam = e}
                            screenshotFormat='image/jpeg'
                            width={240}
                            videoConstraints={videoConstraints}
                        />
                    </span>
                    {imgSrc && (<img className='d-none' id='img' src={imgSrc}></img>)}
                    <div className='d-flex justify-content-between'>
                        <a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/thong-tin/' + lessonId} style={{ color: 'black' }}><h5>Thông tin bài học</h5></a>
                        <h3 id='time' ref={e => this.time = e}></h3>
                    </div>
                    <h3 className='tile-title'>Bài giảng</h3>
                    <div className='tile-body'>
                        {videosRender}
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {taiLieuThamKhao != '' ?
                                <div><a href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/tai-lieu/' + lessonId} className='btn btn-success' ><div>Tài liệu học tập</div></a></div>
                                : null}
                            {(monThucHanh || (lesson && lesson.questions && !lesson.questions.length)) ?
                                <div className=''>
                                    {(!(isView === 'false') || listViewVideo && listViewVideo.length == videos.length) && nextLesson ?
                                        <a className={'btn btn-warning ml-5'} href={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/' + nextLesson._id}>
                                            <i className='fa fa-lg fa-arrow-right' /> Sang bài tiếp theo
                                        </a> :
                                        <button className='btn btn-secondary' onClick={() => T.alert('Thời gian học của bạn chưa đạt yêu cầu để sang bài tiếp theo!', 'error', false, 8000)}>Sang bài tiếp theo</button>}
                                </div> :
                                ((!(isView === 'false') || listViewVideo && listViewVideo.length == videos.length) ?
                                    <Link to={'/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/cau-hoi/' + lessonId} className='btn btn-warning'>Câu hỏi ôn tập</Link>
                                    : <button className='btn btn-secondary' onClick={() => T.alert('Bạn vui lòng hoàn thành các bài học để được mở khoá!', 'error', false, 8000)}>Câu hỏi ôn tập</button>)}
                        </div>
                    </div>
                    <div className='tile-footer' >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div className={isShowRating ? 'visible' : 'invisible'}>
                                {!rate && <button className='btn btn-primary mb-2' onClick={(e) => this.onHandleRatingCourse(e,rate)}>Đánh giá bài học</button>}
                                {rate && <h5>Đã đánh giá:   <span className='text-warning'>{rate.value + ' sao'}</span></h5>}
                                <RateModal ref={e => this.modal = e} title='Đánh giá bài giảng' type='lesson' _refId={lessonId} />
                            </div>
                        </div>
                    </div>
                </div>
                <ConfirmModal ref={e => this.confirmModal = e} logout={this.props.logout} readOnly={false} />
                <div className='tile'>
                    <div className='tile-body'><CommentSection refParentId={courseId} refId={lessonId} /></div>
                </div>
            </> : null,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson, rate: state.framework.rate });
const mapActionsToProps = { getLessonByStudent, getStudentScore, viewLesson, timeLesson, getSubjectByStudent, viewVideo, getCaptureSetting, savePhoto, logout };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);