import React from 'react';
import { connect } from 'react-redux';
import { getSubjectQuestionList, createSubjectQuestion, updateSubjectQuestion, swapSubjectQuestion, deleteSubjectQuestion } from './redux'
import { Link } from 'react-router-dom';
import { AdminModal, FormCheckbox, FormEditor, FormTextBox } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, content, active } = item ? item : { _id: null, title: '', content: '', active: false };
        this.itemTitle.value(title)
        this.itemEditor.html(content);
        this.itemIsActive.value(active);
        this.data('_id', _id);
    }

    onSubmit = () => {
        const _id = this.data('_id');
        let newData = {
            title: this.itemTitle.value(),
            content: this.itemEditor.html(),
            active: this.itemIsActive.value(),
        };
        if (newData.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            !_id ? this.props.add(newData) : this.props.update(_id, newData);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Câu hỏi mới',
        size: 'large',
        body:
            <div>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên câu hỏi' />
                <FormCheckbox ref={e => this.itemIsActive = e} label='Kích hoạt' />
                <FormEditor ref={e => this.itemEditor = e} label='Nội dung câu hỏi' />
            </div>
    });
}

class AdminEditQuestion extends React.Component {
    state = {};
    modal = React.createRef();

    componentDidMount() {
        this.questionModal = React.createRef();
        T.ready('/user/dao-tao/mon-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getSubjectQuestionList(params._id);
            this.setState({ subjectId: params._id });
        });
    }

    addQuestion = (data) => {
        this.props.createSubjectQuestion(this.state.subjectId, data, () => T.notify('Thêm câu hỏi thành công!', 'success'));
    };

    showQuestionModal = (e, item) => {
        this.modal.current.show(item);
        e.preventDefault();
    };

    swap = (e, index, isMoveUp) => {
        e.preventDefault();
        let questionList = this.props.subject && this.props.subject.questions ? this.props.subject.questions.subjectQuestion : [];
        if (questionList.length == 1) {
            T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                } else {
                    const temp = questionList[index - 1], changes = {};
                    questionList[index - 1] = questionList[index];
                    questionList[index] = temp;
                    changes.subjectQuestion = questionList;
                    this.props.swapSubjectQuestion(this.state.subjectId, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            } else {
                if (index == questionList.length - 1) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                } else {
                    const temp = questionList[index + 1], changes = {};

                    questionList[index + 1] = questionList[index];
                    questionList[index] = temp;

                    changes.subjectQuestion = questionList;
                    this.props.swapSubjectQuestion(this.state.subjectId, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            }
        }
    };

    updateSubjectQuestion = (_id, changes) => {
        this.props.updateSubjectQuestion(_id, changes, this.state.subjectId, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
        })
    };

    removeQuestion = (e, item) => {
        e.preventDefault();
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                this.props.deleteSubjectQuestion(item._id, this.state.subjectId, () => {
                    T.alert('Xoá câu hỏi thành công!', 'success', false, 1000);
                })
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
    };

    render() {
        const subjectQuestion = this.props.subject && this.props.subject.questions && this.props.subject.questions.subjectQuestion ?
            this.props.subject.questions.subjectQuestion : []
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = 'Chưa có câu hỏi!';
        if (subjectQuestion && subjectQuestion.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên câu hỏi</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectQuestion.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'#'}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <a className='btn btn-primary' href='#' onClick={e => this.showQuestionModal(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {currentPermissions.contains('subject:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.removeQuestion(e, item, index, this.state.subjectId)}>
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
        return <>
            <div className='tile-body'>
                {table}
                <div style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-success' onClick={e => this.showQuestionModal(e, null)}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                        </button>
                </div>
            </div>
            <QuestionModal ref={this.modal} add={this.addQuestion} history={this.props.history} update={this.updateSubjectQuestion} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubjectQuestionList, createSubjectQuestion, updateSubjectQuestion, swapSubjectQuestion, deleteSubjectQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditQuestion);
