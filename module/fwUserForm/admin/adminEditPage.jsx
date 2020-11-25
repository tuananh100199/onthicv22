import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../redux.jsx';
// import { getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from '../reduxQuestion.jsx';
// import { countAnswer } from '../reduxAnswer.jsx';
import ImageBox from '../../../view/component/ImageBox.jsx';
import Editor from '../../../view/component/CkEditor4.jsx';
import Select from 'react-select';

class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, numOfRegisterUsers: 0 };
        this.imageBox = React.createRef();
        this.viEditor = React.createRef();
    }

    componentDidMount() {
        console.log('componentDidMount')
        $('#formTitle').focus();
        $('#formStartRegister').datetimepicker(T.dateFormat);
        $('#formStopRegister').datetimepicker(T.dateFormat);
        T.ready('/user/user-form/list', () => {
            const route = T.routeMatcher('/user/user-form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/user-form/list');
                } else if (data.item) {
                    const formStartRegister = $('#formStartRegister').datetimepicker(T.dateFormat);
                    const formStopRegister = $('#formStopRegister').datetimepicker(T.dateFormat);
                    if (data.item.startRegister) formStartRegister.datetimepicker('update', new Date(data.item.startRegister));
                    if (data.item.stopRegister) formStopRegister.datetimepicker('update', new Date(data.item.stopRegister));

                    data.image = data.item.image ? data.item.image : '/img/avatar.jpg';
                    this.imageBox.current.setData('user-form:' + data.item._id);

                    let title = T.language.parse(data.item.title, true),
                        description = T.language.parse(data.item.description, true);

                    $('#formTitle').val(title.vi);
                    this.viEditor.current.html(description.vi);
                    $('#formMaxRegisterUsers').val(data.item.maxRegisterUsers);
                   
                } else {
                    this.props.history.push('/user/user-form/list');
                }
            });
        });
    }

    changeActive = (e) => {
        console.log('active',this.state.item)
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
                title: JSON.stringify({ vi: $('#formTitle').val() }),
                active: this.state.item.active,
                lock: this.state.item.lock,
                description: JSON.stringify({ vi: this.viEditor.current.html() }),
                maxRegisterUsers: $('#formMaxRegisterUsers').val(),
                startRegister: startRegister ? T.formatDate(startRegister) : 'empty',
                stopRegister: stopRegister ? T.formatDate(stopRegister) : 'empty',
            };

        this.props.updateForm(this.state.item._id, changes, () => {
            T.notify('Cập nhật thông tin form thành công!', 'success');
        });
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
                    this.props.swapQuestion(this.state.item._id, changes, () => {
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

    render() {
        console.log('render')

        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', maxRegisterUsers: -1, image: '/img/avatar.jpg', createdDate: new Date(),
            startRegister: '', stopRegister: '', active: false, lock: false
        };
        console.log('item',this.state.item)

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
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='formViTab' className='tab-pane fade show active'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tên form</label>
                                            <input className='form-control' type='text' placeholder='Tên form' id='formTitle' readOnly={readOnly} defaultValue={item.title} />
                                        </div>
                                        <label className='control-label'>Mô tả form</label>
                                        <Editor ref={this.viEditor} height={200} uploadUrl='/user/upload?category=form' readOnly={readOnly} />
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
                                        <br/>
                                        <div className='form-group' style={{ display: 'inline-flex' }}>
                                            <label className='control-label'>Khóa form:&nbsp;</label>
                                            <div className='toggle'>
                                                <label>
                                                    <input type='checkbox' checked={item.lock} onChange={this.changeLock} disabled={readOnly}/><span className='button-indecator' />
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
                </div>
                <button className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }} onClick={() => this.props.history.goBack()}>
                    <i className='fa fa-lg fa-reply' />
                </button>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = { getForm, updateForm };
export default connect(mapStateToProps, mapActionsToProps)(FormEditPage);
