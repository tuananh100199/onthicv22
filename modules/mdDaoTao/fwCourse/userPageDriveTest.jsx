import React from 'react';
import { connect } from 'react-redux';
import { getDriveTestItem } from 'modules/mdDaoTao/fwDriveTest/redux';
import { checkDriveTestScore } from 'modules/mdDaoTao/fwDriveTest/redux';

import { AdminPage } from 'view/component/AdminPage';

const backRoute = '/user/hoc-vien/khoa-hoc/de-thi-thu'
class UserPageDriveTest extends AdminPage {
    state = {};
    studentAnswers = [];
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
    
    submitAnswer = (e, list) => {
        e.preventDefault();
        let studentAnswers = list.map((question) => {
            return { questionId: question._id, answer: $('input[name=' + question._id + ']:checked').val() };
        })
        this.props.checkDriveTestScore(this.state._id, studentAnswers, result => {
            $('#submit-btn').removeAttr('disabled');
            T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
            this.setState({ result: result })
        })
    }
    changeQuestion = (e, index) => {
        e.preventDefault();
        // this.studentAnswers[this.state.activeQuestionIndex] = value;
        if (index == -1) {
            T.notify('Câu hỏi này đã là câu hỏi đầu tiên!', 'danger');
        } else if (index == this.state.questions.length) {
            T.notify('Câu hỏi này đã là câu hỏi cuối cùng!', 'danger');
        } else {
            this.setState({ activeQuestionIndex: index });
        }
    }
    onAnswerChanged = (e, index) => {
        console.log('index', index)
        const { value } = e.target;
        console.log('e.target', e.target)
        this.studentAnswers[index] = value;
        this.setState({
            studentAnswers: this.studentAnswers
          })
    }

    render() {
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        // const { score, total } = this.state.result ? this.state.result : { score: 0, total: questions && questions.length };
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        activeQuestion ? $('input[name=' + activeQuestion._id + activeQuestionIndex +']').val(this.state.studentAnswers && this.state.studentAnswers[activeQuestionIndex]) : null;
        console.log('activeQuestion', activeQuestion && activeQuestion._id)


        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + this.state.title,
            breadcrumb: ['Bộ đề thi'],
            content: (
                <div className='tile'>
                    <div className='tile-body row'>
                        {activeQuestion? 
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
                                                    onChange={e => this.onAnswerChanged(e, activeQuestion._id + index)} />
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
                        {/* <button className='btn btn-primary' onClick={e => this.submitAnswer(e, questions)}>Gửi</button> */}
                        {/* <p>Số câu đúng của bạn: <b>{score} / {total}</b></p> */}
                    </div>
                </div>
            ),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getDriveTestItem, checkDriveTestScore };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTest);
