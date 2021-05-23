import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDriveTestItemByStudent, checkDriveTestScore } from 'modules/mdDaoTao/fwDriveTest/redux';
import { AdminPage } from 'view/component/AdminPage';
import 'view/component/input.scss';

const backRoute = '/user/hoc-vien/khoa-hoc/bo-de-thi-thu';
class UserPageDriveTestDetail extends AdminPage {
    state = { showSubmitButton: true, showTotalScore: false };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        T.ready(backRoute, () => {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getDriveTestItemByStudent(params._id, data => {
                if (data.item) {
                    const { _id, title, questions } = data.item;
                    this.setState({ activeQuestionIndex: 0, _id, title, questions });
                } else {
                    this.props.history.push(backRoute);
                }
            });
        });
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
            }));
        } else if (e.code.startsWith('Numpad') && e.code.slice(6) < this.state.questions.length + 2 && !(this.state.prevAnswers && this.state.prevTrueAnswers)) {
            $('#' + questionId + (e.code.slice(6) - 1)).prop('checked', true);
            this.setState(prevState => ({
                studentAnswer: { ...prevState.studentAnswer, [questionId]: $('input[name=' + questionId + ']:checked').val() },
                prevAnswers: { ...prevState.prevAnswers, [questionId]: null }
            }));
        } else if (e.code == 'Enter') {
            !this.state.showSubmitButton ? this.resetQuestion(e)
                : (activeQuestionIndex == this.state.questions.length - 1) && this.submitAnswer(e);
        }
    }

    submitAnswer = (e) => {
        e.preventDefault();
        this.props.checkDriveTestScore(this.state._id, this.state.studentAnswer, result => {
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

    resetQuestion = (e, questionId) => {
        e.preventDefault();
        this.setState({
            activeQuestionIndex: 0,
            prevAnswers: null,
            prevTrueAnswers: null,
            showSubmitButton: true,
            showTotalScore: false
        });
        setTimeout(() => {
            $('#submit-btn').addClass('btn-secondary').attr('disabled', true);
            $('#next-btn').css({ 'visibility': 'visible' });
            $('input[name="' + questionId + '"]').prop('checked', false);
        }, 50);
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
        }));
    }
    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/bo-de-thi-thu';
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevTrueAnswers, prevAnswers, showSubmitButton, showTotalScore, score } = this.state;

        if (questions && questions.length == 1) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            $('#next-btn').css({ 'visibility': 'hidden' });
            $('#submit-btn').addClass('btn-success').removeAttr('disabled', true);
        } else if (activeQuestionIndex == 0) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            $('#submit-btn').addClass('btn-secondary').attr('disabled', true);
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == questions.length - 1) {
            $('#next-btn').css({ 'visibility': 'hidden' });
            $('#submit-btn').removeClass('btn-secondary').addClass('btn-success').removeAttr('disabled', true);
        } else {
            $('#prev-btn').css({ 'visibility': 'visible' });
            $('#next-btn').css({ 'visibility': 'visible' });
            $('#submit-btn').addClass('btn-secondary').removeClass('btn-success').attr('disabled', true);
        }
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bộ đề thi thử</Link>, this.state.title],
            backRoute: userPageLink,
            content: (<>
                <div className='tile'>
                    <div className='tile-body row'>
                        {activeQuestion ? (
                            <div className='col-md-12 pb-5'>
                                <h6>Câu hỏi {activeQuestionIndex + 1 + '/' + questions.length}: {activeQuestion.title}</h6>
                                {activeQuestion.image ? <img src={activeQuestion.image} alt='question' style={{ width: '50%', height: 'auto', display: 'block', margin: 'auto', padding: '50px 0px' }} /> : null}
                                <div className='form-check'>
                                    {activeQuestion.answers.split('\n').map((answer, index) => (
                                        <div key={index} className='custom-control custom-radio' style={{ paddingBottom: '10px' }}>
                                            <input className='custom-control-input' type='radio' name={activeQuestion._id} id={activeQuestion._id + index} value={index} onChange={e => this.onAnswerChanged(e, activeQuestion._id)} />

                                            <label className={'custom-control-label ' +
                                                (prevTrueAnswers && prevAnswers && prevTrueAnswers[activeQuestion._id] == prevAnswers[activeQuestion._id] && prevAnswers[activeQuestion._id] == index ? 'text-success valid ' :
                                                    (prevTrueAnswers && prevTrueAnswers[activeQuestion._id] == index ? 'text-success ' :
                                                        (prevAnswers && prevAnswers[activeQuestion._id] == index ? 'text-danger invalid' : '')))
                                            } htmlFor={activeQuestion._id + index} >
                                                {answer}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <div style={{ width: '100%' }}>
                            <nav aria-label='...' style={{ display: 'flex', justifyContent: 'center' }}>
                                <ul className='pagination'>
                                    <li className='page-item' id='prev-btn'>
                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' /> Câu trước</a>
                                    </li>
                                    <li className='page-item' id='next-btn'>
                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                    </li>
                                </ul>
                            </nav>
                            <div>
                                {showTotalScore ?
                                    <h4 id='totalScore' style={{ marginLeft: '15px' }}>Số câu đúng của bạn: <b className='text-danger' >{score} / {questions && questions.length}</b></h4>
                                    : null}
                                <div style={{ float: 'right', marginRight: '10px' }}>
                                    {showSubmitButton ?
                                        <button className='btn btn-lg' id='submit-btn' onClick={e => this.submitAnswer(e)} >
                                            <i className='fa fa-lg fa-paper-plane-o' /> Nộp bài
                                        </button> :
                                        <button className='btn btn-lg btn-info' id='refresh-btn' onClick={e => this.resetQuestion(e, questions[0]._id)} disabled={false}>
                                            <i className='fa fa-lg fa-refresh' /> Làm lại
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getDriveTestItemByStudent, checkDriveTestScore };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestDetail);
