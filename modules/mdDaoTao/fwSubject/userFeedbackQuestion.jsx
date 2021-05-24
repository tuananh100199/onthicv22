import React from 'react';
import { connect } from 'react-redux';
import { getSubjectByStudent, submitFeedback } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';
import 'view/component/input.scss';

class userFeedbackQuestion extends AdminPage {
    state = { showTotalScore: false, prevButton: 'visible', nextButton: 'visible' };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        const params = T.routeMatcher('/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/phan-hoi/:_id').parse(window.location.pathname);
        if (params._id) {
            this.setState({ subjectId: params._id, courseId: params.courseId });
            this.props.getSubjectByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId + '/bai-hoc/' + params._id);
                } else if (data.item) {
                    T.ready('/user/hoc-vien/khoa-hoc/' + params.courseId);
                    const { _id, title, shortDescription, detailDescription, questions } = data.item;
                    if (questions && questions.length == 1) {
                        this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                    } else {
                        this.setState({ prevButton: 'invisible' });
                    }
                    this.setState({ _id, title, shortDescription, detailDescription, questions, activeQuestionIndex: 0 });
                } else {
                    this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId);
                }
            });
        } else {
            this.props.history.push('/user/hoc-vien/khoa-hoc/' + params.courseId + '/mon-hoc/' + params.subjectId);
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
        } else if (e.code.startsWith('Digit') && e.code.slice(5) < (this.state.questions[activeQuestionIndex].answers.split('\n').length + 1)) {
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
            (activeQuestionIndex == this.state.questions.length - 1) && this.submitAnswer(e);
        }
    }

    submitAnswer = (e) => {
        e.preventDefault();
        this.props.submitFeedback(this.state.subjectId, this.state.courseId, this.state.studentAnswer, result => {
            T.alert('Cảm ơn bạn đã phản hồi!', 'success', false, 2000);
            this.setState({
                prevAnswers: result.answers,
                showTotalScore: true
            });
            setTimeout(() => {
                this.props.history.push('/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId);
            }, 1500);

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
                !this.state.result && $('#submit-btn').removeClass('btn-secondary').addClass('btn-success');
            } else {
                $('#submit-btn').addClass('btn-secondary');
            }
        });
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/mon-hoc/' + this.state.subjectId;
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevAnswers } = this.state;
        if (questions && questions.length == 1) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == 0) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        }
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bài học</Link>, 'Câu hỏi ôn tập'],
            content: (<>
                {questions && questions.length ? (
                    <div className='tile'>
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
                                                <input className='custom-control-input' type='radio' name={activeQuestion._id} id={activeQuestion._id + index} value={index} onChange={e => this.onAnswerChanged(e, activeQuestion._id)} />
                                                <label className='custom-control-label' htmlFor={activeQuestion._id + index} style={{ cursor: 'pointer' }} >
                                                    {answer}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>) : null}
                        </div>
                        <div className='tile-footer row' style={{ display: 'flex', justifyContent: 'space-around' }}>
                            <div>
                                <nav aria-label='...' >
                                    <ul className='pagination'>
                                        <li className={'page-item ' + this.state.prevButton} id='prev-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' />Câu trước</a>
                                        </li>
                                        <li className={'page-item ' + this.state.nextButton} id='next-btn'>
                                            <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                        </li>
                                        <button className='btn btn-secondary' disabled={!(this.state.studentAnswer && Object.keys(this.state.studentAnswer).length == questions.length)} id='submit-btn' onClick={e => this.submitAnswer(e)} >
                                            <i className='fa fa-lg fa-paper-plane-o' />Gửi câu hỏi phản hồi
                                        </button>
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
const mapActionsToProps = { getSubjectByStudent, submitFeedback };
export default connect(mapStateToProps, mapActionsToProps)(userFeedbackQuestion);