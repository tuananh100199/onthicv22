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
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.setState({ _id, title, shortDescription, detailDescription });
                } else {
                    this.props.history.push(userPageLink);
                }
            });
        } else {
            this.props.history.push(userPageLink);
        }
    }

    submitAnswer = (e, list) => {
        $('#submit-btn').attr('disabled', true);
        e.preventDefault();
        let studentAnswers = list.map((question) => {
            return { questionId: question._id, answer: $('input[name=' + question._id + ']:checked').val() };
        });
        T.confirm('Gửi câu trả lời', 'Bạn có chắc chắn nộp câu trả lời cho bộ câu hỏi này?', true, isConfirm =>
            isConfirm && this.props.checkQuestion(studentAnswers, result => {
                $('#submit-btn').removeAttr('disabled');
                T.alert('Gửi câu trả lời thành công!', 'success', false, 2000);
                this.setState({ result: result });
            }));
    }

    render() {
        const { videos, questions } = this.props.lesson && this.props.lesson.item && this.props.lesson.item ? this.props.lesson.item : { videos: [], questions: [] },
            { score, total, trueAnswer } = this.state.result ? this.state.result : { score: 0, total: questions.length, trueAnswer: {} };
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
                    {questions.map((question, indexQuestion) => question.active ?
                        (
                            <div key={indexQuestion} className='col-md-6 pb-5'>
                                <h6>Câu {indexQuestion + 1}:{question.title} Điểm:{trueAnswer[question._id] ? 1 : 0} / 1</h6>
                                {question.image ? <img src={question.image} alt='question' style={{ width: '50%', height: 'auto' }} /> : null}
                                <div className='form-check'>
                                    {question.answers.split('\n').map((answer, index) => (
                                        <div key={index}>
                                            <input className='form-check-input' type='radio' name={question._id} id={question._id + index} value={index} />
                                            <label className={'form-check-label'} htmlFor={question._id + index}>
                                                {answer}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <div>Chưa có câu hỏi ôn tập</div>
                    )}
                </div>
                <div className='tile-footer' style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <button id='submit-btn' className='btn btn-primary' onClick={e => this.submitAnswer(e, questions)}>Gửi</button>
                    <p>Số câu đúng của bạn: <b>{score} / {total}</b></p>
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