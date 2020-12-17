import React from 'react';
import { connect } from 'react-redux';
import { getForm, updateForm } from './redux.jsx';
import { updateProfile } from '../_init/reduxSystem.jsx'
import { Link } from 'react-router-dom';
import Dropdown from '../../view/component/Dropdown.jsx';
const countryList = require('country-list');

class AdminDonDeNghiHocChiTiet extends React.Component {
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

    render() {
        const item = this.props.donDeNghiHoc && this.props.donDeNghiHoc.item ?
            this.props.donDeNghiHoc.item : { item: 0 };
        console.log(this.props)
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-id-card-o' /> Đơn đề nghị học chi tiết</h1>
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
                                <label className='control-label' htmlFor='username'>Họ và tên: <span>{item._id}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Quốc tịch: </label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-3' id='donDeNghiSection'>
                                <label className='control-label' htmlFor='userBirthday'>Ngày sinh</label>
                                <input className='form-control' type='text' placeholder='Ngày sinh' id='userBirthday' autoComplete='off' data-date-container='#donDeNghiSection' />
                            </div>
                            <div className='form-group col-md-3'>
                                <div className='form-group' style={{ width: '100%' }}>
                                    <label className='control-label' style={{ marginLeft: '-10px' }}>Giới tính: </label>
                                    <Dropdown ref={this.sex} text='' items={T.sexes} />
                                </div>
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Số điện thoại</label>
                                <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber' />
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú:</label>
                            <textarea className='form-control' id='regularResidence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='3' />
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='residence'>Nơi cư trú</label>
                            <textarea className='form-control' id='residence' placeholder='Nơi cư trú' rows='3' />
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu)</label>
                                <input className='form-control' type='text' id='identityCard'
                                    placeholder='Nhập số CMND' />
                            </div>
                            <div className='form-group col-md-3' id='identityDateSection'>
                                <label className='control-label' htmlFor='identityDate'>Cấp ngày</label>
                                <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection' />
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp</label>
                                <input className='form-control' type='text' placeholder='Nơi cấp CMND' id='identityIssuedBy' />
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
                                <label className='control-label' htmlFor='licenseIssuedBy'>Do: <span>{item.licenseIssuedBy}</span></label>
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
                <button type='button' className='btn btn-primary btn-circle'
                    style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }

}
const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system });
const mapActionsToProps = { getForm, updateForm, updateProfile };
export default connect(mapStateToProps, mapActionsToProps)(AdminDonDeNghiHocChiTiet,);
