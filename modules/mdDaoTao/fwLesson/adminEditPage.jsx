import React from 'react';
import { connect } from 'react-redux';
import {
    getLesson, updateLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo,
    createLessonQuestion, swapLessonQuestion, deleteLessonQuestion, updateLessonQuestion,
} from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, BackButton } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image, active } = video ? video : { _id: null, title: '', link: '', image: '', active: true };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.setData('lesson-video:' + (_id ? _id : 'new'));
        this.itemActive.value(active);

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            link: this.itemLink.value(),
            active: this.itemActive.value(),
        };
        if (data.title == '') {
            T.notify('Tên video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            this.state._id ? this.props.update(this.props.lessonId, this.state._id, data) : this.props.create(this.props.lessonId, data);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Video mới',
        size: 'large',
        body:
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên video' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' readOnly={this.props.readOnly} />
                    <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
                </div>
                <div className='col-md-4'>
                    <label>Hình đại diện</label>
                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='LessonVideoImage' image={this.state.image} readOnly={this.props.readOnly} />
                </div>
            </div>
    });
}

class QuestionModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, answers, trueAnswer, active } = item ? item : { _id: null, title: '', answers: [], trueAnswer: 0, active: true };
        this.itemTitle.value(title)
        this.itemAnswers.value(answers.join('\n'));
        this.itemTrueAnswer.value(trueAnswer);
        this.itemActive.value(active);

        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            trueAnswer: this.itemTrueAnswer.value(),
            answers: (this.itemAnswers.value() || '').split('\n'),
            active: this.itemActive.value(),
        };
        for (let i = 0; i < data.answers.length; i++) {
            if (data.answers[i] == '') data.answers.splice(i, 1);
        }
        if (data.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.state._id ? this.props.update(this.props.lessonId, this.state._id, data) : this.props.create(this.props.lessonId, data);
            this.hide();
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Câu hỏi',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Câu hỏi' rows='4' readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemAnswers = e} className='col-md-8' label='Danh sách câu trả lời' rows='5' readOnly={this.props.readOnly} />
                <div className='col-md-4'>
                    <label>Hình minh họa</label>
                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='LessonQuestionImage' image={this.state.image} readOnly={this.props.readOnly} />
                </div>
                <FormTextBox ref={e => this.itemTrueAnswer = e} className='col-md-8' label='Đáp án' readOnly={this.props.readOnly} type='number' />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-4' label='Kích hoạt' readOnly={this.props.readOnly} />
            </div>
        });
    };
}

const adminPageLink = '/user/dao-tao/bai-hoc';
class adminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(adminPageLink, () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            if (params._id) {
                this.props.getLesson(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy bài học bị lỗi!', 'danger');
                        this.props.history.push(adminPageLink);
                    } else if (data.item) {
                        const { _id, title, shortDescription, detailDescription } = data.item;
                        this.itemTitle.value(title);
                        this.itemDescription.value(shortDescription);
                        this.itemEditor.html(detailDescription);

                        this.setState({ _id, title });
                        this.itemTitle.focus();
                    } else {
                        this.props.history.push(adminPageLink);
                    }
                });
            } else {
                this.props.history.push(adminPageLink);
            }
        });
    }

    saveInfo = () => this.props.updateLesson(this.state._id, {
        title: this.itemTitle.value(),
        shortDescription: this.itemDescription.value(),
        detailDescription: this.itemEditor.html(),
    });

    createVideo = e => e.preventDefault() || this.modalVideo.show();
    changeVideoActive = (video) => this.props.updateLessonVideo(this.state._id, video._id, { active: !video.active });
    editVideo = (e, video) => e.preventDefault() || this.modalVideo.show(video);
    deleteVideo = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonVideo(this.state._id, video._id));
    swapVideo = (e, video, isMoveUp) => e.preventDefault() || this.props.swapLessonVideo(this.state._id, video._id, isMoveUp);

    createQuestion = e => e.preventDefault() || this.modalQuestion.show();
    changeQuestionActive = (question) => this.props.updateLessonQuestion(this.state._id, question._id, { active: !question.active });
    editQuestion = (e, question) => e.preventDefault() || this.modalQuestion.show(question);
    deleteQuestion = (e, question) => e.preventDefault() || T.confirm('Xóa câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${question.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonQuestion(this.state._id, question._id));
    swapQuestion = (e, question, isMoveUp) => e.preventDefault() || this.props.swapLessonQuestion(this.state._id, question._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('lesson');
        const { videos, lessonQuestion } = this.props.lesson && this.props.lesson.item ? this.props.lesson.item : { videos: [], lessonQuestion: [] };

        let tableVideo = 'Chưa có video!',
            tableQuestion = 'Chưa có câu hỏi!';
        if (videos && videos.length > 0) {
            tableVideo = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên bài học</th>
                            <th style={{ width: 'auto' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a className='text-primary' href='#' onClick={e => this.editVideo(e, item)}>{item.title}</a></td>
                                <td><a href={item.link} target='_blank'>{item.link}</a></td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => permission.write && this.changeVideoActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapVideo(e, item, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a> : null}
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapVideo(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a> : null}
                                        <a className='btn btn-primary' href='#' onClick={e => this.editVideo(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permission.write ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteVideo(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        if (lessonQuestion && lessonQuestion.length > 0) {
            tableQuestion = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên câu hỏi</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessonQuestion.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a className='text-primary' href='#' onClick={e => this.editQuestion(e, item)}>{item.title}</a></td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => permission.write && this.changeQuestionActive(item)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapQuestion(e, item, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a> : null}
                                        {permission.write ? <a className='btn btn-success' href='#' onClick={e => this.swapQuestion(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a> : null}
                                        <a className='btn btn-primary' href='#' onClick={e => this.editQuestion(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permission.write ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteQuestion(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>);
        }

        const componentInfo = <>
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='3' readOnly={!permission.write} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={!permission.write} />
            </div>
            {permission.write ?
                <div style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-primary' onClick={this.saveInfo}>
                        <i className='fa fa-lg fa-save' /> Lưu
                    </button>
                </div> : null}
        </>;

        const componentVideo = <>
            <div className='tile-body'>
                {tableVideo}
                {permission.write ?
                    <div style={{ textAlign: 'right' }}>
                        <button type='button' className='btn btn-success' onClick={this.createVideo}>
                            <i className='fa fa-lg fa-plus' /> Thêm
                        </button>
                    </div> : null}
            </div>
            <VideoModal lessonId={this.state._id} ref={e => this.modalVideo = e} create={this.props.createLessonVideo} update={this.props.updateLessonVideo} readOnly={!permission.write} />
        </>;

        const componentQuestion = <>
            <div className='tile-body'>
                {tableQuestion}
                {permission.write ?
                    <div style={{ textAlign: 'right' }}>
                        <button type='button' className='btn btn-success' onClick={this.createQuestion}>
                            <i className='fa fa-lg fa-plus' /> Thêm
                        </button>
                    </div> : null}
            </div>
            <QuestionModal lessonId={this.state._id} ref={e => this.modalQuestion = e} create={this.props.createLessonQuestion} update={this.props.updateLessonQuestion} readOnly={!permission.write} />
        </>;

        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Video', component: componentVideo }, { title: 'Câu hỏi', component: componentQuestion }];
        const renderData = {
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link to={adminPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <><FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} /><BackButton to={adminPageLink} /></>,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = {
    getLesson, updateLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo,
    createLessonQuestion, swapLessonQuestion, deleteLessonQuestion, updateLessonQuestion,
};
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);