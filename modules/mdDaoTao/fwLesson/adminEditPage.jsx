import React from 'react';
import { connect } from 'react-redux';
import {
    getLesson, updateLesson, changeLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo, createLessonQuestion, swapLessonQuestion, deleteLessonQuestion, updateLessonQuestion,
} from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image, active } = video || { _id: null, title: '', link: '', image: '', active: true };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.setData(`lessonVideoImage:${_id || 'new'}`);
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
            this.state._id ?
                this.props.update(this.props.lessonId, this.state._id, data, this.hide) :
                this.props.create(this.props.lessonId, data, this.hide);
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
            //TODO
        }
    }

    render = () => this.renderModal({
        title: 'Video mới',
        size: 'large',
        body: (
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên video' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' readOnly={this.props.readOnly} />
                    <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='lessonVideoImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
            </div>),
    });
}

class QuestionModal extends AdminModal {
    state = { answers: '' };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, answers, trueAnswer, image, active } = item || { _id: null, title: '', answers: '', trueAnswer: 0, active: true };
        this.itemTitle.value(title)
        this.imageBox.setData(`lessonQuestionImage:${_id || 'new'}`);
        this.itemAnswers.value(answers);
        this.itemActive.value(active);

        this.setState({ _id, image, answers, trueAnswer });
    }

    onSubmit = () => {
        const answers = this.state.answers.split('\n'),
            data = {
                title: this.itemTitle.value(),
                answers: this.state.answers,
                trueAnswer: this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
                active: this.itemActive.value(),
            };
        if (data.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.answers == '') {
            T.notify('Câu trả lời bị trống!', 'danger');
            this.itemAnswers.focus();
        } else if (data.trueAnswer == null) {
            T.notify('Đáp án bị trống!', 'danger');
        } else {
            this.state._id ?
                this.props.update(this.props.lessonId, this.state._id, data, this.hide) :
                this.props.create(this.props.lessonId, data, this.hide);
        }
    }

    setTrueAnswer = (e, trueAnswer) => e.preventDefault() || this.setState({ trueAnswer });

    deleteImage = () => T.confirm('Xoá hình minh họa', 'Bạn có chắc bạn muốn xoá hình minh họa này?', true, isConfirm =>
        isConfirm && this.props.deleteImage(this.state._id, () => this.setState({ image: null }))); //TODO

    render = () => {
        const readOnly = this.props.readOnly,
            answers = this.state.answers.split('\n'),
            trueAnswer = this.state.trueAnswer < answers.length ? this.state.trueAnswer : 0,
            defaultStyle = { width: '40px', height: '40px', lineHeight: '40px', borderRadius: '50%', textAlign: 'center', marginLeft: '8px', cursor: 'pointer' },
            listAnswers = [],
            listTrueAnswers = answers.map((item, index) => {
                listAnswers.push(<p key={index}>{index + 1}. {item}</p>)
                const trueAnswerStyle = trueAnswer == index ? { color: 'white', backgroundColor: '#28a745' } : {};
                return <label key={index} style={{ ...defaultStyle, ...trueAnswerStyle }} onClick={e => !readOnly && this.setTrueAnswer(e, index)}>{index + 1}</label>
            });

        return this.renderModal({
            title: 'Câu hỏi',
            size: 'large',
            body: <div className='row'>
                <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-8' label='Câu hỏi' rows='6' readOnly={readOnly} />
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình minh họa' uploadType='lessonQuestionImage' image={this.state.image}
                    onDelete={this.deleteImage} onSuccess={image => this.setState({ image })} readOnly={readOnly} />

                <FormRichTextBox ref={e => this.itemAnswers = e} className='col-md-12' label='Danh sách câu trả lời' rows='5' onChange={e => this.setState({ answers: e.target.value })} readOnly={readOnly} style={{ display: readOnly ? 'none' : 'block' }} />
                <div className='col-md-12' style={{ display: readOnly ? 'block' : 'none' }}>
                    <label>Danh sách câu trả lời</label>
                    <b>{listAnswers}</b>
                </div>
                <label className='col-md-12'>Đáp án:{listTrueAnswers}</label>

                <FormCheckbox ref={e => this.itemActive = e} className='col-md-4' label='Kích hoạt' readOnly={readOnly} />
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
                params = T.routeMatcher('/user/dao-tao/bai-hoc/:_id').parse(url);
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

    showVideoModal = (e, video) => e.preventDefault() || this.modalVideo.show(video);
    deleteVideo = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonVideo(this.state._id, video._id));
    swapVideo = (e, video, isMoveUp) => e.preventDefault() || this.props.swapLessonVideo(this.state._id, video._id, isMoveUp);

    showQuestionModal = (e, question) => e.preventDefault() || this.modalQuestion.show(question);
    deleteQuestion = (e, question) => e.preventDefault() || T.confirm('Xóa câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${question.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonQuestion(this.state._id, question._id));
    swapQuestion = (e, question, isMoveUp) => e.preventDefault() || this.props.swapLessonQuestion(this.state._id, question._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('lesson');

        const tableVideo = renderTable({
            getDataSource: () => this.props.lesson && this.props.lesson.item && this.props.lesson.item.videos,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bài học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Link</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showVideoModal(e, item)} />
                    <TableCell type='link' content={item.link} url={item.link} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateLessonVideo(this.state._id, item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showVideoModal} onSwap={this.swapVideo} onDelete={this.deleteVideo} />
                </tr>),
        });

        const tableQuestion = renderTable({
            getDataSource: () => this.props.lesson && this.props.lesson.item && this.props.lesson.item.questions,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên câu hỏi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showQuestionModal(e, item)} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateLessonQuestion(this.state._id, item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showQuestionModal} onSwap={this.swapQuestion} onDelete={this.deleteQuestion} />
                </tr>),
        });

        const componentInfo = (
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='3' readOnly={!permission.write} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={!permission.write} />
                {permission.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </div>);

        const componentVideo = (
            <div className='tile-body'>
                {tableVideo}
                {permission.write ? <CirclePageButton type='create' onClick={this.showVideoModal} /> : null}
                <VideoModal lessonId={this.state._id} ref={e => this.modalVideo = e} readOnly={!permission.write}
                    create={this.props.createLessonVideo} update={this.props.updateLessonVideo} />
            </div>);

        const componentQuestion = (
            <div className='tile-body'>
                {tableQuestion}
                {permission.write ? <CirclePageButton type='create' onClick={this.showQuestionModal} /> : null}
                <QuestionModal lessonId={this.state._id} ref={e => this.modalQuestion = e} create={this.props.createLessonQuestion} update={this.props.updateLessonQuestion} readOnly={!permission.write} />
            </div>);

        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Video', component: componentVideo }, { title: 'Câu hỏi', component: componentQuestion }];
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
const mapActionsToProps = {
    getLesson, updateLesson, changeLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo, createLessonQuestion, swapLessonQuestion, deleteLessonQuestion, updateLessonQuestion,
};
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);