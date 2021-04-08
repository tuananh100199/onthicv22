import React from 'react';
import { connect } from 'react-redux';
import { updateDriveTest, getDriveTestItem, swapQuestions } from './redux';
import { Link } from 'react-router-dom';
import { ajaxSelectDriveQuestion, getAllDriveQuestions} from '../fwDriveQuestion/redux';
import { ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, CirclePageButton, AdminModal, FormTextBox, FormRichTextBox, TableCell, renderTable, FormTabs, FormSelect } from 'view/component/AdminPage';

class DriveTestModal extends AdminModal {
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
            const questions = this.props.item.questions.map(item => item._id);
            questions.push(_questionId);
            this.props.update(this.props.item._id, { questions }, () => {
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Câu hỏi thi',
        body:
            <FormSelect ref={e => this.questionSelect = e} label='Câu hỏi thi' 
                data={{
                ...ajaxSelectDriveQuestion, processResults: response => 
                    ({ results: response && response.list ? response.list.filter(item => !this.props.item.questions.map(item => item._id).includes(item._id)).map(item => ({ id: item._id, text: item.title })) : [] })
            }} readOnly={this.props.readOnly} />
    });
}

const backRoute = '/user/drive-test'
class DriveTestEditPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(backRoute, () => {
            const route = T.routeMatcher(backRoute + '/:_id'), params = route.parse(window.location.pathname);
            this.props.getDriveTestItem(params._id, item => {
                if (item) {
                    let {title, courseType, description} = item ? item : { title: '',courseType: '', description: '' };
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

    remove = (e, index) => e.preventDefault() || T.confirm('Xoá câu hỏi thi', 'Bạn có chắc muốn xoá câu hỏi thi khỏi bộ đề thi này?', true, isConfirm => {
        if (isConfirm) {
            let questions = this.props.driveTest.item.questions.map(item => item._id);
            questions.splice(index, 1);
            this.props.updateDriveTest(this.state._id, { questions: questions.length ? questions : 'empty' }, () => T.alert('Xoá câu hỏi thi khỏi bộ đề thi thành công!', 'error', false, 800));
        }
    })

    swap = (e, question, isMoveUp) => e.preventDefault() || this.props.swapQuestions(this.state._id, question._id, isMoveUp);

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
                        {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center'  }} nowrap='true'>Thao tác</th>}
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type={permission.read ? 'link' : 'text'} content={item.title} url={`/user/drive-question/${item._id}`} />
                        <TableCell type='buttons' content={item} permission={permission}  onSwap={this.swap} onDelete={this.remove} />
                    </tr>),
            }),
            componentInfo = <>
                <div className='row'>
                    <FormTextBox className='col-md-8' ref={e => this.itemTitle = e} label='Tên bộ đề thi' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                    <FormSelect  className='col-md-4' ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />

                </div>
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả'  rows='6' readOnly={readOnly} />
                {readOnly ? null : <CirclePageButton type='save' onClick={this.save} />}
            </>,
            componentQuestion = <>
                    {table}
                    {readOnly ? null : <CirclePageButton type='create' onClick={() => this.modal.show()} />}
                    <DriveTestModal ref={e => this.modal = e} readOnly={!permission.write} update={this.props.updateDriveTest} item={item} getAllDriveQuestions={this.props.getAllDriveQuestions}/>
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
const mapActionsToProps = { updateDriveTest, getDriveTestItem, swapQuestions, getAllDriveQuestions };
export default connect(mapStateToProps, mapActionsToProps)(DriveTestEditPage);