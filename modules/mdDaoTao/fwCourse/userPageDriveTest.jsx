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
    changeQuestion = (index) => {
        if(index == 0) {
            $('#prev-btn').attr('disabled', true);
        } else if(index == this.state.questions.length()-1) {
            $('#next-btn').attr('disabled', true);
        } else {
            this.setState({activeQuestionIndex: index});
        }
    }

    render() {
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        console.log('this.state',this.state)
        console.log('activeQuestionIndex',activeQuestionIndex)

        // const { score, total } = this.state.result ? this.state.result : { score: 0, total: questions && questions.length };
        const activeQuestion = questions ? questions[activeQuestionIndex + 1] : null;
        console.log('activeQuestion', questions&&questions[0])

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
                                    <h6>Câu hỏi:{activeQuestion.title}</h6>
                                    {activeQuestion.image ? <img src={activeQuestion.image} alt='question' style={{ width: '50%', height: 'auto' }} /> : null}
                                    <div className='form-check'>
                                        {activeQuestion.answers.split('\n').map((answer, index) => (
                                            <div key={index}>
                                                <input className='form-check-input' type='radio' name={activeQuestion._id} id={activeQuestion._id + index} value={index} />
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
                            <li className='page-item disabled' id='prev-btn'>
                                <a className='page-link' onClick={this.changeQuestion(activeQuestionIndex)}><i className='fa fa-arrow-left' aria-hidden='true'></i> Câu trước</a>
                            </li>
                            <li className='page-item' id='next-btn'>
                                <a className='page-link' href='#' tabIndex='1'> Câu tiếp <i className='fa fa-arrow-right' aria-hidden='true'></i></a>
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
