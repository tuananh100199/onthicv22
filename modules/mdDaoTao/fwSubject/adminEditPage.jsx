import React from 'react';
import { connect } from 'react-redux';
import {
    getSubject, updateSubject,
    addSubjectLesson, swapSubjectLesson, deleteSubjectLesson,
    createSubjectQuestion, swapSubjectQuestion, deleteSubjectQuestion, updateSubjectQuestion,
} from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormSelect, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';
import { ajaxSelectLesson } from 'modules/mdDaoTao/fwLesson/redux';

class LessonModal extends AdminModal {
    onShow = () => this.lessonSelect.value(null);

    onSubmit = () => {
        const lessonId = this.lessonSelect.value();
        this.props.addSubjectLesson(this.props._id, lessonId, () => {
            T.notify('Thêm bài học thành công!', 'success');
            this.hide();
        });
    }

    render = () => this.renderModal({
        title: 'Thêm bài học',
        body: <FormSelect ref={e => this.lessonSelect = e} data={ajaxSelectLesson} label='Bài học' />,
    });
}

class QuestionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (question) => {
        let { _id, title, active } = question ? question : { _id: null, title: '', active: false };
        this.itemTitle.value(title)
        this.itemIsActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemIsActive.value(),
        };
        if (data.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.state._id ?
                this.props.update(this.props.subjectId, this.state._id, data, this.hide) :
                this.props.create(this.props.subjectId, data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Câu hỏi',
            size: 'large',
            body: <>
                <FormRichTextBox ref={e => this.itemTitle = e} label='Câu hỏi' rows='6' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemIsActive = e} label='Kích hoạt' readOnly={readOnly} />
            </>,
        });
    };
}

const adminPageLink = '/user/dao-tao/mon-hoc';
class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(adminPageLink, () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/:_id').parse(url);
            this.props.getSubject(params._id, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push(adminPageLink);
                } else if (data.item) {
                    const { _id, title, shortDescription, detailDescription } = data.item;
                    this.itemTitle.value(title);
                    this.itemDescription.value(shortDescription);
                    this.itemEditor.html(detailDescription);
                    this.itemTitle.focus();

                    this.setState({ _id, title });
                } else {
                    this.props.history.push(adminPageLink);
                }
            });
        });
    }

    saveInfo = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.html(),
        };
        this.props.updateSubject(this.state._id, changes);
    };

    showLesson = (e, lesson) => e.preventDefault() || window.open('/user/dao-tao/bai-hoc/' + lesson._id, '_blank');

    showLessonModal = (e) => e.preventDefault() || this.modalLesson.show();
    deleteLesson = (e, lesson) => e.preventDefault() || T.confirm('Xóa Bài học', `Bạn có chắc bạn muốn xóa bài học <strong>${lesson.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteSubjectLesson(this.state._id, lesson._id));
    swapLesson = (e, lesson, isMoveUp) => e.preventDefault() || this.props.swapSubjectLesson(this.state._id, lesson._id, isMoveUp);

    showQuestionModal = (e, question) => e.preventDefault() || this.modalQuestion.show(question);
    deleteQuestion = (e, question) => e.preventDefault() || T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${question.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteSubjectQuestion(question._id, this.state._id));
    swapQuestion = (e, question, isMoveUp) => e.preventDefault() || this.props.swapSubjectQuestion(this.state._id, question._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('subject'),
            readOnly = !permission.write;
        const tableLesson = renderTable({
            getDataSource: () => this.props.subject && this.props.subject.item && this.props.subject.item.lessons,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bài học</th>
                    <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showLesson(e, item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showLesson} onSwap={this.swapLesson} onDelete={this.deleteLesson} />
                </tr>),
        });

        const tableQuestion = renderTable({
            getDataSource: () => this.props.subject && this.props.subject.item && this.props.subject.item.questions,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên câu hỏi</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showQuestionModal(e, item)} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateSubjectQuestion(this.state._id, item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showQuestionModal} onSwap={this.swapQuestion} onDelete={this.deleteQuestion} />
                </tr>),
        });

        const componentInfo = (
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên môn học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='2' readOnly={readOnly} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </div>
        );
        const componentLesson = (
            <div className='tile-body'>
                {tableLesson}
                {permission.write ? <CirclePageButton type='create' onClick={this.showLessonModal} /> : null}
                <LessonModal _id={this.state._id} ref={e => this.modalLesson = e} addSubjectLesson={this.props.addSubjectLesson} readOnly={!permission.write} />
            </div>);

        const componentQuestion = (
            <div className='tile-body'>
                {tableQuestion}
                {permission.write ? <CirclePageButton type='create' onClick={this.showQuestionModal} /> : null}
                <QuestionModal subjectId={this.state._id} ref={e => this.modalQuestion = e} create={this.props.createSubjectQuestion} update={this.props.updateSubjectQuestion} readOnly={!permission.write} />
            </div>);
        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Bài học', component: componentLesson }, { title: 'Câu hỏi', component: componentQuestion }];

        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link to={adminPageLink}>Môn học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: adminPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = {
    getSubject, updateSubject, addSubjectLesson, swapSubjectLesson, deleteSubjectLesson,
    createSubjectQuestion, swapSubjectQuestion, deleteSubjectQuestion, updateSubjectQuestion,
};
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);