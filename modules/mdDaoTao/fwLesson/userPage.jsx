import React from 'react';
import { connect } from 'react-redux';
import { getLessonByStudent, checkQuestion } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs } from 'view/component/AdminPage';

const adminPageLink = '/user/hoc-vien/khoa-hoc';
class adminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(adminPageLink, () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/:_id').parse(url);
            if (params._id) {
                this.props.getLessonByStudent(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy bài học bị lỗi!', 'danger');
                        this.props.history.push(adminPageLink);
                    } else if (data.item) {
                        const { _id, title, shortDescription, detailDescription } = data.item;
                        this.setState({ _id, title, shortDescription, detailDescription });
                    } else {
                        this.props.history.push(adminPageLink);
                    }
                });
            } else {
                this.props.history.push(adminPageLink);
            }
        });
    }

    submitAnswer = (e, list) => {
        e.preventDefault();
        let studentAnswers = list.map((question) => {
            return { questionId: question._id, answer: $('input[name=' + question._id + ']:checked').val() };
        })
        this.props.checkQuestion(studentAnswers, result => alert(result.score))
    }

    render() {
        const permission = this.getUserPermission('lesson'),
            listVideo = this.props.lesson && this.props.lesson.item && this.props.lesson.item.videos ? this.props.lesson.item.videos : [];
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
            <div className='tile-body row'>
                {listVideo.map((video, index) =>
                (
                    <div key={index} className='col-lg-4 col-md-6'>
                        <div className='embed-responsive embed-responsive-16by9'>
                            <iframe className='embed-responsive-item' src={'https://youtube.com/embed/' + video.link.slice(17)} frameBorder='0' allowFullScreen width='70%' height='auto'></iframe>
                        </div>
                        <h5>{video.title}</h5>
                    </div>
                )
                )}
            </div>);

        const listQuestions = this.props.lesson && this.props.lesson.item && this.props.lesson.item.questions ? this.props.lesson.item.questions : [],
            componentQuestion = (
                <div className='tile-body'>
                    {listQuestions.map((question, indexQuestion) => question.active ?
                        (
                            <div key={indexQuestion}>
                                <h6>Câu {indexQuestion + 1}:{question.title}</h6>
                                {question.image ? <img src={question.image} alt='question' style={{ width: '20%', height: 'auto' }} /> : null}
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
                    )}
                    <button className='btn btn-primary' onClick={e => this.submitAnswer(e, listQuestions)}>Gửi</button>
                </div>);
        const tabs = [{ title: 'Bài giảng', component: componentVideo }, { title: 'Thông tin chung', component: componentInfo }, { title: 'Câu hỏi ôn tập', component: componentQuestion }];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link to={adminPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: adminPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLessonByStudent, checkQuestion };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);