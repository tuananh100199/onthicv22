import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../redux';
import { getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from '../reduxQuestion';
import { countAnswer } from '../reduxAnswer';
import ImageBox from 'view/component/ImageBox';
import Editor from 'view/component/CkEditor4';
import Select from 'react-select';

class QuestionModal extends React.Component {
    constructor(props) {
        super(props);
        let types = Object.keys(T.questionTypes).map(key => ({ value: key, label: T.questionTypes[key] }));
        this.state = {
            questionTypes: types,
            itemID: null,
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
        let { title, defaultAnswer, content, typeName, typeValue, active } = item ?
            item : { title: '', defaultAnswer: '', content: '', typeName: '', typeValue: [], active: false, };
        $(this.btnSave.current).data('isNewMember', item == null);
        $('#questionTitle').val(title);
        $('#questionDefault').val(defaultAnswer);
        $('#questionAnswer').val(typeValue.join('\n'));
        this.setState({
            selectedItem: { value: typeName, label: T.questionTypes[typeName] },
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
            typeName: this.state.selectedItem ? this.state.selectedItem.value : null,
            typeValue: ret,
        };

        if (changes.title == '') {
            T.notify('Tên câu hỏi bị trống', 'danger');
            $('#questionTitle').focus();
        } else if (changes.typeName == '' || !changes.typeName) {
            T.notify('Loại câu hỏi bị trống!', 'danger');
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
        const select = this.state.selectedItem;
        let isShow = (select && select.value && (select.value == 'choice' || select.value == 'multiChoice')) ? 'block' : 'none';
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
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor='questionTitle'>Tên câu hỏi</label>
                                    <input type='text' className='form-control' id='questionTitle' />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-4'>
                                    <label>Kích hoạt</label>
                                    <div className='col-12 col-sm-12 toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.active} onChange={this.changeActive} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='col-8'>
                                    <label htmlFor=''>Loại câu hỏi</label>
                                    <Select options={this.state.questionTypes} onChange={this.onSelectType} value={this.state.selectedItem} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor=''>Nội dung câu hỏi</label>
                                    <Editor ref={this.editor} />
                                </div>
                            </div>

                            <div className='form-group row' style={{ display: isShow }}>
                                <div key={0} className='col-12'>
                                    <label>Danh sách câu trả lời</label>
                                    <textarea defaultValue='' className='form-control' id='questionAnswer' style={{ width: '100%', minHeight: '100px', padding: '0 3px' }} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor='questionDefault'>Câu trả lời mặc định</label>
                                    <input type='text' className='form-control' id='questionDefault' />
                                </div>
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

class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, numOfRegisterUsers: 0 };
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
        this.enEditor = React.createRef();
        this.questionModal = React.createRef();
    }

    componentDidMount() {
        $('#formViTitle').focus();
        $('#formStartRegister').datetimepicker(T.dateFormat);
        $('#formStopRegister').datetimepicker(T.dateFormat);
        T.ready('/user/form/list', () => {
            const route = T.routeMatcher('/user/form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getQuestionsList(formId);
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/form/list');
                } else if (data.item) {
                    const formStartRegister = $('#formStartRegister').datetimepicker(T.dateFormat);
                    const formStopRegister = $('#formStopRegister').datetimepicker(T.dateFormat);
                    if (data.item.startRegister) formStartRegister.datetimepicker('update', new Date(data.item.startRegister));
                    if (data.item.stopRegister) formStopRegister.datetimepicker('update', new Date(data.item.stopRegister));

                    data.image = data.item.image ? data.item.image : '/img/avatar.jpg';
                    this.imageBox.current.setData('form:' + data.item._id);

                    let title = T.language.parse(data.item.title, true),
                        description = T.language.parse(data.item.description, true);

                    $('#formViTitle').val(title.vi);
                    $('#formEnTitle').val(title.en);
                    this.viEditor.current.html(description.vi);
                    this.enEditor.current.html(description.en);
                    $('#formMaxRegisterUsers').val(data.item.maxRegisterUsers);
                    this.props.countAnswer(data.item._id, (numOfRegisterUsers) => {
                        this.setState(Object.assign({}, data, { numOfRegisterUsers: numOfRegisterUsers ? numOfRegisterUsers : 0 }));
                    });
                } else {
                    this.props.history.push('/user/form/list');
                }
            });
        });
    }

    changeActive = (e) => {
        const item = this.state.item;
        this.setState({ item: Object.assign({}, item, { active: e.target.checked }) });
    };

    changeLock = (event) => {
        const item = this.state.item;
        this.setState({ item: Object.assign({}, item, { lock: event.target.checked }) });
    };

    save = () => {
        const
            startRegister = $('#formStartRegister').val(),
            stopRegister = $('#formStopRegister').val(),
            changes = {
                title: JSON.stringify({ vi: $('#formViTitle').val(), en: $('#formEnTitle').val() }),
                active: this.state.item.active,
                lock: this.state.item.lock,
                description: JSON.stringify({ vi: this.viEditor.current.html(), en: this.enEditor.current.html() }),
                maxRegisterUsers: $('#formMaxRegisterUsers').val(),
                startRegister: startRegister ? T.formatDate(startRegister) : 'empty',
                stopRegister: stopRegister ? T.formatDate(stopRegister) : 'empty',
            };

        this.props.updateForm(this.state.item._id, changes, () => {
            T.notify('Cập nhật thông tin form thành công!', 'success');
        });
    };

    addQuestion = (data) => {
        this.props.createQuestion(this.state.item._id, data, () => {
            T.notify('Thêm câu hỏi thành công!', 'info');
        });
    };

    updateQuestion = (_id, changes) => {
        this.props.updateQuestion(_id, changes, this.state.item._id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'info');
        })
    };

    swap = (e, index, isMoveUp) => {
        let questionList = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        if (questionList.length == 1) {
            T.notify('Thay đổi thứ tự câu hỏi thành công', 'info');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'info');
                } else {
                    const temp = questionList[index - 1], changes = {};

                    questionList[index - 1] = questionList[index];
                    questionList[index] = temp;

                    changes.questions = questionList;
                    this.props.swapLesson(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'info');
                    });
                }
            } else {
                if (index == questionList.length - 1) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'info');
                } else {
                    const temp = questionList[index + 1], changes = {};

                    questionList[index + 1] = questionList[index];
                    questionList[index] = temp;

                    changes.questions = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'info');
                    });
                }
            }
        }
        e.preventDefault();
    };

    removeQuestion = (e, item, index) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let questionList = this.props.question && this.props.question.questions ? this.props.question.questions : [];
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

    showModal = (e, item) => {
        this.questionModal.current.show(item);
        e.preventDefault();
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('form:write');
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', maxRegisterUsers: -1, image: '/img/avatar.jpg', createdDate: new Date(),
            startRegister: '', stopRegister: '', active: false, lock: false
        };

        const questionList = this.props.question && this.props.question.questions ? this.props.question.questions : [];
        const questionTable = questionList && questionList.length ? (
            <table className='table table-hover table-bordered'>
                <thead>
                    <tr>
                        <th style={{ width: 'auto' }}>STT</th>
                        <th style={{ width: '100%', textAlign: 'center' }}>Câu hỏi</th>
                        <th style={{ width: 'auto', textAlign: 'center' }}>Loại</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                        {!readOnly ? <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {questionList.map((item, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                {!readOnly ? <a href='#' onClick={e => this.showModal(e, item)}>{item.title}</a> : item.title}
                            </td>
                            <td nowrap='true'>
                                {T.questionTypes[item.typeName]}
                            </td>
                            <td className='toggle' style={{ textAlign: 'center' }}>
                                <label>
                                    <input type='checkbox' checked={item.active} disabled={readOnly} onChange={() => this.updateQuestion(item._id, { active: !item.active })} /><span className='button-indecator' />
                                </label>
                            </td>
                            {!readOnly ?
                                <td className='btn-group'>
                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                        <i className='fa fa-lg fa-arrow-up' />
                                    </a>
                                    <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                        <i className='fa fa-lg fa-arrow-down' />
                                    </a>
                                    <button type='button' className='btn btn-primary'
                                        onClick={e => this.showModal(e, item)}>
                                        <i className='fa fa-lg fa-edit' />
                                    </button>
                                    <button type='button' className='btn btn-danger' onClick={e => this.removeQuestion(e, item, index)}>
                                        <i className='fa fa-lg fa-trash' />
                                    </button>
                                </td> : null
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : <p>Không có câu hỏi</p>;
        const title = T.language.parse(item.title, true);

        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Form: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin form</h3>
                            <div className='tile-body'>
                                <ul className='nav nav-tabs'>
                                    <li className='nav-item'>
                                        <a className='nav-link active show' data-toggle='tab' href='#formViTab'>Việt Nam</a>
                                    </li>
                                    <li className='nav-item'>
                                        <a className='nav-link' data-toggle='tab' href='#formEnTab'>English</a>
                                    </li>
                                </ul>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='formViTab' className='tab-pane fade show active'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tên form</label>
                                            <input className='form-control' type='text' placeholder='Tên form' id='formViTitle' readOnly={readOnly} defaultValue={item.title} />
                                        </div>
                                        <label className='control-label'>Mô tả form</label>
                                        <Editor ref={this.viEditor} height={200} uploadUrl='/user/upload?category=form' readOnly={readOnly} />
                                    </div>
                                    <div id='formEnTab' className='tab-pane fade'>
                                        <div className='form-group'>
                                            <label className='control-label'>Form title</label>
                                            <input className='form-control' type='text' placeholder='Form title' id='formEnTitle' readOnly={readOnly} defaultValue={title.en} />
                                        </div>
                                        <label className='control-label'>Form description</label>
                                        <Editor ref={this.enEditor} height={200} uploadUrl='/user/upload?category=form' readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Điều khiển form</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Thời gian mở đăng ký</label>
                                    <input className='form-control' id='formStartRegister' type='text' placeholder='Thời gian mở đăng ký' defaultValue={item.startRegister} disabled={readOnly} autoComplete='off' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Thời gian đóng đăng ký</label>
                                    <input className='form-control' id='formStopRegister' type='text' placeholder='Thời gian đóng đăng ký' defaultValue={item.stopRegister} disabled={readOnly} autoComplete='off' />
                                </div>

                                <div className='row'>
                                    <div className='col-md-8'>
                                        <div className='form-group'>
                                            <label className='control-label'>Hình ảnh nền</label>
                                            <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='FormImage' readOnly={readOnly} image={this.state.image} />
                                        </div>
                                    </div>
                                    <div className='col-md-4'>
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Kích hoạt:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.active} onChange={this.changeActive} disabled={readOnly} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                        <br />
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Khóa form:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.lock} onChange={this.changeLock} disabled={readOnly} /><span className='button-indecator' />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số lượng đăng ký tối đa</label><br />
                                    <input className='form-control' id='formMaxRegisterUsers' type='number' placeholder='Số lượng đăng ký tối đa' readOnly={readOnly} defaultValue={item.maxRegisterUsers}
                                        aria-describedby='formMaxRegisterUsersHelp' />
                                    <small className='form-text text-success' id='formMaxRegisterUsersHelp'>Điền -1 nếu không giới hạn số lượng đăng ký tối đa.</small>
                                </div>
                                <div className='form-group row'>
                                    <label className='control-label col-12'>Số lượng đăng ký tham gia: {this.state.numOfRegisterUsers}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Danh sách câu hỏi</h3>
                            <div className='tile-body'>
                                {questionTable}
                            </div>
                            {!readOnly ?
                                <button type='button' className='btn btn-primary' style={{ position: 'absolute', right: '30px', top: '10px' }} onClick={e => this.showModal(e, null)}>
                                    Thêm câu hỏi
                                </button> : null
                            }
                        </div>
                    </div>
                </div>
                <button className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }} onClick={() => this.props.history.goBack()}>
                    <i className='fa fa-lg fa-reply' />
                </button>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
                <QuestionModal key={1} add={this.addQuestion} update={this.updateQuestion} ref={this.questionModal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, question: state.reduxQuestion, system: state.system });
const mapActionsToProps = {
    getForm, updateForm, countAnswer,
    getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion
};
export default connect(mapStateToProps, mapActionsToProps)(FormEditPage);
