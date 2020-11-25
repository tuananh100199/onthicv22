import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../redux.jsx';
// import { getQuestionsList } from '../reduxQuestion.jsx';
// import { getAnswerInPage, getAnswer, updateAnswer, deleteAnswer, exportRegisters } from '../reduxAnswer.jsx';
import Pagination from '../../../view/component/Pagination.jsx';
import { Link } from 'react-router-dom';

// import EditAnswerModal from './modal/EditAnswerModal.jsx';
// import AddAnswerModal from './modal/AddAnswerModal.jsx';
// import ImportStudentModal from './modal/ImportStudentModal.jsx';

class adminRegistrationPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };

        this.editModal = React.createRef();
        this.addModal = React.createRef();
        this.importModal = React.createRef();
    }

    componentDidMount() {
        console.log('here')
        T.ready('/user/form/list', () => {
            const route = T.routeMatcher('/user/form/registration/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getQuestionsList(formId);
            this.props.getAnswerInPage(formId);
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/form/list');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/form/list');
                }
            });
        });
    }

    addNew = (e) => {
        this.addModal.current.show();
        e.preventDefault();
    };

    showEdit = (e, _id) => {
        this.props.getAnswer(_id, item => {
            this.editModal.current.show(item);
        });
        e.preventDefault();
    };

    getPage = (pageNumber, pageSize) => {
        const formId = this.state.item._id;
        this.props.getAnswerInPage(formId, pageNumber, pageSize);
    };

    changeAttendance = (event, item) => {
        this.props.updateAnswer(item._id, { attendance: !item.attendance }, () => {
            T.notify((item.attendance ? 'Hủy điểm danh ' : 'Điểm danh ') + 'thành công!', 'success');
        });
        event.preventDefault();
    };

    remove = (e, _id) => {
        T.confirm('Xoá câu trả lời', 'Bạn có chắc muốn xóa câu trả lời này?', 'info', isConfirm => {
            isConfirm && this.props.deleteAnswer(_id, this.state.item._id);
        });
    };

    export = (e, fileName) => {
        this.props.exportRegisters(this.state.item._id, fileName);
    };

    createRow = (list, pageNumber, pageSize, readOnly) => {
        return list.map((item, index) => {
            return (
                <tr key={index}>
                    <td style={{ whiteSpace: 'nowrap' }}>{(Math.max(pageNumber, 1) - 1) * pageSize + index + 1}</td>
                    <td style={{ whileSpace: 'nowrap' }}>
                        {!readOnly ? (
                                <a href='#' onClick={e => this.showEdit(e, item._id)} >
                                    {item.user ? (item.user.lastname + ' ' + item.user.firstname) : (item.userLastname + ' ' + item.userFirstname)}
                                </a>
                        ) : (item.user ? (item.user.lastname + ' ' + item.user.firstname) : (item.userLastname + ' ' + item.userFirstname))}
                    </td>
                    <td className='toggle' style={{ textAlign: 'center' }}>
                        <label>
                            <input type='checkbox' disabled={readOnly} checked={item.attendance} onChange={e => this.changeAttendance(e, item)} />
                            <span className='button-indecator' />
                        </label>
                    </td>
                    {!readOnly ? (
                        <td key='action' className='btn-group' >
                            <button type='button' className='btn btn-primary' data-toggle='tooltip' data-placement='top' title='Chỉnh sửa câu trả lời'
                                    onClick={e => this.showEdit(e, item._id)}>
                                <i className='fa fa-lg fa-edit' />
                            </button>
                            <button type='button' className='btn btn-danger' onClick={e => this.remove(e, item._id)}>
                                <i className='fa fa-lg fa-trash' />
                            </button>
                        </td>
                    ) : null}
                </tr>
            );
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const item = this.state.item ? this.state.item : { _id: '', title: '', createdDate: new Date(), maxRegisterUsers: -1 };
        const title = T.language.parse(item.title, true);
        const questions = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        const { totalItem, pageSize, pageTotal, pageNumber, list } = this.props.answer && this.props.answer.page ?
                this.props.answer.page : { totalItem: 0, pageSize: 50, pageTotal: 0, pageNumber: 1, list: [] };
        const table = list && list.length > 0 ? (
                <table className='table table-hover table-bordered'>
                    <thead>
                    <tr>
                        <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>STT</th>
                        <th style={{ width: '100%', whileSpace: 'nowrap' }}>Họ và tên</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Điểm danh</th>
                        {!readOnly ? (
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        ) : null}
                    </tr>
                    </thead>
                    <tbody>
                        {this.createRow(list, pageNumber, pageSize, readOnly)}
                    </tbody>
                </table>
        ) : <p>Không có đăng ký nào</p>;

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Form: Danh sách đăng ký form</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                </div>

                <div className='row'>
                    <div className='col-md-12'>
                        <div className='tile'>
                            {table}
                        </div>
                    </div>
                </div>

                <Pagination name='pageAnswer' style={{ marginLeft: '75px' }}
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.getPage} />

                <Link to='/user/form/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <EditAnswerModal ref={this.editModal} questions={questions} readOnly={!currentPermission.contains('user-form:write')} />
                <AddAnswerModal ref={this.addModal} questions={questions} formId={item._id} readOnly={!currentPermission.contains('user-form:write')} />
                <ImportStudentModal ref={this.importModal} questions={questions} formId={item._id} maxRegisterUsers={item.maxRegisterUsers} />

                {readOnly ? '' :
                    <button type='button' className='btn btn-info btn-circle'
                            onClick={() => this.importModal.current.show()}
                            style={{ position: 'fixed', right: '130px', bottom: '10px' }}
                            data-toggle='tooltip' data-placement='top' title='Import danh sách tham gia'>
                        <i className='fa fa-lg fa-cloud-upload' />
                    </button>
                }
                {!readOnly ? (
                        <button type='button' className='btn btn-success btn-circle'
                                onClick={(e) => this.export(e, 'Danh sách tham gia')} style={{ position: 'fixed', right: '70px', bottom: '10px' }}
                                data-toggle='tooltip' data-placement='top' title='Xuất danh sách tham gia'>
                            <i className='fa fa-lg fa-file-excel-o' />
                        </button>
                ) : null}
                {readOnly ? '' :
                    <button type='button' data-toggle='tooltip' data-placement='top' title='Thêm người tham gia'
                            className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.addNew}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                }
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = { getForm, updateForm, getAnswer, updateAnswer, deleteAnswer, exportRegisters };
export default connect(mapStateToProps, mapActionsToProps)(adminRegistrationPage);
