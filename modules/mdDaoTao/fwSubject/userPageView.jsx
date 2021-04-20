import React from 'react';
import { connect } from 'react-redux';
import { getSubject, updateSubject, addSubjectLesson, swapSubjectLesson, deleteSubjectLesson, changeSubjectQuestions } from './redux';
import { ajaxSelectLesson } from 'modules/mdDaoTao/fwLesson/redux';
import { Link } from 'react-router-dom';
import { QuestionView } from 'modules/_default/fwQuestion/index';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, FormSelect, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

const userPageLink = '/user/hoc-vien/khoa-hoc';
class AdminEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/subject', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/hoc-vien/khoa-hoc/mon-hoc/:_id').parse(url);
            if (params._id) {
                this.props.getSubject(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy môn học bị lỗi!', 'danger');
                        this.props.history.push(userPageLink);
                    } else if (data.item) {
                        const { _id, title, shortDescription, detailDescription } = data.item;
                        this.setState({ _id, title, shortDescription, detailDescription });
                    } else {
                        this.props.history.push(userPageLink);
                    }
                });
            } else {
                this.props.history.push(userPageLink);
            }
        });
    }

    render() {
        const permission = this.getUserPermission('subject'),
            readOnly = !permission.write;

        const tableLesson = renderTable({
            getDataSource: () => this.props.subject && this.props.subject.item && this.props.subject.item.lessons,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bài học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} />
                </tr>),
        });

        const componentInfo = (
            <div className='tile-body'>
                <label>Tên môn học: <b>{this.state.title}</b></label>
                <label>Mô tả ngắn gọn: <b>{this.state.shortDescription}</b></label>
                {/* <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='2' readOnly={readOnly} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={readOnly} />
                {permission.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null} */}
            </div>
        );
        const componentLesson = (
            <div className='tile-body'>
                {tableLesson}
            </div>);

        const questions = this.props.subject && this.props.subject.item && this.props.subject.item.questions,
            componentQuestion = <QuestionView type='subject' parentId={this.state._id} className='tile-body' permission={permission} questions={questions} changeQuestions={this.props.changeSubjectQuestions} />

        const tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Bài học', component: componentLesson }, { title: 'Câu hỏi', component: componentQuestion }];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Môn học: ' + (this.state.title || '...'),
            breadcrumb: [<Link to={userPageLink}>Môn học</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubject, updateSubject, addSubjectLesson, swapSubjectLesson, deleteSubjectLesson, changeSubjectQuestions };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditPage);