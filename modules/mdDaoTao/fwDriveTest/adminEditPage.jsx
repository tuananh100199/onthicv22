import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createDriveTestQuestion, swapDriveTestQuestion, deleteDriveTestQuestion, getDriveTestItem, updateDriveTest } from './redux';
import { ajaxSelectDriveQuestion } from 'modules/mdDaoTao/fwDriveQuestion/redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao//fwCourseType/redux';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormRichTextBox, TableCell, renderTable, FormTabs, FormSelect } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => {
            this.questionSelect.value(null);
        }));
    }

    onShow = () => this.questionSelect.value('');

    onSubmit = () => {
        const _questionId = this.questionSelect.value();
        if (!_questionId) T.notify('Tên câu hỏi thi bị trống!', 'danger');
        else {
            this.props.create(this.props.item._id, _questionId, this.hide);
        }
    }

    render = () => {
        // chỉ lấy các câu hỏi chưa đưa vào
        const processResults = response => {
            const _questionIds = this.props.item.questions.map(item => item._id),
                results = [];
            (response && response.list ? response.list : [])
                .forEach(item => _questionIds.includes(item._id) || results.push({ id: item._id, text: item.title }));
            return { results }
        };
        return this.renderModal({
            title: 'Câu hỏi thi',
            body: <FormSelect ref={e => this.questionSelect = e} label='Câu hỏi thi' data={{ ...ajaxSelectDriveQuestion, processResults }} readOnly={this.props.readOnly} />
        });
    };
}

const backRoute = '/user/drive-test'
class DriveTestEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getDriveTestItem(params._id, item => {
                if (item) {
                    let { title, courseType, description } = item ? item : { title: '', courseType: '', description: '' };
                    this.itemTitle.value(title);
                    this.itemCourseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
                    this.itemDescription.value(description);

                    this.itemTitle.focus();
                    this.setState(item);
                } else {
                    this.props.history.push(backRoute);
                }
            });
        });
    }

    swap = (e, question, isMoveUp) => e.preventDefault() || this.props.swapDriveTestQuestion(this.state._id, question._id, isMoveUp);

    delete = (e, question) => e.preventDefault() || T.confirm('Xóa câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${question.title}</strong>`, true, isConfirm =>
        isConfirm && this.props.deleteDriveTestQuestion(this.state._id, question._id));

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            courseType: this.itemCourseType.value(),
            description: this.itemDescription.value().trim(),
        };
        if (changes.title == '') {
            T.notify('Tên bộ đề thi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.updateDriveTest(this.state._id, changes)
        }
    }

    render() {
        const permission = this.getUserPermission('driveTest'),
            readOnly = !permission.write,
            item = this.props.driveTest && this.props.driveTest.item ? this.props.driveTest.item : { title: '', questions: [] },
            table = renderTable({
                getDataSource: () => item.questions ? item.questions : [],
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên câu hỏi thi</th>
                        {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type={permission.read ? 'link' : 'text'} content={item.title} url={`/user/drive-question/${item._id}`} />
                        <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onDelete={this.delete} />
                    </tr>),
            }),
            componentInfo = <>
                <div className='row'>
                    <FormTextBox className='col-md-8' ref={e => this.itemTitle = e} label='Tên bộ đề thi' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                    <FormSelect className='col-md-4' ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
                </div>
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả' rows='6' readOnly={readOnly} />
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
            </>,
            componentQuestion = <>
                {table}
                {readOnly ? null : <CirclePageButton type='create' onClick={() => this.modal.show()} />}
                <QuestionModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDriveTestQuestion} item={item} />
            </>,
            tabs = [{ title: 'Thông tin chung', component: componentInfo }, { title: 'Bộ đề thi', component: componentQuestion }];

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Bộ đề thi: ' + this.state.title,
            size: 'large',
            breadcrumb: [<Link to={backRoute}>Bộ đề thi</Link>, 'Chỉnh sửa'],
            content: <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { createDriveTestQuestion, updateDriveTest, deleteDriveTestQuestion, getDriveTestItem, swapDriveTestQuestion };
export default connect(mapStateToProps, mapActionsToProps)(DriveTestEditPage);