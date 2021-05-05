import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getDriveTestItemByStudent, checkDriveTestScore, getDriveTestScore } from 'modules/mdDaoTao/fwDriveTest/redux';
import { AdminPage } from 'view/component/AdminPage';
import '../../../view/component/input.scss';

const backRoute = '/user/hoc-vien/khoa-hoc/de-thi-thu';
class UserPageDriveTest extends AdminPage {
    state = { showSubmitButton: true };
    componentDidMount() {
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'),
                params = route.parse(window.location.pathname);
            this.props.getDriveTestItemByStudent(params._id, data => {
                if (data.item) {
                    this.props.getDriveTestScore(params._id, items => {
                        if (items) {
                            Object.entries(items).map(([key, value]) => {
                                if (data && data.currentTest == key) {
                                    this.setState({
                                        prevTrueAnswers: value.trueAnswers,
                                        prevAnswers: value.answers,
                                        importanceScore: value.importanceScore,
                                        score: value.score,
                                        showSubmitButton: value ? false : true
                                    });
                                }
                            });
                        }
                    });
                    T.ready('/user/hoc-vien/khoa-hoc/' + data.currentCourse);
                    const { _id, title, questions } = data.item;
                    this.setState({ _id, title, questions, _courseId: data.currentCourse });
                } else {
                    this.props.history.push(backRoute);
                }
                $('#totalScore').css('display', 'none');
                $('#trueAnswer').css('display', 'none');
            });
        });
    }
    submitAnswer = (e) => {
        e.preventDefault();
        this.props.checkDriveTestScore(this.state._id, this.state.studentAnswer, result => {
            T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
            this.setState({ result: result });
            $('#totalScore').css('display', 'block');
            $('#trueAnswer').css('display', 'block');
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
                    if (this.state.prevAnswers[questionId] == this.state.prevTrueAnswers[questionId]) {
                        $(':radio').click(() => false);
                    }
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

    onAnswerChanged = (e, _questionId) => {
        this.setState(prevState => ({
            studentAnswer: { ...prevState.studentAnswer, [_questionId]: $('input[name=' + _questionId + ']:checked').val() },
            prevAnswers: { ...prevState.prevAnswers, [_questionId]: null }
        }));
    }
    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state._courseId;
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const { score } = this.state.result ? this.state.result : { score: 0 };
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        const { prevTrueAnswers, prevAnswers, showSubmitButton } = this.state;

        if (questions && questions.length == 1) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            $('#next-btn').css({ 'visibility': 'hidden' });
            !this.state.result && $('#submit-btn').addClass('btn-success').removeAttr('disabled', true);
        } else if (activeQuestionIndex == 0) {
            $('#prev-btn').css({ 'visibility': 'hidden' });
            $('#submit-btn').addClass('btn-secondary').attr('disabled', true);
            activeQuestion && prevAnswers && prevAnswers[activeQuestion._id] && $('#' + activeQuestion._id + prevAnswers[activeQuestion._id]).prop('checked', true) && $(':radio').click(() => false);
        } else if (activeQuestionIndex == questions.length - 1) {
            $('#next-btn').css({ 'visibility': 'hidden' });
            !this.state.result && $('#submit-btn').removeClass('btn-secondary').addClass('btn-success').removeAttr('disabled', true);
        } else {
            $('#prev-btn').css({ 'visibility': 'visible' });
            $('#next-btn').css({ 'visibility': 'visible' });
            $('#submit-btn').addClass('btn-secondary').removeClass('btn-success').attr('disabled', true);
        }
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bộ đề thi</Link>, this.state.title],
            backRoute: userPageLink, 
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        {activeQuestion ?
                            (
                                <div className='col-md-12 pb-5'>
                                    <h6>Câu hỏi {activeQuestionIndex + 1 + '/' + questions.length}: {activeQuestion.title}</h6>
                                    {activeQuestion.image ? <img src={activeQuestion.image} alt='question' style={{ width: '50%', height: 'auto', display: 'block', margin: 'auto' }} /> : null}
                                    <div className='form-check'>
                                        {activeQuestion.answers.split('\n').map((answer, index) => (
                                            <div key={index} className='custom-control custom-radio'>
                                                <input className='custom-control-input'
                                                    type='radio'
                                                    name={activeQuestion._id}
                                                    id={activeQuestion._id + index}
                                                    value={index}
                                                    onChange={e => this.onAnswerChanged(e, activeQuestion._id)} />

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
                            ) : <></>
                        }
                    </div>
                    <div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <nav aria-label='...'>
                            <ul className='pagination'>
                                <li className='page-item' id='prev-btn'>
                                    <a className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex - 1)}><i className='fa fa-arrow-left' aria-hidden='true'></i> Câu trước</a>
                                </li>
                                <li className='page-item' id='next-btn'>
                                    <a className='page-link' onClick={e => this.changeQuestion(e, activeQuestionIndex + 1)}> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true'></i></a>
                                </li>
                            </ul>
                        </nav>
                        {showSubmitButton ?
                            <button className='btn btn-circle' id='submit-btn' onClick={e => this.submitAnswer(e)} data-toggle='tooltip' title='Chấm điểm' style={{ position: 'fixed', right: '10px', bottom: '10px', zIndex: 500 }}>
                                <i className='fa fa-lg fa-paper-plane-o' />
                            </button> :
                            <button className='btn btn-circle' id='refresh-btn' onClick={e => this.submitAnswer(e)} data-toggle='tooltip' title='Làm kiểm tra lại' style={{ position: 'fixed', right: '10px', bottom: '10px', zIndex: 500 }}>
                                <i className='fa fa-lg fa-refresh' />
                            </button>}
                        <p id='totalScore'>Số câu đúng của bạn: <b>{score} / {questions && questions.length}</b></p>
                    </div>
                </div>
            ),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getDriveTestItemByStudent, checkDriveTestScore, getDriveTestScore };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTest);
