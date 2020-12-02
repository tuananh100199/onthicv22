import React from 'react';
import { connect } from 'react-redux';
import { getDonDeNghiHocByUser } from './redux.jsx';
import { Link } from 'react-router-dom';
import Dropdown from '../../view/component/Dropdown.jsx';
const countryList = require('country-list');

class UserDonDeNghiPage extends React.Component {
    state = { item: null };
    sex = React.createRef();
    quocGia = React.createRef();
    
    componentDidMount() {
        T.ready('/user', () => {
            $('#userBirthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
            $('#identityDate').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
            if (this.props.system && this.props.system.user) {
                const { firstname, lastname, sex, birthday } = this.props.system.user || { image: '/img/avatar.png', firstname: '', lastname: '', sex: '', birthday: '' };
                $('#userLastname').val(lastname);
                $('#userFirstname').val(firstname);
                //TODO: set birhtday and sex, firstName, lastName
            }
            
            this.props.getDonDeNghiHocByUser(data => {
                if (data.error) {
                    this.props.history.push('/user');
                } else if (data.item) {
                    $('#residence').val(data.item.residence);
                    $('#identityCard').val(data.item.identityCard);
                    $('#licenseDated').val(data.item.licenseDated ? T.dateToText(data.item.licenseDated, 'dd/mm/yyyy') : '');
                    $('#phoneNumber').val(data.item.phoneNumber);
                    $('#issuedBy').val(data.item.issuedBy);
                    $('#licenseNumber').val(data.item.licenseNumber);
                    
                    $(this.quocGia.current).select2({
                        data: countryList.getCodes().map(id => ({ id, text: countryList.getName(id) })),
                        placeholder: 'Chọn quốc gia'
                    }).val(data.item.nationality).trigger('changed');
                } else {
                    this.props.history.push('/user');
                }
            });
        });
    }
    
    changeActive = (event) => {
        this.setState({ item: Object.assign({}, this.state.item, { integration: event.target.checked }) });
    }
    
    save = () => {
        //TODO: Luu bieu mau tu user
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
        const item = this.state.item ? this.state.item : {
            _id: '', title: '', nationality: '', birthday: '', licenseDated: '', formName: '',
            residence: '', identityCard: '', integration: false, phoneNumber: '', issuedBy: ''
        };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-id-card-o'/> Đơn đề nghị học, sát hạch để cấp giấy phép lái xe</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' />&nbsp;</Link>
                        / &nbsp; Biểu mẫu
                    </ul>
                </div>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin biểu mẫu</h3>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='userLastname'>Họ và tên lót</label>
                                <input type='text' className='form-control' id='userLastname' placeholder='Họ và tên lót' />
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='userFirstname'>Tên</label>
                                <input type='text' className='form-control' id='userFirstname' placeholder='Tên' />
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Quốc tịch</label>
                                <select className='form-control select2-input' ref={this.quocGia}/>
                            </div>
                        </div>
                        
                        <div className='row'>
                            <div className='form-group col-md-3' id='donDeNghiSection'>
                                <label className='control-label' htmlFor='userBirthday'>Ngày sinh</label>
                                <input className='form-control' type='text' placeholder='Ngày sinh' id='userBirthday' autoComplete='off' data-date-container='#donDeNghiSection'/>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Giới tính</label><br/>
                                <Dropdown ref={this.sex} text='' items={T.sexes} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Số điện thoại</label>
                                <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber'/>
                            </div>
                        </div>
                        
                        <div className='form-group'>
                            <label className='control-label' htmlFor='residence'>Nơi đăng ký hộ khẩu thường trú: TODO</label>
                            <textarea className='form-control' id='residence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='3'/>
                        </div>
                        
                        <div className='form-group'>
                            <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                            <textarea className='form-control' id='residence' placeholder='Nơi cư trú' rows='3'/>
                        </div>
    
                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu)</label>
                                <input className='form-control' type='text' id='identityCard'
                                       placeholder='Nhập số cmnd...'/>
                            </div>
                            <div className='form-group col-md-3' id='identityDateSection'>
                                <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
                                <input className='form-control' type='text' placeholder='Cấp ngày' id='identityDate' data-date-container='#identityDateSection'/>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='issuedBy'>Nơi cấp</label>
                                <input className='form-control' type='text' placeholder='Nơi cấp' id='issuedBy'/>
                            </div>
                        </div>
                        
                        <div className='form-group'>
                            <label className='control-label' htmlFor='licenseDated'>Đã có giấy phép lái xe số TODO: Hạng, Do ...</label>
                            <input className='form-control' type='text' placeholder='Số giấy phép lái xe' id='licenseNumber'/>
                        </div>
                        
                        {/*//TODO: đề nghị cho tôi được học ....*/}
                        <div className='form-group' style={{ display: 'inline-flex' }}>
                            <label className='control-label'> Đăng ký tích hợp giấy phép lái xe&nbsp; </label>
                            <div className='toggle'>
                                <label>
                                    <input type='checkbox' checked={item.integration} onChange={this.changeActive}/>
                                    <span className='button-indecator'/>
                                </label>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>Các tài liệu khác có liên quan bao gồm:</label>
                            {/*<textarea/>*/}
                        </div>
                    </div>
                </div>
                <Link to='/user' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply'/>
                </Link>
                <button type='button' className='btn btn-primary btn-circle'
                        style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save'/>
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getDonDeNghiHocByUser };
export default connect(mapStateToProps, mapActionsToProps)(UserDonDeNghiPage);
