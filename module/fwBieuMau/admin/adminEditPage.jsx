import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../redux.jsx';
import Dropdown from '../../../view/component/Dropdown.jsx';
import countryList from 'react-select-country-list'
import Select from 'react-select'


class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, options: this.options, value: null, };
        this.imageBox = React.createRef();
        this.firstname = React.createRef();
        this.lastname = React.createRef();
        this.email = React.createRef();
        this.phoneNumber = React.createRef();
        this.password1 = React.createRef();
        this.password2 = React.createRef();

        this.sex = React.createRef();
        this.options = countryList().getData()
    }

    componentDidMount() {
        console.log('this.options',this.options)
        $('#formTitle').focus();
        $('#formStartRegister').datetimepicker(T.dateFormat);
        $('#formStopRegister').datetimepicker(T.dateFormat);
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png';
                this.setState({ image });
                this.renderData(this.props.system.user, [], () => {
                    setTimeout(() => {
                        $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                    }, 250);
                });
            }

            const route = T.routeMatcher('/user/user-form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/user-form');
                } else if (data.item) {
                    this.setState({ item: Object.assign({},data.item) });
                    let title = T.language.parse(data.item.title, true);
                    $('#formTitle').val(title.vi);
                    $('#formMaxRegisterUsers').val(data.item.maxRegisterUsers);
                   
                } else {
                    this.props.history.push('/user/user-form/list');
                }
            });
        });
    }
    renderData = (user, allDivisions, callback) => {
        let { firstname, lastname, email, phoneNumber, birthday, sex, image } = user ?
                user : { firstname: '', lastname: '', phoneNumber: '', birthday: '', sex: '', image: '/img/avatar.png' };

        $('#userLastname').val(lastname);
        $('#userFirstname').val(firstname);
        $('#email').html(email);
        $('#birthday').val(birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
        $('#phoneNumber').val(phoneNumber);
        this.sex.current.setText(sex ? sex : '');
        callback && callback();
    }

    changeHandler = value => {
        this.setState({ value })
      }

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
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', maxRegisterUsers: -1, image: '/img/avatar.jpg', createdDate: new Date(),
            startRegister: '', stopRegister: '', active: false, lock: false
        };

        const title = T.language.parse(item.title, true);

        return (
            <main className='app-content'>
                <div className='app-title'>
                        <h1 style={{ marginBottom: '15px' }}><i className='fa fa-edit' /> Form: {title.vi} </h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin biểu mẫu</h3>
                            <div className='tile-body'>
                                <div className='tab-content' style={{ paddingTop: '12px' }}>
                                    <div id='formViTab' className='tab-pane fade show active'>
                                        <div className='form-group'>
                                            <label className='control-label'>Tên form</label>
                                            <input className='form-control' type='text' placeholder='Tên form' id='formTitle' readOnly={readOnly} defaultValue={item.title} />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userLastname'>Họ và tên lót</label>
                                            <input className='form-control' id='userLastname' type='text' placeholder='Họ và tên lót' />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userFirstname'>Tên</label>
                                            <input className='form-control' type='text' id='userFirstname' placeholder='Tên' />
                                        </div>
                                        <div className='form-group'
                                             style={{ display: 'inline-flex', width: '100%' }}>
                                            <label className='control-label'>Giới tính: </label> &nbsp;&nbsp;
                                            <Dropdown ref={this.sex} text='' items={T.sexes} style={{paddingTop:'4px'}}/>
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userFirstname'>Quốc tịch</label>
                                            <Select
                                                options={this.state.options}
                                                value={this.state.value}
                                                onChange={this.changeHandler}
                                            />
                                        </div>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
                                            <input className='form-control' type='text'
                                                   placeholder='Ngày sinh' id='birthday' />
                                        </div>
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
