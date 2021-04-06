import React from 'react';
import { connect } from 'react-redux';
import { updateDriveTest, getDriveTestItem } from './redux/reduxDriveTest';
import { Link } from 'react-router-dom';
import { ajaxSelectDriveQuestion} from './redux/redux';
import { AdminPage, CirclePageButton, AdminModal, TableCell, renderTable, FormSelect } from 'view/component/AdminPage';

class DriveTestModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => { }));
    }

    onShow = () => this.questionSelect.value('');

    onSubmit = () => {
        const _questionId = this.questionSelect.value();
        if (!_questionId) T.notify('Tên cơ sở bị trống!', 'danger');
        else {
            const questions = this.props.item.questions.map(item => item._id);
            questions.push(_questionId);
            this.props.update(this.props.item._id, { questions }, () => {
                T.notify('Thêm câu hỏi thi thành công', 'success');
                this.hide();
            });
        }
    }

    render = () => this.renderModal({
        title: 'Câu hỏi thi',
        body:
            <FormSelect ref={e => this.questionSelect = e} label='Câu hỏi thi' data={{
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
                    this.setState(item.item);
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
            this.props.updateDriveTest(this.state._id, { questions: questions.length ? questions : 'empty' }, () => T.alert('Xoá câu hỏi thi khỏi bộ câu hỏi thi thành công!', 'error', false, 800));
        }
    })

    save = () => {
        const changes = {
        };
        this.props.updateDriveTest(this.state._id, changes, () => T.notify('Cập nhật bộ câu hỏi thi thành công!', 'success'))
    }

    render() {
        const permission = this.getUserPermission('driveTest'),
            readOnly = !permission.write,
            item = this.props.driveTest && this.props.driveTest.item ? this.props.driveTest.item : { title: '', questions: [] },
            table = renderTable({
                getDataSource: () => item.questions && item.questions.sort((a, b) => a.title.localeCompare(b.title)),
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên câu hỏi thi</th>
                        {readOnly ? null : <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>}
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type={permission.read ? 'link' : 'text'} content={item.title} url={`/user/dao-tao/mon-hoc/${item._id}`} />
                        {readOnly ? null : <TableCell type='buttons' content={index} permission={permission} onDelete={this.remove} />}
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Bộ đề thi: ' + this.state.title,
            size: 'large',
            breadcrumb: [<Link to={backRoute}>Bộ đề thi</Link>, 'Chỉnh sửa'],
            content: <>
                        <div className='tile'>{table}</div>
                        {readOnly ? null : <CirclePageButton type='create' onClick={() => this.modal.show()} />}
                        <DriveTestModal ref={e => this.modal = e} readOnly={!permission.write} update={this.props.updateDriveTest} item={item} />
                    </>,
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, driveTest: state.driveTest });
const mapActionsToProps = { updateDriveTest, getDriveTestItem };
export default connect(mapStateToProps, mapActionsToProps)(DriveTestEditPage);