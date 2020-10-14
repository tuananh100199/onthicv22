import React from 'react';
import { connect } from 'react-redux';
import { addAnswer, searchUserFromSystem } from '../../reduxAnswer.jsx';
import { createUser, updateUser } from '../../../fwUser/redux.jsx';
import AdminRegisterElement from './AdminRegisterElement.jsx';

class AddAnswerModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
        this.searchUser = React.createRef();

        this.valueList = [];
        for (let i = 0; i < 300; i++) {
            this.valueList[i] = React.createRef();
        }
        this.state = { show: false, user: null, message: '' }
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => {
                $(this.searchUser.current).focus();
                ['userEmail', 'userLastName', 'userFirstName', 'userOrganizationId'].forEach(identify => {
                    $('#' + identify).val('');
                });
                this.setState({ show: true, user: null, message: '' });
            });

            $(this.modal.current).on('hidden.bs.modal', () => {
                this.setState({ show: false });
            });

            $(this.searchUser.current).on('blur', (e) => {
                this.search(e, $(this.searchUser.current).val());
            });
            $(this.searchUser.current).on('keypress', (e) => {
                if (e.which == 13) {
                    this.search(e, $(this.searchUser.current).val());
                }
            });
        });
    }

    show = () =>  { $(this.modal.current).modal('show'); };
    hide = () => { $(this.modal.current).modal('hide'); };

    search = (e, email) => {
        if (!email || !T.validateEmail(email)) {
            $('#messageComponent').css('color', '#dc3545');
            this.setState({ user: null, message: 'Email không hợp lệ!' });
            ['userLastName', 'userFirstName'].forEach(identify => {
                $('#' + identify).val('');
            });
        } else {
            this.props.searchUserFromSystem(email, data => {
                if (data.error) {
                    $('#messageComponent').css('color', '#dc3545');
                    this.setState({ message: 'Đã xảy ra lỗi khi tìm kiếm người dùng!' });
                } else if (!data.user) {
                    $('#messageComponent').css('color', '#000');
                    this.setState({ message: 'Người dùng này chưa có trong hệ thống, thao tác này sẽ tạo mới người dùng!' });
                } else {
                    this.setState({ user: data.user, message: '' });
                    const { firstname, lastname } = data.user;
                    $('#userLastName').val(lastname);
                    $('#userFirstName').val(firstname);
                }
            });
        }
        e.preventDefault();
    };

    saveUser = (e) => {
        const changes = {
            lastname: $('#userLastName').val().trim(),
            firstname: $('#userFirstName').val().trim(),
        };
        if (this.state.user && this.state.user._id) {
            this.props.updateUser(this.state.user._id, changes);
        } else {
            changes.email = $(this.searchUser.current).val();
            changes.active = true;
            changes.password = T.randomPassword(8);
            if (changes.lastname == '') {
                T.notify('Họ và tên lót bị trống', 'danger');
                $('#userLastName').focus();
            } else if (changes.firstname == '') {
                T.notify('Tên bị trống', 'danger');
                $('#userFirstName').focus();
            } else {
                this.props.createUser(changes, (data) => {
                    if (data.user) {
                        T.notify('Tạo người dùng mới thành công', 'success');
                        this.setState({ user: data.user, message: '' });
                    }
                });
            }
        }
        e.preventDefault();
    };

    fillDefaultValue = (e) => {
        const questionList = this.props.questions ? this.props.questions : [];
        questionList.forEach((question, index) => {
            this.valueList[index].current.setData(question.typeName, question.defaultAnswer);
        });
        e.preventDefault();
    };

    save = (e) => {
        if (this.state.user && this.state.user._id) {
            const { formId } = this.props ? this.props : { formId: '' };
            const questionList = this.props.questions ? this.props.questions : [];
            let record = [];
            let i = 0;
            for (i; i < questionList.length; i++) {
                record.push(
                    {
                        questionId: questionList[i]._id,
                        answer: this.valueList[i].current.getValue()
                    }
                );
            }

            if (i == questionList.length) {
                const changes = { formId, user: this.state.user._id, record };
                this.props.addAnswer(changes, formId, () => {
                    T.notify('Thêm người tham gia thành công!', 'success');
                    this.hide();
                })
            } else {
                T.notify('Thêm người tham gia bị lỗi!', 'danger');
            }
        } else {
            T.notify('Chưa có thông tin người đăng ký!', 'danger');
        }
        e.preventDefault();
    };

    render() {
        const readOnly = this.props.readOnly;
        const questionList = this.props.questions ? this.props.questions : [];
        const createForm = () => {
            if (!questionList || questionList.length == 0) {
                return <p>Null</p>;
            }
            let form = [];
            for (let i = 0; i < questionList.length; i++) {
                form.push(<AdminRegisterElement key={i} ref={this.valueList[i]} element={questionList[i]} index={i} />);
            }

            return form;
        };

        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog' role='document' style={{ maxWidth: '95%' }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm người tham gia</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body row'>
                            <div className='col-12 col-md-6'>
                                <div className='tile'>
                                    <h3 className='tile-title'>Thông tin người dùng</h3>
                                    <div className='tile-body'>
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='userEmail'>Email người dùng</label>
                                            <input ref={this.searchUser} className='form-control' type='email' id='userEmail' autoComplete='off'
                                                placeholder='Email người dùng' />
                                        </div>
                                        <div id='messageComponent' className='form-control-feedback'
                                            style={{ visibility: this.state.message == '' ? 'hidden' : 'visible' }}>
                                            {this.state.message}
                                        </div>
                                        <div className='form-group row'>
                                            <div className='col-12 col-sm-8'>
                                                <label className='control-label' htmlFor='userLastName'>Họ và tên lót</label>
                                                <input className='form-control' type='text' id='userLastName'
                                                    placeholder='Họ và tên lót' autoComplete='off' />
                                            </div>
                                            <div className='col-12 col-sm-4'>
                                                <label className='control-label' htmlFor='userFirstName'>Tên</label>
                                                <input className='form-control' type='text' id='userFirstName'
                                                    placeholder='Tên' autoComplete='off' />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='tile-footer'>
                                        <button className='btn btn-success' type='button' onClick={this.saveUser}>
                                            <i className='fa fa-fw fa-lg fa-check-circle' />{this.state.user ? 'Cập nhật user' : 'Tạo user'}
                                        </button>
                                        &nbsp;&nbsp;&nbsp;
                                        <button type='button' className='btn btn-info' ref={this.btnSave} onClick={e => this.fillDefaultValue(e)}>
                                            <i className='fa fa-fw fa-lg fa-pencil-square-o' />Điền dữ liệu mặc định
                                        </button>
                                        &nbsp;&nbsp;&nbsp;
                                        {this.state.user && this.state.user._id && !readOnly ? (
                                            <button type='button' className='btn btn-primary' onClick={this.save}>
                                                <i className='fa fa-fw fa-lg fa-floppy-o' />Lưu
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-md-6'>
                                {this.state.show ? createForm() : null}
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { addAnswer, createUser, updateUser, searchUserFromSystem };
export default connect(mapStateToProps, mapActionsToProps, null, { forwardRef: true })(AddAnswerModal);
