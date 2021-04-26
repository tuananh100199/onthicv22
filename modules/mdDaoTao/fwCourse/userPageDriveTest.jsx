import React from 'react';
import { connect } from 'react-redux';
import { getDriveTestItem } from 'modules/mdDaoTao/fwDriveTest/redux';
import { checkDriveTestScore } from 'modules/mdDaoTao/fwDriveTest/redux';

import { AdminPage } from 'view/component/AdminPage';

const backRoute = '/user/hoc-vien/khoa-hoc/de-thi-thu'
class UserPageDriveTest extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getDriveTestItem(params._id, item => {
                if (item) {
                    this.setState(item);
                } else {
                    this.props.history.push(backRoute);
                }
            });
        });
    }

    submitAnswer = (e) => {
        e.preventDefault();
        if (this.state.studentAnswer) {
            this.props.checkDriveTestScore(this.state._id, this.state.studentAnswer, result => {
                $('#submit-btn').removeAttr('disabled');
                T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
                this.setState({ result: result })
            })
        } else {
            console.log('chưa có câu hỏi')
        }

    }
    changeQuestion = (e, index) => {
        e.preventDefault();
        this.setState({ activeQuestionIndex: index }, () => {
            const activeQuestion = this.state.questions[index],
                questionId = activeQuestion ? activeQuestion._id : null;
            if (activeQuestion) {
                if (this.state.studentAnswer && this.state.studentAnswer[activeQuestion._id]) {
                    $("#" + questionId + this.state.studentAnswer[activeQuestion._id]).prop("checked", true);
                } else {
                    $('input[name="' + questionId + '"]').prop('checked', false);
                }
            }
        });
    }
    onAnswerChanged = (e, _questionId) => {
        this.setState(prevState => ({
            studentAnswer: { ...prevState.studentAnswer, [_questionId]: $('input[name=' + _questionId + ']:checked').val() }
        }))
    }

    render() {
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const { score, total } = this.state.result ? this.state.result : { score: 0, total: questions && questions.length };
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        if (activeQuestionIndex == 0) {
            $("#prev-btn").addClass('disabled');
        } else if (activeQuestionIndex == questions.length - 1) {
            $("#next-btn").addClass('disabled');
        } else {
            $('#prev-btn').removeClass('disabled');
            $('#next-btn').removeClass('disabled');
        }

        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + this.state.title,
            breadcrumb: ['Bộ đề thi'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        {activeQuestion ?
                            (
                                <div className='col-md-12 pb-5'>
                                    <h6>Câu hỏi {activeQuestionIndex + 1}: {activeQuestion.title}</h6>
                                    {activeQuestion.image ? <img src={activeQuestion.image} alt='question' style={{ width: '50%', height: 'auto' }} /> : null}
                                    <div className='form-check'>
                                        {activeQuestion.answers.split('\n').map((answer, index) => (
                                            <div key={index}>
                                                <input className='form-check-input'
                                                    type='radio'
                                                    name={activeQuestion._id}
                                                    id={activeQuestion._id + index}
                                                    value={index}
                                                    onChange={e => this.onAnswerChanged(e, activeQuestion._id)} />
                                                <label className='form-check-label' htmlFor={activeQuestion._id + index}>
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
                        <button className='btn btn-primary' onClick={e => this.submitAnswer(e, questions)}>Gửi</button>
                        <p>Số câu đúng của bạn: <b>{score} / {total}</b></p>
                    </div>
                </div>
            ),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getDriveTestItem, checkDriveTestScore };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTest);
