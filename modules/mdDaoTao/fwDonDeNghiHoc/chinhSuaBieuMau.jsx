import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from './redux';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
const countryList = require('country-list');

class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null };
        this.editor = React.createRef();
        this.quocGia = React.createRef();
    }

    componentDidMount() {
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const { firstname, lastname, sex, birthday } = this.props.system.user || { image: '/img/avatar.png', firstname: '', lastname: '', sex: '', birthday: '' };
                $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                $('#licenseDated').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                //TODO: set birhtday and sex, firstName, lastName
            }

            //TODO: Hide bieuMau id
            const route = T.routeMatcher('/user/user-form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            //TODO: getBieuMauByUser(data => {})
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/user-form');
                } else if (data.item) {
                    $('#formName').val(data.item.formName);
                    $('#residence').val(data.item.residence);
                    $('#identityCard').val(data.item.identityCard);
                    $('#licenseDated').val(data.item.licenseDated ? T.dateToText(data.item.licenseDated, 'dd/mm/yyyy') : '');
                    $('#phoneNumber').val(data.item.phoneNumber);
                    $('#issuedBy').val(data.item.issuedBy);
                    this.editor.current.html(data.item.content);
                    $('#licenseNumber').val(data.item.licenseNumber);

                    $(this.quocGia.current).select2({
                        data: countryList.getCodes().map(id => ({ id, text: countryList.getName(id) })),
                        placeholder: 'Chọn quốc gia'
                    }).val(data.item.nationality).trigger('change');
                } else {
                    this.props.history.push('/user/user-form/list');
                }
            });
        });
    }

    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { integration: event.target.checked }) });
    }

    save = () => {
        const
            birthday = $('#birthday').val(),
            licenseDated = $('#licenseDated').val(),
            changes = {
                nationality: $('#nationality').val(),
                title: $('#formName').val(),
                birthday: birthday ? T.formatDate(birthday) : 'empty',
                licenseDated: licenseDated ? T.formatDate(licenseDated) : 'empty',
                formName: $('#formName').val(),
                residence: $('#residence').val(),
                identityCard: $('#identityCard').val(),
                integration: this.state.item.integration,
                phoneNumber: $('#phoneNumber').val(),
                issuedBy: $('#issuedBy').val(),
                content: this.editor.current.html(),
                licenseNumber: $('#licenseNumber').val(),

            };

        this.props.updateForm(this.state.item._id, changes, () => {
            T.notify('Cập nhật thông tin biểu mẫu thành công!', 'success');
        });
    };

    render() {
        //TODO: Ko can read ONly
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', nationality: '', birthday: '', licenseDated: '', formName: '',
            residence: '', identityCard: '', integration: false, phoneNumber: '', issuedBy: ''
        };
        const title = item.title;
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1 style={{ marginBottom: '15px' }}><i className='fa fa-edit' /> Form: {title} </h1>
                    <p dangerouslySetInnerHTML={{ __html: title != '' ? 'Tiêu đề: <b>' + title + '</b> - ' + T.dateToText(item.createdDate) : '' }} />
                </div>
                <div className='col-md-12'>
                    <div className='tile'>
                        <h3 className='tile-title'>Thông tin biểu mẫu</h3>
                        <div className='tile-body'>
                            <div className='tab-content' style={{ paddingTop: '12px' }}>
                                <div className='row'>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label'>Họ và tên lót: {this.state.lastname}</label>
                                        TODO: change to input
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label'>Tên: {this.state.firstname}</label>
                                        TODO: change to input
                                    </div>
                                </div>
                                <div className='form-group'
                                    style={{ display: 'inline-flex', width: '100%' }}>
                                    <label className='control-label'>Giới tính: {this.state.sex}</label> &nbsp;&nbsp;
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='country'>Quốc tịch:</label>
                                    <select className='form-control select2-input' ref={this.quocGia} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
                                    <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Số điện thoại</label>
                                    <input className='form-control' type='text' placeholder='Nhập số điện thoại' id='phoneNumber' />
                                </div>
                                <div className='form-group'>
                                    //TODO: Xoa ten don
                                    <label className='control-label' htmlFor='formName'>Tên đơn</label>
                                    <textarea defaultValue='' className='form-control' id='formName'
                                        placeholder='Đơn đăng ký...' readOnly={readOnly}
                                        style={{ minHeight: '100px', marginBottom: '12px' }} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                                    <textarea defaultValue='' className='form-control' id='residence'
                                        placeholder='Nhập nơi cư trú...' readOnly={readOnly}
                                        style={{ minHeight: '100px', marginBottom: '12px' }} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='identityCard'>CMND</label>
                                    <input className='form-control' type='text' id='identityCard'
                                        placeholder='Nhập số cmnd...' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='licenseDated'>Cấp ngày</label>
                                    <input className='form-control' type='text' placeholder='Cấp ngày'
                                        id='licenseDated' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='licenseDated'>Nơi cập</label>
                                    <input className='form-control' type='text' placeholder='Nơi cấp' id='issuedBy' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='licenseDated'>Số giấy phép lái xe</label>
                                    <input className='form-control' type='text' placeholder='Số giấy phép lái xe'
                                        id='licenseNumber' />
                                </div>
                                <div className='form-group' style={{ display: 'inline-flex' }}>
                                    <label className='control-label'> Đăng ký tích hợp giấy phép lái
                                        xe&nbsp;&nbsp;&nbsp; </label>
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' checked={item.integration}
                                                onChange={this.changeActive} disabled={readOnly} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <h5 className='control-label'>Xin gửi kèm theo:</h5>
                                    {/*<textarea/>*/}
                                    <Editor ref={this.editor} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/user' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {readOnly ? '' :
                    <button type='button' className='btn btn-primary btn-circle'
                        style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button>}
            </main>
        );
    }
}

const mapStateToProps = state => ({ form: state.form, system: state.system });
const mapActionsToProps = { getForm, updateForm };
export default connect(mapStateToProps, mapActionsToProps)(FormEditPage);
