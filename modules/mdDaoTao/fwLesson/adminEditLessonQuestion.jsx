import React from 'react';
import { connect } from 'react-redux';
import { getLesson, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from './redux/reduxLesson'
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class QuestionModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemId: null,
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
        let { title, defaultAnswer, content, typeValue, active } = item ?
            item : { title: '', defaultAnswer: '', content: '', typeValue: [], active: false, };
        $(this.btnSave.current).data('isNewMember', item == null);
        $('#questionTitle').val(title);
        $('#questionDefault').val(defaultAnswer);
        $('#questionAnswer').val(typeValue.join('\n'));
        this.editor.current.html(content ? content : '');
        this.setState({
            itemId: item ? item._id : null,
            active: active,
        });
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
        const answerString = $('#questionAnswer').val();
        let ret = (answerString ? answerString : '').split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }

        const changes = {
            title: $('#questionTitle').val().trim(),
            defaultAnswer: $('#questionDefault').val() ? $('#questionDefault').val().trim() : '',
            content: this.editor.current.html(),
            active: this.state.active,
            typeValue: ret,
        };

        if (changes.title == '') {
            T.notify('Tên câu hỏi bị trống', 'danger');
            $('#questionTitle').focus();
        } else {
            if (isNewMember) {
                this.props.add(changes);
                this.hide();
            } else {
                const updateChanges = changes;
                if (updateChanges.typeValue.length == 0 || updateChanges.typeValue[0] == '') updateChanges.typeValue = 'empty';
                this.props.update(itemId, updateChanges);
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
                                    <div className='toggle'>
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

                            <div className='form-group'>
                                <label>Danh sách câu trả lời</label>
                                <textarea defaultValue='' className='form-control' id='questionAnswer' style={{ width: '100%', minHeight: '100px', padding: '0 3px' }} />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='questionDefault'>Đáp án</label>
                                <input type='text' className='form-control' id='questionDefault' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class AdminEditLessonQuestion extends React.Component {
    state = { item: null };
    editor = React.createRef();

    componentDidMount() {
        this.questionModal = React.createRef();
        T.ready('/user/dao-tao/bai-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getQuestionsList(params._id);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                }
            });
        });
    }

    addQuestion = (data) => {
        this.props.createQuestion(this.state.item._id, data, () => {
            T.notify('Thêm câu hỏi thành công!', 'success');
        });
    }

    showQuestionModal = (e, item) => {
        this.questionModal.current.show(item);
        e.preventDefault();
    }

    swap = (e, index, isMoveUp) => {
        let questionList = this.props.lesson && this.props.lesson.questions ? this.props.lesson.questions.lessonQuestion : [];
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
                    changes.lessonQuestion = questionList;
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
                    changes.lessonQuestion = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            }
        }
        e.preventDefault();
    }

    updateQuestion = (_id, changes) => {
        console.log(changes)
        this.props.updateQuestion(_id, changes, this.state.item._id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
        });
    }

    removeQuestion = (e, item, index) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let questionList = this.props.lesson && this.props.lesson.questions ? this.props.lesson.questions.lessonQuestion : [];
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
            params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
        const _id = params._id;
        const lessonQuestion = this.props.lesson && this.props.lesson.questions && this.props.lesson.questions.lessonQuestion ?
            this.props.lesson.questions.lessonQuestion : []
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = 'Chưa có câu hỏi!';
        if (lessonQuestion && lessonQuestion.length > 0) {
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
                        {lessonQuestion.map((item, index) => (
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
                                        {currentPermissions.contains('lesson:write') ?
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
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLesson, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditLessonQuestion);
