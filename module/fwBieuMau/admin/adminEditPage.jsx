import React from 'react';
import { connect } from 'react-redux';
import { updateForm, getForm } from '../redux.jsx';
import Dropdown from '../../../view/component/Dropdown.jsx';
import Countries from 'react-select-country';


class FormEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: null, nationality: null };
        this.sex = React.createRef();
        this.onSelectCountry = this.onSelectCountry.bind(this);
    }

    componentDidMount() {
        $('#formTitle').focus();
        T.ready('/user', () => {
            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png',
                    firstname = this.props.system.user.firstname ? this.props.system.user.firstname : 'Không có tên',
                    lastname = this.props.system.user.lastname ? this.props.system.user.lastname : 'Không có họ';


                this.setState({ image, firstname, lastname });
                this.renderData(this.props.system.user, [], () => {
                    setTimeout(() => {
                        $('#birthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                        // $('#licenseDated').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                    }, 250);
                });
            }

            const route = T.routeMatcher('/user/user-form/edit/:formId'),
                formId = route.parse(window.location.pathname).formId;
            this.props.getForm(formId, { select: '-questions' }, data => {
                if (data.error) {
                    this.props.history.push('/user/user-form');
                } else if (data.item) {
                    this.setState({ item: Object.assign({}, data.item) });
                    let title = T.language.parse(data.item.title, true);
                    $('#formTitle').val(title);
                    $('#formName').val(data.item.formName);
                    $('#residence').val(data.item.residence);
                    $('#identityCard').val(data.item.identityCard);
                    // $('#licenseDated').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
                    // $('#licenseDated').val(data.item.licenseDated ? T.dateToText(licenseDated, 'dd/mm/yyyy') : '');

                } else {
                    this.props.history.push('/user/user-form/list');
                }
            });
        });
    }
    renderData = (user, allDivisions, callback) => {
        let { birthday, sex, } = user ?
            user : { birthday: '', sex: '' };

        $('#birthday').val(birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
        this.sex.current.setText(sex ? sex : '');
        callback && callback();
    }
    onSelectCountry(event) {
        this.state.selectedCountry = {
            id: event.target.value,
            name: event.target.options[event.target.selectedIndex].text
        }
        //OR,if you assign "ref" to the component , ,
        this.state.selectedCountry = this.refs.country.selected; // {value,name}
    }
    changeActive = (event) => {
        console.log('event', event.target.value)
        this.setState({ item: Object.assign({}, this.state.item, { integration: event.target.checked }) });
    }

    save = () => {
        const
            birthday = $('#birthday').val(),
            // licenseDated = $('#licenseDated').val(),
            changes = {
                nationality: this.state.value,
                title: JSON.stringify($('#formTitle').val()),
                birthday: birthday ? T.formatDate(birthday) : 'empty',
                // licenseDated: licenseDated ? T.formatDate(licenseDated) : 'empty',
                formName: $('#formName').val(),
                residence: $('#residence').val(),
                identityCard: $('#identityCard').val(),
                integration: this.state.item.integration,
            };

        this.props.updateForm(this.state.item._id, changes, () => {
            T.notify('Cập nhật thông tin biểu mẫu thành công!', 'success');
        });
    };

    render() {
        const currentPermission = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermission.contains('user-form:write');
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', nationality: '', birthday: '', licenseDated: '', formName: '',
            residence: '', identityCard: '',
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
                                <div className="row">
                                    <div className='form-group col-md-6'>
                                        <label className='control-label'>Họ và tên lót: {this.state.lastname}</label>
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label'>Tên: {this.state.firstname}</label>
                                    </div>
                                </div>
                                <div className='form-group'
                                    style={{ display: 'inline-flex', width: '100%' }}>
                                    <label className='control-label'>Giới tính: </label> &nbsp;&nbsp;
                                            <Dropdown ref={this.sex} text='' items={T.sexes} />
                                </div>
                                <div className="form-group">
                                    <label className='control-label' htmlFor="country">Quốc tịch:</label>
                                    <Countries style={{ borderRadius: '20px', marginLeft: '20px', padding: '5px', outline: 'none', width: '265px' }} ref="country" name="country" empty="--------------Chọn quốc tịch--------------" onChange={(e) => this.onSelectCountry(e)} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='birthday'>Ngày sinh</label>
                                    <input className='form-control' type='text' placeholder='Ngày sinh' id='birthday' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='formName'>Tên đơn</label>
                                    <textarea defaultValue='' className='form-control' id='formName' placeholder='Đơn đăng ký...' readOnly={readOnly}
                                        style={{ minHeight: '100px', marginBottom: '12px' }} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                                    <textarea defaultValue='' className='form-control' id='residence' placeholder='Nhập nơi cư trú...' readOnly={readOnly}
                                        style={{ minHeight: '100px', marginBottom: '12px' }} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='identityCard'>CMND</label>
                                    <input className='form-control' type='text' id='identityCard' placeholder='Nhập số cmnd...' />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label' htmlFor='licenseDated'>Cấp ngày</label>
                                    <input className='form-control' type='text' placeholder='Cấp ngày' id='licenseDated' />
                                </div>
                                <div className='form-group' style={{ display: 'inline-flex' }}>
                                    <label className='control-label' >   Đăng ký tích hợp giấy phép lái xe&nbsp;&nbsp;&nbsp; </label>
                                    <div className="toggle">
                                        <label>
                                            <input type='checkbox' checked={item.integration} onChange={this.changeActive} disabled={readOnly} />
                                            <span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                                <div className='form-group'>
                                    <h5 className='control-label'>Xin gửi kèm theo:</h5>
                                    <div style={{ marginLeft: '15px', marginTop: '15px' }}>
                                        <p>- 01 giấy chứng nhận đủ sức khỏe;</p>
                                        <p>- 05 ảnh màu cỡ 3 cm x 4 cm (Hạng A1), chụp không quá 06 tháng.</p>
                                        <p>- 10 ảnh màu cỡ 3 cm x 4 cm (Hạng B2), chụp không quá 06 tháng.</p>
                                        <p>- Bản sao giấy chứng minh nhân dân hoặc thẻ căn cước công dân hoặc hộ chiếu còn thời hạn có ghi
                                        số giấy chứng minh nhân dân hoặc thẻ căn cước công dân (đối với người Việt Nam) hoặc hộ chiếu (
                                        đối với người nước ngoài
                                        ).
                                            </p>
                                        <p>- Các tài liệu khác có liên quan gồm:
                                            </p>
                                        <p>............................................................................................</p>
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
