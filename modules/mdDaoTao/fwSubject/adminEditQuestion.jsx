import React from 'react';
import { connect } from 'react-redux';
import { getSubject, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from './redux'
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class QuestionModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemId: null,
            value: [],
            active: false,
        };

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = React.createRef();
        this.dataType = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#questionTitle').focus()), 250);
        });
    }


    show = (item) => {
        let { title, content, active } = item ?
            item : { title: '', content: '', active: false, };
        $(this.btnSave.current).data('isNewMember', item == null);
        $('#questionTitle').val(title);
        this.setState({
            itemId: item ? item._id : null,
            active: active,
        });
        this.editor.current.html(content ? content : '');
        $(this.modal.current).modal('show');
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    };

    changeActive = (event) => {
        this.setState({ active: event.target.checked });
    };

    onSelectType = (selectedItem) => {
        this.setState({ selectedItem });
    };

    save = (event) => {
        const itemId = this.state.itemId, btnSave = $(this.btnSave.current), isNewMember = btnSave.data('isNewMember');
        const changes = {
            title: $('#questionTitle').val().trim(),
            content: this.editor.current.html(),
            active: this.state.active,
        };

        if (changes.title == '') {
            T.notify('Tên câu hỏi bị trống', 'danger');
            $('#questionTitle').focus();
        } else {
            if (isNewMember) {
                this.props.add(changes);
                this.hide();
            } else {
                this.props.update(itemId, changes);
                this.hide();
            }

        }
        event.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'
                    onSubmit={e => this.save(e, this.state.itemId, true)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin câu hỏi</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label htmlFor='questionTitle'>Tên câu hỏi</label>
                                <input type='text' className='form-control' id='questionTitle' />
                            </div>
                            <div className='form-group row'>
                                <div className='col-4'>
                                    <label>Kích hoạt</label>
                                    <div className=' toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.active} onChange={this.changeActive} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='form-group'>
                                <label htmlFor=''>Nội dung câu hỏi</label>
                                <Editor ref={this.editor} />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class AdminEditQuestion extends React.Component {
    state = { item: null };
    editor = React.createRef();
    componentDidMount() {
        this.questionModal = React.createRef();
        T.ready('/user/dao-tao/mon-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
            this.props.getQuestionsList(params._id);
            this.props.getSubject(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc');
                }
            });
        });
    }
    addQuestion = (data) => {
        this.props.createQuestion(this.state.item._id, data, () => {
            T.notify('Thêm câu hỏi thành công!', 'success');
        });
    };
    showQuestionModal = (e, item) => {
        this.questionModal.current.show(item);
        e.preventDefault();
    };
    swap = (e, index, isMoveUp) => {
        let questionList = this.props.subject && this.props.subject.questions ? this.props.subject.questions.feedbackQuestion : [];
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
                    changes.feedbackQuestion = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
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

                    changes.feedbackQuestion = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            }
        }
        e.preventDefault();
    };
    updateQuestion = (_id, changes) => {
        this.props.updateQuestion(_id, changes, this.state.item._id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
        })
    };
    removeQuestion = (e, item, index) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let questionList = this.props.subject && this.props.subject.questions ? this.props.subject.questions.feedbackQuestion : [];
                questionList.splice(index, 1);
                if (questionList.length == 0) questionList = 'empty';
                changes.questions = questionList;
                this.props.deleteQuestion(item._id, changes, this.state.item._id, () => {
                    T.alert('Xoá câu hỏi thành công!', 'success', false, 1000);
                })
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
        e.preventDefault();
    };

    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:_id').parse(url);
        const _id = params._id;
        const feedbackQuestion = this.props.subject && this.props.subject.questions && this.props.subject.questions.feedbackQuestion ?
            this.props.subject.questions.feedbackQuestion : []
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = 'Chưa có câu hỏi!';
        if (feedbackQuestion && feedbackQuestion.length > 0) {
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
                        {feedbackQuestion.map((item, index) => (
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
                                            <a className='btn btn-danger' href='#' onClick={e => this.removeQuestion(e, item, index, _id)}>
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
        return (
            <div>
                <div className='tile-body'>{table}</div>
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-success' onClick={e => this.showQuestionModal(e, null)}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                    </button>
                </div>
                <QuestionModal add={this.addQuestion} update={this.updateQuestion} ref={this.questionModal} />
                <Link to='/user/dao-tao/mon-hoc' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getSubject, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditQuestion);
