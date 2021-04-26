import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent, checkQuestion } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';

const userPageLink = '/user/hoc-vien/khoa-hoc';
class adminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/:_id').parse(url);
        if (params._id) {
            this.props.getLessonByStudent(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push(userPageLink);
                } else if (data.item && data.currentCourse) {
                    T.ready(userPageLink + '/' + data.currentCourse);
                    const { _id, title, shortDescription, detailDescription, questions } = data.item,
                        courseId = data.currentCourse;
                    this.setState({ _id, title, shortDescription, detailDescription, questions, courseId });
                } else {
                    this.props.history.push(userPageLink);
                }
            });
        } else {
            this.props.history.push(userPageLink);
        }
        $("#totalScore").css("display", "none");
        $("#trueAnswer").css("display", "none");
    }

    submitAnswer = (e) => {
        e.preventDefault();
        this.props.checkQuestion(this.state.studentAnswer, result => {
            T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
            this.setState({ result: result })
            $("#totalScore").css("display", "block");
            $("#trueAnswer").css("display", "block");
            $('#submit-btn').hide();
        })
    }

    changeQuestion = (e, index) => {
        e.preventDefault();
        this.setState({ activeQuestionIndex: index }, () => {
            const activeQuestion = this.state.questions[index],
                questionId = activeQuestion ? activeQuestion._id : null;
            if (activeQuestion) {
                if (this.state.studentAnswer && this.state.studentAnswer[activeQuestion._id]) {
                    $('#' + questionId + this.state.studentAnswer[activeQuestion._id]).prop('checked', true);
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
        const videos = this.props.lesson && this.props.lesson.item && this.props.lesson.item ? this.props.lesson.item.videos : [];
        const { questions } = this.state ? this.state : { questions: [] };
        const activeQuestionIndex = this.state.activeQuestionIndex ? this.state.activeQuestionIndex : 0;
        const { score, trueAnswer } = this.state.result ? this.state.result : { score: 0, trueAnswer: {} };
        const activeQuestion = questions ? questions[activeQuestionIndex] : null;
        if (activeQuestionIndex == 0) {
            $("#prev-btn").addClass('disabled');
            $('#submit-btn').hide();
        } else if (activeQuestionIndex == questions.length - 1) {
            $('#next-btn').addClass('disabled');
            !this.state.result && $('#submit-btn').show();
        } else {
            $('#prev-btn').removeClass('disabled');
            $('#next-btn').removeClass('disabled');
            $('#submit-btn').hide();
        }
        const componentInfo = (
            <div className='tile-body'>
                <div className='form-group'>
                    Tên môn học: <b>{this.state.title}</b>
                </div>
                <div className='form-group'>
                    <label>Mô tả ngắn gọn: <b>{this.state.shortDescription}</b></label>
                </div>
                <div className='form-group'>
                    <label>Mô tả chi tiết: </label><p dangerouslySetInnerHTML={{ __html: this.state.detailDescription }} />
                </div>
            </div>);

        const componentVideo = (
            <div className='tile-body'>
                {videos.length ? videos.map((video, index) =>
                (
                    <div key={index} className='d-flex justify-content-center pb-5'>
                        <div className='embed-responsive embed-responsive-16by9' style={{ width: '70%', display: 'block' }}>
                            <iframe className='embed-responsive-item' src={'https://youtube.com/embed/' + video.link.slice(17)} frameBorder='0' allowFullScreen></iframe>
                        </div>
                    </div>
                )
                ) : <div className='tile-body'>Chưa có video bài giảng!</div>}
            </div>);

        const componentQuestion = (
            <div>
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
                    <p id='trueAnswer'>Điểm của câu hỏi: <b>{trueAnswer[activeQuestion && activeQuestion._id] ? 1 : 0} / 1</b></p>
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
                    <button className='btn btn-primary' id='submit-btn' onClick={e => this.submitAnswer(e)}>Chấm điểm</button>
                    <p id='totalScore'>Số câu đúng của bạn: <b>{score} / {questions && questions.length}</b></p>
                </div>
            </div>
        );
        const tabs = [{ title: 'Bài giảng', component: componentVideo }, { title: 'Thông tin chung', component: componentInfo }, { title: 'Câu hỏi ôn tập', component: componentQuestion }];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={userPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLessonByStudent, checkQuestion };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);