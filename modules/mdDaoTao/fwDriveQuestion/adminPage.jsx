import React from 'react';
import { connect } from 'react-redux';
import { getAllDriveQuestions, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const newData = { title: this.itemTitle.value() };
        if (newData.title == '') {
            T.notify('Tên câu hỏi thi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createDriveQuestion(newData, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/drive-question/edit/' + data.item._id);
                }
            });
        }
    }

    render = () => this.renderModal({
        title: 'Câu hỏi thi mới',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên câu hỏi thi' />
    });
}

class AdminQuestionPage extends AdminPage {
    modal = React.createRef();

    componentDidMount() {
        this.props.getAllDriveQuestions();
        T.ready();
        T.showSearchBox();
        T.onSearch = (searchText) => this.props.getAllDriveQuestions(searchText);
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    delete = (e, item) => {
        T.confirm('Xóa câu hỏi thi', 'Bạn có chắc bạn muốn xóa câu hỏi thi này?', true, isConfirm => isConfirm && this.props.deleteDriveQuestion(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.getUserPermission('driveQuestion');
        let table = 'Không có câu hỏi thi!';
        if (this.props.driveQuestion && this.props.driveQuestion.list && this.props.driveQuestion.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên câu hỏi thi</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                            <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                            {permission.write || permission.delete ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th> : null}
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.driveQuestion.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/drive-question/edit/' + item._id}>{item.title}</Link></td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.isOutside}
                                            onChange={() => permission.write && this.props.updateDriveQuestion(item._id, { isOutside: item.isOutside ? 0 : 1 }, () => T.notify('Cập nhật câu hỏi thi thành công!', 'success'))} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatarDriveQuestion' style={{ height: '32px' }} />
                                </td>
                                {permission.write || permission.delete ? <td>
                                    <div className='btn-group'>
                                        {permission.write ?
                                            <Link to={'/user/drive-question/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                                <i className='fa fa-lg fa-edit' />
                                            </Link> : null}
                                        {permission.delete ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td> : null}
                            </tr>))}
                    </tbody>
                </table>);
        }

        const renderData = {
            icon: 'fa fa-list-alt',
            title: 'Câu hỏi thi',
            breadcrumb: ['Câu hỏi thi'],
            content: <>
                <div className='tile'>{table}</div>
                <QuestionModal ref={this.modal} createDriveQuestion={this.props.createDriveQuestion} history={this.props.history} />
            </>,
        };
        if (permission.write) renderData.onCreate = this.create;
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, driveQuestion: state.driveQuestion, driveQuestionCategory: state.driveQuestionCategory });
const mapActionsToProps = { getAllDriveQuestions, createDriveQuestion, deleteDriveQuestion, updateDriveQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);
