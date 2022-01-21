import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createRandomSubjectTest, checkRandomSubjectTest, resetStudentSubjectScore } from './redux';
import { getStudentSubjectScore } from '../fwStudent/redux';
import { getCaptureSetting, savePhoto, logout } from 'modules/_default/_init/redux';
import { AdminPage, AdminModal } from 'view/component/AdminPage';
import 'view/component/input.scss';
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
class UserPageRandomDriveTestDetail extends AdminPage {
    state = { showSubmitButton: true, showTotalScore: false, prevButton: 'visible', nextButton: 'visible' };
    intervalFaceDetect;
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/thi-het-mon/:_id').parse(window.location.pathname);
        if (params._id) {
            this.setState({ subjectId: params._id, courseId: params.courseId });
            this.props.createRandomSubjectTest(params._id, params.courseId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId);
                } else if (data.driveTest) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    const { questions } = data.driveTest;
                    if (questions && questions.length == 1) {
                        this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                    } else {
                        this.setState({ prevButton: 'invisible' });
                    }
                    this.props.getStudentSubjectScore(params.courseId, item => {
                        if (item) {
                            this.setState({
                                activeQuestionIndex: 0,
                                prevTrueAnswers: item[params._id] && item[params._id].trueAnswers ? item[params._id].trueAnswers : null,
                                prevAnswers: item[params._id] && item[params._id].answers ? item[params._id].answers : null,
                                showSubmitButton: item[params._id] && item[params._id].answers ? false : true
                            });
                        }
                    });
                    setTimeout(() => {
                        const user = this.props.system && this.props.system.user;
                        const imageSrc = this.webcam.getScreenshot();
                        this.props.savePhoto(imageSrc, user._id, 'exam');
                    }, 1000);
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
                                                this.props.savePhoto(imageSrc, user._id, 'exam');
                                            }
                                            else {
                                                this.setState(prevState => ({
                                                    faceDetect: prevState.faceDetect ? prevState.faceDetect + 1 : 1
                                                }), () => {
                                                    if (this.state.faceDetect > 2) {
                                                        this.confirmModal.show();
                                                    }
                                                });
                                            }
                                        });
                                    });
                                });
                            }, 60000 * numberOfMinScreenCapture);
                        }
                    });
                    this.setState({ activeQuestionIndex: 0, questions });
                    if (data.driveTest.totalTime) {
                        let minutes = data.driveTest.totalTime;
                        let seconds = 0;
                        window.interval = setInterval(() => {
                            --seconds;
                            minutes = (seconds < 0) ? --minutes : minutes;
                            seconds = (seconds < 0) ? 59 : seconds;
                            seconds = (seconds < 10) ? '0' + seconds : seconds;
                            $('#time').text(minutes + ':' + seconds);
                            if (minutes < 0) clearInterval(window.interval);
                            if ((seconds <= 0) && (minutes <= 0)) {
                                clearInterval(window.interval);
                                this.submitAnswer();
                            }
                        }, 1000);
                    }

                } else {
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId);
                }
            });
        } else {
            this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId);
        }
    }

    componentWillUnmount() {
        // const {lessonId,subjectId,courseId,totalSeconds} = this.state;
        clearInterval(window.interval);
        clearInterval(this.intervalFaceDetect);
        // this.props.timeLesson(lessonId, subjectId, courseId, totalSeconds);
        window.removeEventListener('keydown', this.logKey);
    }

    logKey = (e) => {
        const activeQuestionIndex = this.state.activeQuestionIndex,
            maxIndex = this.state.questions.length - 1,
            questionId = this.state.questions && this.state.questions[activeQuestionIndex] && this.state.questions[activeQuestionIndex]._id;
        if (e.code == 'ArrowRight' && activeQuestionIndex < maxIndex) {
            this.changeQuestion(e, this.state.activeQuestionIndex + 1);
        } else if (e.code == 'ArrowLeft' && activeQuestionIndex > 0) {
            this.changeQuestion(e, this.state.activeQuestionIndex - 1);
        } else if (e.code.startsWith('Digit') && e.code.slice(5) < (this.state.questions[activeQuestionIndex].answers.split('\n').length + 1) && !(this.state.prevAnswers && this.state.prevTrueAnswers)) {
            $('#' + questionId + (e.code.slice(5) - 1)).prop('checked', true);
            this.setState(prevState => ({
                studentAnswer: { ...prevState.studentAnswer, [questionId]: $('input[name=' + questionId + ']:checked').val() },
                prevAnswers: { ...prevState.prevAnswers, [questionId]: null }
            }), () => {
                if (Object.keys(this.state.studentAnswer).length == this.state.questions.length) {
                    !this.state.result && $('#submit-btn').removeClass('btn-secondary').addClass('btn-success').removeAttr('disabled', true);
                } else {
                    $('#submit-btn').addClass('btn-secondary');
                }
            });
        } else if (e.code == 'Enter') {
            !this.state.showSubmitButton ? this.resetQuestion(e)
                : (this.state.studentAnswer && Object.keys(this.state.studentAnswer).length == this.state.questions.length) && this.submitAnswer(e);
        }
    }

    submitAnswer = (e) => {
        e.preventDefault();
        this.props.checkRandomSubjectTest(this.state.subjectId, this.state.courseId, this.state.studentAnswer, result => {
            T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
            this.setState({
                prevTrueAnswers: result.trueAnswer,
                prevAnswers: result.answers,
                score: result.score,
                showSubmitButton: false,
                showTotalScore: true

            });
            clearInterval(window.interval);
        });
    }

    resetQuestion = (e) => {
        e.preventDefault();
        const { subjectId, courseId } = this.state;
        this.props.resetStudentSubjectScore(subjectId, courseId, () => {
            this.props.createRandomSubjectTest(subjectId, courseId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId);
                } else if (data.driveTest) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + courseId);
                    const { questions } = data.driveTest;
                    if (questions && questions.length == 1) {
                        this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                    } else {
                        this.setState({ prevButton: 'invisible', nextButton: 'visible' });
                    }
                    this.setState({
                        prevAnswers: null,
                        prevTrueAnswers: null,
                        showSubmitButton: true,
                        showTotalScore: false,
                        activeQuestionIndex: 0,
                        studentAnswer: null,
                        questions
                    });
                    if (data.driveTest.totalTime) {
                        let minutes = data.driveTest.totalTime;
                        let seconds = 0;
                        window.interval = setInterval(() => {
                            --seconds;
                            minutes = (seconds < 0) ? --minutes : minutes;
                            seconds = (seconds < 0) ? 59 : seconds;
                            seconds = (seconds < 10) ? '0' + seconds : seconds;
                            $('#time').text(minutes + ':' + seconds);
                            if (minutes < 0) clearInterval(window.interval);
                            if ((seconds <= 0) && (minutes <= 0)) {
                                clearInterval(window.interval);
                                this.submitAnswer();
                            }
                        }, 1000);
                    }
                } else {
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId);
                }
            });
        });

    }

    changeQuestion = (e, index) => {
        const questions = this.state.questions ? this.state.questions : [];
        e.preventDefault();
        this.setState({ activeQuestionIndex: index }, () => {
            const activeQuestion = this.state.questions[index],
                questionId = activeQuestion ? activeQuestion._id : null;
            if (activeQuestion) {
                if (this.state.prevAnswers && this.state.prevAnswers[questionId]) {
                    $('#' + questionId + this.state.prevAnswers[questionId]).prop('checked', true);
                    this.setState(prevState => ({
                        studentAnswer: { ...prevState.studentAnswer, [questionId]: $('input[name=' + questionId + ']:checked').val() }
                    }));
                } else {
                    if (this.state.studentAnswer && this.state.studentAnswer[activeQuestion._id]) {
                        $('#' + questionId + this.state.studentAnswer[activeQuestion._id]).prop('checked', true);
                    } else {
                        $('input[name="' + questionId + '"]').prop('checked', false);
                    }
                }
                if (index == 0 && questions.length != 1) {
                    this.setState({ prevButton: 'invisible', nextButton: 'visible' });
                } else if (questions.length == 2 && index == 1) {
                    this.setState({ prevButton: 'visible', nextButton: 'invisible' });
                } else if (index == questions.length - 1) {
                    this.setState({ nextButton: 'invisible' });
                } else {
                    this.setState({ nextButton: 'visible', prevButton: 'visible' });
                }
            }
        });
    }

    onAnswerChanged = (e, questionId) => {
        this.setState(prevState => ({
            studentAnswer: { ...prevState.studentAnswer, [questionId]: $('input[name=' + questionId + ']:checked').val() },
            prevAnswers: { ...prevState.prevAnswers, [questionId]: null }
        }), () => {
            if (Object.keys(this.state.studentAnswer).length == this.state.questions.length) {
                if (!this.state.result) {
                    this.submitButton.classList.remove('btn-secondary');
                    this.submitButton.classList.add('btn-success');
                }
            } else {
                this.submitButton.classList.add('btn-secondary');
            }
        });
    }

    render() {
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevTrueAnswers, prevAnswers, showSubmitButton, showTotalScore, score, subjectId, courseId } = this.state;
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId;
        if (questions && questions.length == 1) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == 0) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        }
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: 'user'
        };
        const imgSrc = this.state.imageSrc;
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Đề thi hết môn',
            breadcrumb: [<Link key={0} to={userPageLink}>Môn học</Link>, 'Đề thi hết môn'],
            content: (<>
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
                {questions && questions.length ? (
                    <div className='tile'>
                        <div className='tile-header d-flex justify-content-between'>
                            <div>
                                {questions.map((question, index) => (<span key={index} style={{ cursor: 'pointer' }} onClick={e => this.changeQuestion(e, index)}><i className={'fa fa-square ' + (prevAnswers && prevTrueAnswers && prevAnswers[question._id] ? (prevAnswers[question._id] == prevTrueAnswers[question._id] ? 'text-primary' : 'text-danger') : 'text-secondary')} aria-hidden='true'></i>&nbsp;&nbsp;</span>))}
                            </div>
                            <h3 id='time' ref={e => this.time = e}></h3>
                        </div>
                        <div className='tile-body row'>
                            {activeQuestion ? (
                                <div className='col-md-12 pb-5'>
                                    <div className='row'>
                                        <div className='col-md-8'>
                                            <h6>Câu hỏi {activeQuestionIndex + 1 + '/' + questions.length}: </h6>
                                            <h6>{activeQuestion.title}</h6>
                                        </div>
                                    </div>
                                    {activeQuestion.image ? <img src={activeQuestion.image} alt='question' style={{ width: 'auto', height: '300px', display: 'block', margin: 'auto', padding: '15px 0px' }} /> : null}
                                    <div className='form-check'>
                                        {activeQuestion.answers.split('\n').map((answer, index) => (
                                            <div key={index} className='custom-control custom-radio' style={{ paddingBottom: '10px' }}>
                                                <input className='custom-control-input' type='radio' name={activeQuestion._id} id={activeQuestion._id + index} value={index} disabled={prevAnswers && prevTrueAnswers} onChange={e => this.onAnswerChanged(e, activeQuestion._id)} />

                                                <label className={'custom-control-label ' +
                                                    (prevTrueAnswers && prevAnswers && prevTrueAnswers[activeQuestion._id] == prevAnswers[activeQuestion._id] && prevAnswers[activeQuestion._id] == index ? 'text-success valid ' :
                                                        (prevTrueAnswers && prevTrueAnswers[activeQuestion._id] == index ? 'text-success ' :
                                                            (prevAnswers && prevAnswers[activeQuestion._id] == index ? 'text-danger invalid' : '')))
                                                } htmlFor={activeQuestion._id + index} style={{ cursor: 'pointer' }} >
                                                    {answer}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>) : null}
                        </div>
                        <div className='tile-footer row' style={{ display: 'flex', justifyContent: 'space-around' }}>
                            {showTotalScore ?
                                <h4 id='totalScore' style={{ marginLeft: '15px' }}>Số câu đúng của bạn: <b className='text-danger' >{score} / {questions && questions.length}</b></h4>
                                : null}
                            <div>
                                <nav aria-label='...' >
                                    <ul className='pagination'>
                                        <li className={'page-item ' + this.state.prevButton} id='prev-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' />Câu trước</a>
                                        </li>
                                        <li className={'page-item ' + this.state.nextButton} id='next-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                        </li>
                                        {showSubmitButton ?
                                            <button className='btn btn-secondary' ref={e => this.submitButton = e} disabled={!(this.state.studentAnswer && Object.keys(this.state.studentAnswer).length == questions.length)} id='submit-btn' onClick={e => this.submitAnswer(e)} >
                                                <i className='fa fa-lg fa-paper-plane-o' /> Nộp bài
                                            </button> :
                                            <button className='btn btn-info' id='refresh-btn' onClick={e => this.resetQuestion(e)} disabled={false}>
                                                <i className='fa fa-lg fa-refresh' /> Làm lại
                                            </button>}
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                ) : <div className='tile'>Không có câu hỏi</div>}
                <ConfirmModal ref={e => this.confirmModal = e} logout={this.props.logout} readOnly={false} />
            </>),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { createRandomSubjectTest, checkRandomSubjectTest, getStudentSubjectScore, resetStudentSubjectScore, getCaptureSetting, savePhoto, logout };
export default connect(mapStateToProps, mapActionsToProps)(UserPageRandomDriveTestDetail);
