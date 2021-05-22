import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent, checkQuestion, resetStudentScore } from './redux';
import { getStudentScore } from '../fwStudent/redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import 'view/component/input.scss';

class adminEditPage extends AdminPage {
    state = { showSubmitButton: true, showTotalScore: false };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/cau-hoi/:_id').parse(window.location.pathname);
        if (params._id) {
            this.setState({ lessonId: params._id, subjectId: params.subjectId, courseId: params.courseId });
            this.props.getLessonByStudent(params._id, params.courseId, params.subjectId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId + '/bai-hoc/' + params._id);
                } else if (data.item) {
                    this.props.getStudentScore(params.courseId, item => {
                        if (item) {
                            this.setState({
                                activeQuestionIndex: 0,
                                subjectId: params.subjectId,
                                courseId: params.courseId,
                                prevTrueAnswers: item[params.subjectId][params._id] ? item[params.subjectId][params._id].trueAnswers : null,
                                prevAnswers: item[params.subjectId][params._id] ? item[params.subjectId][params._id].answers : null,
                                showSubmitButton: item[params.subjectId][params._id] ? false : true
                            });
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    const { _id, title, shortDescription, detailDescription, questions } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription, questions });
                } else {
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId + '/bai-hoc/' + params._id);
                }
            });
        } else {
            this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId + '/bai-hoc/' + params._id);
        }
    }

    componentWillUnmount() {
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
        } else if (e.code.startsWith('Digit') && e.code.slice(5) < this.state.questions.length + 2 && !(this.state.prevAnswers && this.state.prevTrueAnswers)) {
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
                : (activeQuestionIndex == this.state.questions.length - 1) && this.submitAnswer(e);
        }
    }

    submitAnswer = (e) => {
        e.preventDefault();
        this.props.checkQuestion(this.state.lessonId, this.state.subjectId, this.state.courseId, this.state.studentAnswer, result => {
            T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
            this.setState({
                prevTrueAnswers: result.trueAnswer,
                prevAnswers: result.answers,
                score: result.score,
                showSubmitButton: false,
                showTotalScore: true

            });
        });
    }

    resetQuestion = (e) => {
        e.preventDefault();
        const { lessonId, subjectId, courseId } = this.state;
        this.props.resetStudentScore(lessonId, subjectId, courseId);
        this.props.getLessonByStudent(lessonId, courseId, subjectId, data => {
            if (data.error) {
                T.notify('Lấy bài học bị lỗi!', 'danger');
                this.props.history.push('/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/' + lessonId);
            } else if (data.item) {
                T.ready('/user/hoc-vien/khoa-hoc/' + courseId);
                const { _id, title, shortDescription, detailDescription, questions } = data.item;
                this.setState({
                    _id, title, shortDescription, detailDescription, questions,
                    prevAnswers: null,
                    prevTrueAnswers: null,
                    showSubmitButton: true,
                    showTotalScore: false,
                    activeQuestionIndex: 0,
                    studentAnswer: null
                });
                setTimeout(() => {
                    $('#submit-btn').addClass('btn-secondary');
                    $('input[name="' + this.state.questions[0]._id + '"]').prop('checked', false);
                }, 50);
            } else {
                this.props.history.push('/user/hoc-vien/khoa-hoc/' + courseId + '/mon-hoc/' + subjectId + '/bai-hoc/' + lessonId);
            }
        });
    }

    changeQuestion = (e, index) => {
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
            }
        });
    }

    onAnswerChanged = (e, questionId) => {
        this.setState(prevState => ({
            studentAnswer: { ...prevState.studentAnswer, [questionId]: $('input[name=' + questionId + ']:checked').val() },
            prevAnswers: { ...prevState.prevAnswers, [questionId]: null }
        }), () => {
            if (Object.keys(this.state.studentAnswer).length == this.state.questions.length) {
                !this.state.result && $('#submit-btn').removeClass('btn-secondary').addClass('btn-success');
            } else {
                $('#submit-btn').addClass('btn-secondary');
            }
        });
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId + '/bai-hoc/' + this.state.lessonId;
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevTrueAnswers, prevAnswers, showSubmitButton, showTotalScore, score } = this.state;
        if (questions && questions.length == 1) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            $('#next-btn').css({ 'visibility': 'hidden' });
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == 0) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == questions.length - 1) {
            $('#next-btn').css({ 'visibility': 'hidden' });
        } else {
            $('#prev-btn').css({ 'visibility': 'visible' });
            $('#next-btn').css({ 'visibility': 'visible' });
            // $('#submit-btn').addClass('btn-secondary').removeClass('btn-success').attr('disabled', true);
        }
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bài học</Link>, 'Câu hỏi ôn tập'],
            content: (<>
                {questions && questions.length ? (
                    <div className='tile'>
                        <div className='tile-header'>
                            {questions.map((question, index) => (<span key={index} style={{ cursor: 'pointer' }} onClick={e => this.changeQuestion(e, index)}><i className={'fa fa-square ' + (prevAnswers && prevTrueAnswers && prevAnswers[question._id] ? (prevAnswers[question._id] == prevTrueAnswers[question._id] ? 'text-primary' : 'text-danger') : 'text-secondary')} aria-hidden='true'></i>&nbsp;&nbsp;</span>))}
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
                                        <li className='page-item' id='prev-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' />Câu trước</a>
                                        </li>
                                        <li className='page-item' id='next-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                        </li>
                                        {showSubmitButton ?
                                            <button className='btn btn-secondary' disabled={!(this.state.studentAnswer && Object.keys(this.state.studentAnswer).length == questions.length)} id='submit-btn' onClick={e => this.submitAnswer(e)} >
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
            </>),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson });
const mapActionsToProps = { getLessonByStudent, checkQuestion, getStudentScore, resetStudentScore };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);