import React from 'react';
import { connect } from 'react-redux';
import { getDriveTestItem } from 'modules/mdDaoTao/fwDriveTest/redux';
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
        this.props.checkQuestion(studentAnswers, result => this.setState({ result: result }))
    }

    render() {
        console.log(this.state)
        const { questions } = this.state ? this.state : { questions: [] };
        console.log('questions', questions)
        const { score, total } = this.state.result ? this.state.result : { score: 0, total: questions && questions.length };

        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Ôn tập: ' + this.state.title,
            breadcrumb: ['Bộ đề thi'],
            content: (
                <div>
                <div className='tile-body row'>
                    {questions ? questions.map((question, indexQuestion) => question.active ?
                        (
                            <div key={indexQuestion} className='col-md-6 pb-5'>
                                <h6>Câu {indexQuestion + 1}:{question.title}</h6>
                                {question.image ? <img src={question.image} alt='question' style={{ width: '50%', height: 'auto' }} /> : null}
                                <div className='form-check'>
                                    {question.answers.split('\n').map((answer, index) => (
                                        <div key={index}>
                                            <input className='form-check-input' type='radio' name={question._id} id={question._id + index} value={index} />
                                            <label className='form-check-label' htmlFor={question._id + index}>
                                                {answer}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <></>
                    ): null}
                </div>
                <div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <button className='btn btn-primary' onClick={e => this.submitAnswer(e, questions)}>Gửi</button>
                    <p>Số câu đúng của bạn: <b>{score} / {total}</b></p>
                </div>
            </div>),
        });
    }
}
const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { getDriveTestItem };
export default connect(mapStateToProps, mapActionsToProps)(UserPageDriveTest);
