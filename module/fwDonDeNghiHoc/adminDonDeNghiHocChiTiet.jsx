import React from 'react';
import { connect } from 'react-redux';
import { getForm, updateForm, sendEmailTuChoiDonDeNghiHoc } from './redux.jsx';
import { updateProfile } from '../_init/reduxSystem.jsx'
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import Dropdown from '../../view/component/Dropdown.jsx';
const countryList = require('country-list');

class AdminDonDeNghiHocChiTiet extends React.Component {
    constructor(props) {
        super(props);
        this.viEditor = React.createRef();
    }
    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let userForm = this.props.donDeNghiHoc.item;
            if (!this.loading && this.props.getForm && userForm) {
                this.loading = true;
                this.props.getForm(userForm._id, () => this.loading = false);
            }
        });
    }

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/don-de-nghi-hoc-chi-tiet/item/:_id').parse(url);
        this.props.getForm(params._id, () => this.loading = false);
    }

    accept = () => {
        const changesOfForm = {
            approve: "approved",
        }
        this.props.updateForm(this.props.donDeNghiHoc.item._id, changesOfForm, () => {
            T.notify('Đã chấp nhận đơn đề nghị học!', 'success');
        });
        console.log(this.props.donDeNghiHoc)
    }

    save = () => {
        $("#submit-btn").attr("disabled", true);
        let reasonOfForm = {
            reason: this.viEditor.current.html(),
        }
        if (!this.viEditor.current.html()) {
            T.notify('Lý do không được để trống', 'danger');
        } else {
            reasonOfForm = {
                reason: this.viEditor.current.html(),
                approve: "eject"
            }
            this.props.updateForm(this.props.donDeNghiHoc.item._id, reasonOfForm);
            this.props.sendEmailTuChoiDonDeNghiHoc(this.props.donDeNghiHoc.item._id, () => {
                $("#submit-btn").removeAttr("disabled");
                $('#modal').modal('hide');
            })

        }
    }

    render() {
        const item = this.props.donDeNghiHoc && this.props.donDeNghiHoc.item ?
            this.props.donDeNghiHoc.item : null;
        const table = item ? (
            <div className='tile'>
                <div className='tile-body'>
                    <div className='row'>
                        <div className='form-group col-md-6'>
                            <label className='control-label' htmlFor='username'>Họ và tên: <span>{item.user.lastname + ' ' + item.user.firstname}</span></label>
                        </div>
                        <div className='form-group col-md-3'>
                            <label className='control-label'>Quốc tịch: <span>{countryList.getName(item.user.nationality)}</span></label>
                        </div>
                    </div>

                    <div className='row'>
                        <div className='form-group col-md-3' id='donDeNghiSection'>
                            <label className='control-label' htmlFor='userBirthday'>Ngày sinh: <span>{T.dateToText(item.user.birthday, 'dd/mm/yyyy')}</span></label>
                        </div>
                        <div className='form-group col-md-3'>
                            <div className='form-group' style={{ width: '100%' }}>
                                <label className='control-label' style={{ marginLeft: '-10px' }}>Giới tính: <span>{item.user.sex == 'male' ? 'Nam' : 'Nữ'}</span></label>

                            </div>
                        </div>
                        <div className='form-group col-md-6'>
                            <label className='control-label'>Số điện thoại: <span>{item.user.phoneNumber}</span></label>
                        </div>
                    </div>

                    <div className='form-group'>
                        <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú: <span>{item.user.regularResidence}</span></label>
                    </div>

                    <div className='form-group'>
                        <label className='control-label' htmlFor='residence'>Nơi cư trú: <span>{item.user.residence}</span></label>
                    </div>

                    <div className='row'>
                        <div className='form-group col-md-6'>
                            <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu): <span>{item.user.identityCard}</span></label>
                        </div>
                        <div className='form-group col-md-3' id='identityDateSection'>
                            <label className='control-label' htmlFor='identityDate'>Cấp ngày: <span>{T.dateToText(item.user.identityDate, 'dd/mm/yyyy')}</span></label>
                        </div>
                        <div className='form-group col-md-3'>
                            <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp: <span>{item.user.identityIssuedBy}</span></label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className='form-group col-md-5'>
                            <label className='control-label' htmlFor='licenseNumber'>Đã có giấy phép lái xe số: <span>{item.licenseNumber}</span></label>
                        </div>
                        <div className='form-group col-md-2' id='licenseClassSection'>
                            <label className='control-label' htmlFor='licenseClass'>Hạng: <span>{item.licenseClass}</span></label>
                        </div>
                        <div className='form-group col-md-7'>
                            <label className='control-label' htmlFor='licenseIssuedBy'>Do: <span>{item.licenseIssuedBy}</span> cấp.</label>
                        </div>
                    </div>
                    <div className='form-group'>
                        <label className='control-label' htmlFor='newLicenseClass'>Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng: <span>{item.newLicenseClass}</span></label>
                    </div>
                    <div className='form-group'>
                        <label className='control-label'>Các tài liệu khác có liên quan bao gồm: <span>{item.otherDocumentation}</span></label>
                    </div>
                </div>
            </div>
        ) : <p>Không có biểu mẫu mới!</p>;
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-id-card-o' /> Đơn đề nghị học chi tiết</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' />&nbsp;</Link>
                        / &nbsp; Biểu mẫu
                    </ul>
                </div>
                {table}
                <button type='button' className='btn btn-success btn-circle'
                    style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.accept}>
                    <i className='fa fa-check-square' />
                </button>
                <button type='button' className='btn btn-danger btn-circle' data-toggle="modal" data-target="#modal"
                    style={{ position: 'fixed', right: '60px', bottom: '10px' }}>
                    <i className='fa fa-ban' />
                </button>

                <div className="modal fade" id="modal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Lý do từ chối đơn đề nghị học, sát hạch</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <form>
                                <div className="modal-body mx-3">
                                    <div className="form-group">
                                        <Editor ref={this.viEditor} height='400px' placeholder='Nội dung' />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Đóng</button>
                                    <button type="button" className="btn btn-primary" id="submit-btn" onClick={this.save}>Gửi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

}
const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system });
const mapActionsToProps = { getForm, updateForm, updateProfile, sendEmailTuChoiDonDeNghiHoc };
export default connect(mapStateToProps, mapActionsToProps)(AdminDonDeNghiHocChiTiet,);
