import React from 'react';
import { connect } from 'react-redux';
import T from '../../view/js/common.js'
import { getDonDeNghiHocByUser, userUpdateDonDeNghiHoc, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord } from './redux.jsx';
import { updateProfile } from '../_init/reduxSystem.jsx'
import { Link } from 'react-router-dom';
import Dropdown from '../../view/component/Dropdown.jsx';
import FileSaver from 'file-saver';
import ImageBox from '../../view/component/ImageBox.jsx';
const countryList = require('country-list');

class UserDonDeNghiDaHoanThanhPage extends React.Component {
    state = {};
    sex = React.createRef();
    quocGia = React.createRef();
    constructor(props) {
        super(props);
        this.imageBox = React.createRef();
    }
    componentDidMount() {
        T.ready('/user', () => {
            T.tooltip();

            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png';
                this.setState({ image });
            }
            let url = window.location.pathname,
                params = T.routeMatcher('/user/bieu-mau/don-de-nghi-hoc/finished/:id').parse(url);
            console.log(params.id)
            this.props.getDonDeNghiHocByUser(params.id, data => {
                if (data.error) {
                    this.props.history.push('/user');
                } else if (data.item) {

                    $('#licenseDated').val(data.item.licenseDated ? T.dateToText(data.item.licenseDated, 'dd/mm/yyyy') : '');
                    $('#issuedBy').val(data.item.issuedBy);
                    $('#licenseNumber').val(data.item.licenseNumber);
                    $('#otherDocumentation').val(data.item.otherDocumentation);
                    $('#licenseClass').val(data.item.licenseClass);
                    $('#newLicenseClass').val(data.item.newLicenseClass);
                    $('#licenseIssuedBy').val(data.item.licenseIssuedBy);
                    this.setState(data);
                } else {
                    this.props.history.push('/user');
                }
            });

        });
    }

    exportDonDeNghiHoc = () => {
        this.props.exportDonDeNghiHocToWord(this.state.item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Đơn Đề Nghị Học.docx');
        });
    };
    exportBienNhan = () => {
        this.props.exportBienNhanLanDauToWord(this.state.item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Biên Nhận Hồ Sơ Học Viên Lần Đầu.docx');
        });
    };
    exportBanCamKet = () => {
        this.props.exportBanCamKetToWord(this.state.item._id, (data) => {
            FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Bản Cam Kết.docx');
        });
    };
    render() {
        const item_integration = this.state.item ? this.state.item : {
            integration: false,
        };
        const item = this.props.donDeNghiHoc && this.props.donDeNghiHoc.item ? this.props.donDeNghiHoc.item : {};
        const user = this.props.system.user;
        console.log(item)
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-id-card-o' /> Đơn đề nghị học, sát hạch để cấp giấy phép lái xe</h1>
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
                                <label className='control-label' htmlFor='userLastname'>Họ và tên lót: &nbsp; <span>{user.lastname}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='userFirstname'>Tên: &nbsp; <span>{user.firstname}</span></label>
                            </div>
                            {/* <div className='form-group col-md-3'>
                                <label className='control-label'>Quốc tịch <span style={{ color: 'red' }}>*</span></label>
                                <select className='form-control select2-input' ref={this.quocGia} />
                            </div> */}
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Hình đại diện</label>
                                < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='userEmail'>Email:&nbsp; <span>{user.email}</span></label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-3' id='birthdaySection'>
                                <label className='control-label' htmlFor='userBirthday'>Ngày sinh: &nbsp;<span>{user.birthday ? T.dateToText(user.birthday, 'dd/mm/yyyy') : ''}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <div className='form-group' style={{ width: '100%' }}>
                                    <label className='control-label' style={{ marginLeft: '-10px' }}>Giới tính: &nbsp;<span>{user.sex == 'male' ? 'Nam' : 'Nữ'}</span></label>
                                </div>
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Số điện thoại: &nbsp;<span>{user.phoneNumber}</span></label>
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú: &nbsp;<span>{user.regularResidence}</span></label>
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='residence'>Nơi cư trú: &nbsp;<span>{user.residence}</span></label>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu): &nbsp;<span>{user.identityDate ? T.dateToText(user.identityDate, 'dd/mm/yyyy') : ''}</span></label>
                                <input className='form-control' type='text' id='identityCard'
                                    placeholder='Nhập số CMND' />
                            </div>
                            <div className='form-group col-md-3' id='identityDateSection'>
                                <label className='control-label' htmlFor='identityDate'>Cấp ngày <span style={{ color: 'red' }}>*</span></label>
                                <input className='form-control' type='text' placeholder='Ngày cấp CMND' id='identityDate' data-date-container='#identityDateSection' />
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp <span style={{ color: 'red' }}>*</span></label>
                                <input className='form-control' type='text' placeholder='Nơi cấp CMND' id='identityIssuedBy' />
                            </div>
                        </div>
                        <div className='row'>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='licenseNumber'>Đã có giấy phép lái xe số <span style={{ color: 'red' }}>*</span></label>
                                <input className='form-control' type='text' id='licenseNumber'
                                    placeholder='Số giấy phép lái xe' />
                            </div>
                            <div className='form-group col-md-2' id='licenseClassSection'>
                                <label className='control-label' htmlFor='licenseClass'>Hạng <span style={{ color: 'red' }}>*</span> </label>
                                <select className="form-control select2-input" placeholder='Hạng GPLX' id='licenseClass' data-date-container='#identityDateSection'>
                                    <option value="B1">B1</option>
                                    <option value="B2">B2</option>
                                    <option value="C">C</option>
                                </select>
                            </div>
                            <div className='form-group col-md-5'>
                                <label className='control-label' htmlFor='licenseIssuedBy'>Nơi Cấp <span style={{ color: 'red' }}>*</span> </label>
                                <input className='form-control' type='text' placeholder='Nơi cấp GPLX' id='licenseIssuedBy' />
                            </div>
                            <div className='form-group col-md-2'>
                                <label className='control-label' htmlFor='licenseDated'>Cấp ngày <span style={{ color: 'red' }}>*</span> </label>
                                <input className='form-control' type='text' placeholder='Ngày cấp GPLX' id='licenseDated' />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='control-label' htmlFor='newLicenseClass'>Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng <span style={{ color: 'red' }}>*</span> </label>
                            <select className="form-control select2-input" placeholder='Hạng GPLX' id='newLicenseClass' data-date-container='#identityDateSection'>
                                <option value="B1">B1</option>
                                <option value="B2">B2</option>
                                <option value="C">C</option>
                            </select>
                        </div>
                        <div className='form-group' style={{ display: 'inline-flex' }}>
                            <label className='control-label'> Đăng ký tích hợp giấy phép lái xe&nbsp; </label>
                            <div className='toggle'>
                                <label>
                                    <input type='checkbox' />
                                    <span className='button-indecator' />
                                </label>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>Các tài liệu khác có liên quan bao gồm:</label>
                            <textarea className='form-control' id='otherDocumentation' placeholder='Tài liệu liên quan bao gồm' rows='3' />
                        </div>
                    </div>
                </div>
                <Link to='/user' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' title='Lưu'
                    style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
                <button type='button' className='btn btn-success btn-circle' data-toggle='tooltip' title='Xuất đơn đề nghị học'
                    style={{ position: 'fixed', right: '65px', bottom: '10px' }} onClick={this.exportDonDeNghiHoc}>
                    <i className="fa fa-file-word-o"></i>
                </button>
                <button type='button' className='btn btn-info btn-circle' data-toggle='tooltip' title='Xuất biên nhận học viên'
                    style={{ position: 'fixed', right: '120px', bottom: '10px' }} onClick={this.exportBienNhan}>
                    <i className="fa fa-file-text-o"></i>
                </button>
                <button type='button' className='btn btn-secondary btn-circle' data-toggle='tooltip' title='Xuất bản cam kết'
                    style={{ position: 'fixed', right: '175px', bottom: '10px' }} onClick={this.exportBanCamKet}>
                    <i className="fa fa-file-text-o"></i>
                </button>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, donDeNghiHoc: state.donDeNghiHoc });
const mapActionsToProps = { getDonDeNghiHocByUser, userUpdateDonDeNghiHoc, updateProfile, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord };
export default connect(mapStateToProps, mapActionsToProps)(UserDonDeNghiDaHoanThanhPage,);
