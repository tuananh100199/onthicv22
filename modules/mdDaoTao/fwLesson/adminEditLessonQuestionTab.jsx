import React from 'react';
import { connect } from 'react-redux';
import { getLesson, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from './redux'
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import { AdminModal, FormCheckbox } from 'view/component/AdminPage';

class QuestionModal extends AdminModal {
    editor = React.createRef();
    componentDidMount() {
        $(document).ready(() => this.onShown(() => $('#questionName').focus()));
    }

    onShow = (item) => {
        let { _id, title, content, active, defaultAnswer, typeValue } = item ? item : { _id: null, title: '', content: '', active: false, defaultAnswer: '', typeValue: [] };
        $('#questionName').val(title ? title : '');
        $('#questionDefault').val(defaultAnswer);
        $('#questionAnswer').val(typeValue.join('\n'));
        this.itemIsActive.value(active);
        this.editor.current.html(content ? content : '');
        $(this.modal.current).data('_id', _id).modal('show');
    }

    onSubmit = () => {
        const _id = $(this.modal.current).data('_id');
        const answerString = $('#questionAnswer').val();
        let ret = (answerString ? answerString : '').split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }
        let newData = {
            title: $('#questionName').val().trim(),
            defaultAnswer: $('#questionDefault').val() ? $('#questionDefault').val().trim() : '',
            content: this.editor.current.html(),
            active: this.itemIsActive.value(),
            typeValue: ret,
        };
        if (newData.title == '') {
            T.notify('Tên câu hỏi bị trống!', 'danger');
            $('#questionName').focus();
        } else {
            if (newData.typeValue.length == 0 || newData.typeValue[0] == '') newData.typeValue = 'empty';
            !_id ? this.props.add(newData) : this.props.update(_id, newData);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Câu hỏi mới',
        size: 'large',
        body:
            <div>
                <div className='form-group'>
                    <label htmlFor='questionName'>Tên câu hỏi</label>
                    <input className='form-control' id='questionName' type='text' placeholder='Nhập tên câu hỏi' autoFocus={true} />
                </div>
                <FormCheckbox ref={e => this.itemIsActive = e} className='col-md-4' label='Kích hoạt' />
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
    });
}

class AdminEditLessonQuestion extends React.Component {
    state = { item: null };
    modal = React.createRef();

    componentDidMount() {
        T.ready('/user/dao-tao/bai-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getQuestionsList(params._id);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc');
                } else if (data.item) {
                    this.setState(data);
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc');
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
        this.modal.current.show(item);
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
        this.props.updateQuestion(_id, changes, this.state.item._id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
        });
    }

    removeQuestion = (e, item, index) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title}</strong>?`, true, isConfirm => {
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
                <QuestionModal ref={this.modal} add={this.addQuestion} history={this.props.history} update={this.updateQuestion} />
                <Link to='/user/dao-tao/bai-hoc' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { getLesson, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditLessonQuestion);
