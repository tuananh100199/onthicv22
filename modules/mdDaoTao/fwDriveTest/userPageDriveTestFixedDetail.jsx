import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDriveTestFixedQuestions, checkDriveTestFixedScore } from 'modules/mdDaoTao/fwDriveTest/redux';
import { updateDriveQuestion } from 'modules/mdDaoTao/fwDriveQuestion/redux';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import 'view/component/input.scss';

const backRoute = '/user/hoc-vien/khoa-hoc/bo-de-co-dinh/:_id';
class UserPageDriveTestFixedDetail extends AdminPage {
    state = { showSubmitButton: true, showTotalScore: false };
    componentDidMount() {
        window.addEventListener('keydown', this.logKey);
        T.ready(backRoute, () => {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/bo-de-co-dinh/:_id/:_index'),
                params = route.parse(window.location.pathname);
            this.props.getDriveTestFixedQuestions(params._id, params._index, data => {
                if (data.list) {
                    const  questions  = data.list;
                    if (questions && questions.length == 1) {
                        this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
                    } else {
                        this.setState({ prevButton: 'invisible' });
                    }
                    const activeQuestion = questions ? questions[0] : null;
                    this.setState({ activeQuestionIndex: 0, questions, courseType: params._id });
                    this.itemIsImportance && this.itemIsImportance.value(activeQuestion ? activeQuestion.importance : false);
                    let minutes = 60;
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
                } else {
                    this.props.history.push(backRoute);
                }
            });
        });
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.logKey);
        clearInterval(window.interval);
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
        e && e.preventDefault();
        this.props.checkDriveTestFixedScore(this.state.studentAnswer, this.state.courseType, result => {
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
            if (this.state.questions && this.state.questions.length == 1) {
                this.setState({ prevButton: 'invisible', nextButton: 'invisible' });
            } else {
                this.setState({ prevButton: 'invisible', nextButton: 'visible' });
            }
            $('#submit-btn').addClass('btn-secondary');
            $('input[name="' + questionId + '"]').prop('checked', false);
        }, 50);
    }

    changeQuestion = (e, index) => {
        const questions = this.state.questions ? this.state.questions : [],
            activeQuestion = this.state.questions[index],
            questionId = activeQuestion ? activeQuestion._id : null,
            prevStudentAnswer = this.state.studentAnswer[questions[this.state.activeQuestionIndex]._id];
        e.preventDefault();
        if (prevStudentAnswer) {
            this.setState(prevState => ({
                prevAnswers: { ...prevState.prevAnswers, [questions[this.state.activeQuestionIndex]._id]: prevStudentAnswer },
                prevTrueAnswers: { ...prevState.prevTrueAnswers, [questions[this.state.activeQuestionIndex]._id]: questions[this.state.activeQuestionIndex].trueAnswer },
            }));
        }
        this.setState({ activeQuestionIndex: index }, () => {
            if (activeQuestion) {
                this.itemIsImportance && this.itemIsImportance.value(activeQuestion ? activeQuestion.importance : false);
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
        const { questions, courseType } = this.state ? this.state : { questions: [] };
        const userPageLink = `/user/hoc-vien/khoa-hoc/bo-de-co-dinh/${courseType}`;
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevTrueAnswers, prevAnswers, showSubmitButton, showTotalScore, score } = this.state;
        if (questions && questions.length == 1) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        } else if (activeQuestionIndex == 0) {
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true);
        }

        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + (this.state.title || 'Bộ đề cố định chi tiết'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bộ đề thi thử</Link>, this.state.title],
            backRoute: userPageLink,
            content: questions && questions.length ?
                <div className='tile'>
                    <div className='tile-header row'>
                        <div className='col-md-8'>{questions.map((question, index) => (<span key={index} style={{ cursor: 'pointer' }} onClick={e => this.changeQuestion(e, index)}><i className={'fa fa-square ' + (prevAnswers && prevTrueAnswers && prevAnswers[question._id] ? (prevAnswers[question._id] == prevTrueAnswers[question._id] ? 'text-primary' : 'text-danger') : 'text-secondary')} aria-hidden='true'></i>&nbsp;&nbsp;</span>))}</div>
                        <h3 className='col-md-2' id='time'></h3>
                        <FormCheckbox ref={e => this.itemIsImportance = e} className='col-md-2' style={{ color: 'red', fontSize: 'large', fontWeight: 'bold' }} label='CÂU DỄ SAI' onChange={active => this.props.updateDriveQuestion({ _id: activeQuestion && activeQuestion._id }, { importance: active })}/>
                    </div>
                    <div className='tile-body row'>
                        {activeQuestion ? (
                            <div className='col-md-12 pb-5' style={{ fontFamily: activeQuestion.categories[0] == '606ab9b7c3722d33582125fd' ? 'VNI-Aptima' : 'Times New Roman', fontSize: '25px' }}>
                                <h6 style={{ fontSize: '25px' }}>{activeQuestionIndex + 1 + '/' + questions.length}: {activeQuestion.title}</h6>
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
                                    <li className={'page-item ' + this.state.prevButton} >
                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true' /> Câu trước</a>
                                    </li>
                                    <li className={'page-item ' + this.state.nextButton}>
                                        <a role='button' className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true' /></a>
                                    </li>
                                </ul>
                            </nav>
                            <div>
                                {showTotalScore ?
                                    <h4 style={{ marginLeft: '15px' }}>Số câu đúng của bạn: <b className='text-danger' >{score} / {questions && questions.length}</b></h4>
                                    : null}
                                <div style={{ float: 'right', marginRight: '10px' }}>
                                    {showSubmitButton ?
                                        <button className='btn btn-lg' id='submit-btn' disabled={!(this.state.studentAnswer && Object.keys(this.state.studentAnswer).length == questions.length)} onClick={e => this.submitAnswer(e)} >
                                            <i className='fa fa-lg fa-paper-plane-o' /> Nộp bài
                                        </button> :
                                        <button className='btn btn-lg btn-info' onClick={e => this.resetQuestion(e, questions[0]._id)} disabled={false}>
                                            <i className='fa fa-lg fa-refresh' /> Làm lại
                                        </button>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div> : <div className='tile'>Không có dữ liệu</div>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.trainning.driveTest });
const mapActionsToProps = { getDriveTestFixedQuestions, checkDriveTestFixedScore, updateDriveQuestion };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTestFixedDetail);
