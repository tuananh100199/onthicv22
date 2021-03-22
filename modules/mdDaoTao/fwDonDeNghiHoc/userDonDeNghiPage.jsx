import React from 'react';
import { connect } from 'react-redux';
import { getDonDeNghiHocByUser, userUpdateDonDeNghiHoc, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord, updateForm } from './redux';
import { updateProfile } from 'modules/_default/_init/reduxSystem';
import { getCourseTypeInPage } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import FileSaver from 'file-saver';
import ImageBox from 'view/component/ImageBox';
import { Select } from 'view/component/Input';

class UserDonDeNghiPage extends React.Component {
    state = {};
    sex = React.createRef();
    quocGia = React.createRef();
    newLicenseSelect = React.createRef();
    licenseSelect = React.createRef();
    constructor(props) {
        super(props);
        this.imageBox = React.createRef();
    }
    componentDidMount() {
        this.props.getCourseTypeInPage();
        T.ready('/user', () => {
            T.tooltip();
            $('#userBirthday').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
            $('#identityDate').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });
            $('#licenseDated').datepicker({ autoclose: true, format: 'dd/mm/yyyy' });

            if (this.props.system && this.props.system.user) {
                const image = this.props.system.user.image ? this.props.system.user.image : '/img/avatar.png';
                this.setState({ image });
                let { firstname, lastname, sex, birthday, phoneNumber, regularResidence, residence, identityCard, identityDate, identityIssuedBy } = this.props.system.user || { firstname: '', lastname: '', sex: '', birthday: '', phoneNumber: '', regularResidence: '', residence: '', identityCard: '', identityIssuedBy: '', image: '/img/avatar.png' };
                $('#userLastname').val(lastname);
                $('#userFirstname').val(firstname);
                $('#userBirthday').val(birthday ? T.dateToText(birthday, 'dd/mm/yyyy') : '');
                $('#phoneNumber').val(phoneNumber);
                $('#regularResidence').val(regularResidence);
                $('#residence').val(residence);
                $('#identityCard').val(identityCard);
                $('#identityDate').val(identityDate ? T.dateToText(identityDate, 'dd/mm/yyyy') : '');
                $('#identityIssuedBy').val(identityIssuedBy);
                this.imageBox.current.setData('profile', image ? image : '/img/avatar.png');
                // this.sex.current.setText(sex ? sex : 'Nam');
            }
            let url = window.location.pathname,
                params = T.routeMatcher('/user/bieu-mau/don-de-nghi-hoc/:id').parse(url);
            this.props.getDonDeNghiHocByUser(params.id, data => {
                if (data.error) {
                    this.props.history.push('/user');
                } else if (data.item) {
                    data.item.status == 'approved' ? $('#newLicenseClass').prop('disabled', true) : $('#newLicenseClass').prop('disabled', false)
                    const user = data.item.user;
                    $('#userBirthday').val(user.birthday ? T.dateToText(user.birthday, 'dd/mm/yyyy') : '');
                    $('#phoneNumber').val(user.phoneNumber);
                    $('#regularResidence').val(user.regularResidence);
                    $('#residence').val(user.residence);
                    $('#identityCard').val(user.identityCard);
                    $('#identityDate').val(user.identityDate ? T.dateToText(user.identityDate, 'dd/mm/yyyy') : '');
                    $('#identityIssuedBy').val(user.identityIssuedBy);
                    $('#licenseDated').val(data.item.user.licenseDated ? T.dateToText(data.item.licenseDated, 'dd/mm/yyyy') : '');
                    $('#issuedBy').val(data.item.issuedBy);
                    $('#licenseNumber').val(data.item.licenseNumber);
                    $('#otherDocumentation').val(data.item.otherDocumentation);
                    //$('#licenseClass').val(data.item.licenseClass);
                    $('#newLicenseClass').val(data.item.newLicenseClass);
                    $('#licenseIssuedBy').val(data.item.licenseIssuedBy);
                    this.setState(data);
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
        const
            // sex = this.sex.current.getSelectedItem().toLowerCase(),
            changesOfUser = {
                firstname: $('#userFirstname').val(),
                lastname: $('#userLastname').val(),
                birthday: $('#userBirthday').val() ? T.formatDate($('#userBirthday').val()) : null,
                residence: $('#residence').val(),
                phoneNumber: $('#phoneNumber').val(),
                regularResidence: $('#regularResidence').val(),

                //identity
                identityCard: $('#identityCard').val(),
                identityDate: $('#identityDate').val() ? T.formatDate($('#identityDate').val()) : null,
                identityIssuedBy: $('#identityIssuedBy').val(),
                nationality: $(this.quocGia.current).val()
            },
            changesOfForm = {
                //license
                licenseNumber: $('#licenseNumber').val(),
                licenseClass: this.licenseSelect.current.val(),
                newLicenseClass: this.newLicenseSelect.current.val(),
                licenseDated: $('#licenseDated').val() ? T.formatDate($('#licenseDated').val()) : null,
                licenseIssuedBy: $('#licenseIssuedBy').val(),
                integration: this.state.item.integration ? this.state.item.integration : false,
                otherDocumentation: $('#otherDocumentation').val(),
            };
        if (changesOfUser.birthday == null) {
            T.notify('Ngày sinh bị trống', 'danger');
            $('#userBirthday').focus();
            return;
        }
        if (changesOfUser.phoneNumber == '') {
            T.notify('Số điện thoại bị trống', 'danger');
            $('#phoneNumber').focus();
            return;
        }
        if (changesOfUser.regularResidence == '') {
            T.notify('Nơi đăng ký hộ khẩu thường trú bị trống', 'danger');
            $('#regularResidence').focus();
            return;
        }
        if (changesOfUser.residence == '') {
            T.notify('Nơi cư trú bị trống', 'danger');
            $('#residence').focus();
            return;
        }
        if (changesOfUser.identityCard == '') {
            T.notify('Số chứng minh nhân dân bị trống', 'danger');
            $('#identityCard').focus();
            return;
        }
        if (changesOfUser.identityDate == null) {
            T.notify('Ngày cấp chứng minh nhân dân bị trống', 'danger');
            $('#identityDate').focus();
            return;
        }
        if (changesOfUser.identityIssuedBy == '') {
            T.notify('Nơi cấp chứng minh nhân dân bị trống', 'danger');
            $('#identityIssuedBy').focus();
            return;
        }
        if (changesOfForm.newLicenseClass == '') {
            T.notify('Hạng giấy phép lái xe mới bị trống bị trống', 'danger');
            $('#newLicenseClass').focus();
            return;
        }
        if (changesOfForm.integration == undefined) {
            changesOfForm.integration = false;
        }
        if (changesOfForm.licenseNumber != '') {
            if (changesOfForm.licenseClass == '') {
                T.notify('Hạng bằng lái xe bị trống', 'danger');
                $('#licenseClass').focus();
                return;
            }
            if (changesOfForm.licenseIssuedBy == '') {
                T.notify('Nơi cấp giấy phép lái xe bị trống', 'danger');
                $('#licenseIssuedBy').focus();
                return;
            }
            if (changesOfForm.licenseDated == null) {
                T.notify('Ngày cấp giấy phép lái xe bị trống', 'danger');
                $('#licenseDated').focus();
                return;
            }
        }
        if (changesOfForm.licenseNumber == '') {
            changesOfForm.licenseClass = '';
            changesOfForm.licenseIssuedBy = '';
            changesOfForm.licenseDated = null;
        }


        this.props.userUpdateDonDeNghiHoc(this.props.donDeNghiHoc.item._id, changesOfForm, changesOfUser, (error) => {
            if (!error) {
                if (changesOfForm.licenseNumber == '') {
                    $('#licenseClass').val('');
                    $('#licenseIssuedBy').val('');
                    $('#licenseDated').val(null);
                }
                if (this.props.donDeNghiHoc.item.status == 'reject') {
                    this.props.updateForm(this.props.donDeNghiHoc.item._id, { status: 'waiting' }, () => {
                    });
                }
                T.notify('Cập nhật thông tin biểu mẫu thành công!', 'success');
            }
        });
    };

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
        const item_unfinish = this.state.item ? this.state.item : {
            integration: false,
        };
        const item = this.props.donDeNghiHoc && this.props.donDeNghiHoc.item ? this.props.donDeNghiHoc.item : { integration: false, };
        const user = this.props.system.user;
        const unfinish_content = (
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
                            <div className='form-group col-md-8'>
                                <label className='control-label pt-4' htmlFor='userLastname'>Họ và tên: &nbsp; <span>{this.props.system.user.lastname + ' ' + this.props.system.user.firstname}</span></label>
                                <label style={{ display: 'block' }} className='control-label pt-4' htmlFor='userEmail'>Email:&nbsp; <span>{this.props.system.user.email}</span></label>
                                <label className='control-label pt-4 col-6' >Giới tính :&nbsp; <span>{user.sex}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Hình đại diện</label>
                                < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6' id='birthdaySection'>
                                <label className='control-label' htmlFor='userBirthday'>Ngày sinh <span style={{ color: 'red' }}>*</span></label>
                                <input className='form-control col-md-6' type='text' placeholder='Ngày sinh' id='userBirthday' autoComplete='off' data-date-container='#birthdaySection' />
                            </div>
                            <div className='form-group col-md-4'>
                                <label className='control-label'>Số điện thoại <span style={{ color: 'red' }}>*</span></label>
                                <input className='form-control' type='text' placeholder='Số điện thoại' id='phoneNumber' />
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='regularResidence'>Nơi đăng ký hộ khẩu thường trú <span style={{ color: 'red' }}>*</span></label>
                            <textarea className='form-control' id='regularResidence' placeholder='Nơi đăng ký hộ khẩu thường trú' rows='3' />
                        </div>

                        <div className='form-group'>
                            <label className='control-label' htmlFor='residence'>Nơi cư trú <span style={{ color: 'red' }}>*</span></label>
                            <textarea className='form-control' id='residence' placeholder='Nơi cư trú' rows='3' />
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu) <span style={{ color: 'red' }}>*</span></label>
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
                                <label className='control-label' htmlFor='licenseNumber'>Đã có giấy phép lái xe số </label>
                                <input className='form-control' type='text' id='licenseNumber'
                                    placeholder='Số giấy phép lái xe' />
                            </div>
                            <div className='form-group col-md-2' id='licenseClassSection'>
                                <label className='control-label' htmlFor='newLicenseClass'>Hạng </label>
                                <Select ref={this.licenseSelect} displayLabel={false} adapter={
                                    {
                                        ajax: true,
                                        url: '',
                                        data: {},
                                        processResults: () => ({
                                            results: this.props.courseType.page.list.map((item, index) => ({ id: item.title, text: item.title }))
                                        })
                                    }
                                } label='Hạng' />
                            </div>
                            <div className='form-group col-md-5'>
                                <label className='control-label' htmlFor='licenseIssuedBy'>Nơi Cấp  </label>
                                <input className='form-control' type='text' placeholder='Nơi cấp GPLX' id='licenseIssuedBy' />
                            </div>
                            <div className='form-group col-md-2'>
                                <label className='control-label' htmlFor='licenseDated'>Cấp ngày  </label>
                                <input className='form-control' type='text' placeholder='Ngày cấp GPLX' id='licenseDated' />
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='control-label' htmlFor='newLicenseClass'>Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng <span style={{ color: 'red' }}>*</span> </label>
                            <Select ref={this.newLicenseSelect} displayLabel={false} adapter={
                                {
                                    ajax: true,
                                    url: '',
                                    data: {},
                                    processResults: () => ({
                                        results: this.props.courseType.page.list.map((item, index) => ({ id: item.title, text: item.title }))
                                    })
                                }
                            } label='Hạng' />
                        </div>
                        <div className='form-group' style={{ display: 'inline-flex' }}>
                            <label className='control-label'> Đăng ký tích hợp giấy phép lái xe&nbsp; </label>
                            <div className='toggle'>
                                <label>
                                    <input type='checkbox' checked={item_unfinish.integration} onChange={this.changeActive} />
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
                    style={{ position: 'fixed', right: '75px', bottom: '10px' }} onClick={this.exportDonDeNghiHoc}>
                    <i className='fa fa-file-word-o'></i>
                </button>
                <button type='button' className='btn btn-info btn-circle' data-toggle='tooltip' title='Xuất biên nhận học viên'
                    style={{ position: 'fixed', right: '130px', bottom: '10px' }} onClick={this.exportBienNhan}>
                    <i className='fa fa-file-text-o'></i>
                </button>
                <button type='button' className='btn btn-secondary btn-circle' data-toggle='tooltip' title='Xuất bản cam kết'
                    style={{ position: 'fixed', right: '185px', bottom: '10px' }} onClick={this.exportBanCamKet}>
                    <i className='fa fa-file-text-o'></i>
                </button>
            </main>
        );
        const finish_content = (
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
                            <div className='form-group col-md-8'>
                                <label className='control-label pt-4' htmlFor='userLastname'>Họ và tên: &nbsp; <span>{this.props.system.user.lastname + ' ' + this.props.system.user.firstname}</span></label>
                                <label style={{ display: 'block' }} className='control-label pt-4' htmlFor='userEmail'>Email:&nbsp; <span>{this.props.system.user.email}</span></label>
                                <label className='control-label pt-4 col-6' >Giới tính :&nbsp; <span>{user.sex}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Hình đại diện</label>
                                < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='ProfileImage' userData='profile' image={this.state.image} />
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-3' id='birthdaySection'>
                                <label className='control-label' htmlFor='userBirthday'>Ngày sinh: &nbsp;<span>{user.birthday ? T.dateToText(user.birthday, 'dd/mm/yyyy') : ''}</span></label>
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
                                <label className='control-label' htmlFor='identityCard'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu): &nbsp;<span>{user.identityCard}</span></label>
                            </div>
                            <div className='form-group col-md-3' id='identityDateSection'>
                                <label className='control-label' htmlFor='identityDate'>Cấp ngày : &nbsp;<span>{user.identityDate ? T.dateToText(user.identityDate, 'dd/mm/yyyy') : ''}</span></label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label' htmlFor='identityIssuedBy'>Nơi cấp: &nbsp;<span>{user.identityIssuedBy}</span></label>
                            </div>
                        </div>
                        <div className='row'>
                            <div className='form-group col-md-4'>
                                <label className='control-label' htmlFor='licenseNumber'>Đã có giấy phép lái xe số: &nbsp;<span>{item.licenseNumber}</span></label>
                            </div>
                            <div className='form-group col-md-2' id='licenseClassSection'>
                                <label className='control-label' htmlFor='licenseClass'>Hạng: &nbsp;<span>{item.licenseClass}</span> </label>
                            </div>
                            <div className='form-group col-md-5'>
                                <label className='control-label' htmlFor='licenseIssuedBy'>Nơi Cấp: &nbsp;<span>{item.licenseIssuedBy}</span> </label>
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label' htmlFor='licenseDated'>Cấp ngày : &nbsp;<span>{item.licenseDated ? T.dateToText(item.licenseDated, 'dd/mm/yyyy') : ''}</span></label>
                            </div>
                        </div>
                        <div className='form-group'>
                            <label className='control-label' htmlFor='newLicenseClass'>Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng: &nbsp;<span>{item.newLicenseClass}</span> </label>
                        </div>
                        <div className='form-group'>
                            <label className='control-label'> Đăng ký tích hợp giấy phép lái xe: &nbsp;<span>{item.integration ? 'Có' : 'Không'}</span></label>
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>Các tài liệu khác có liên quan bao gồm: &nbsp;<span>{item.otherDocumentation}</span> </label>
                        </div>
                    </div>
                </div>
                <Link to='/user' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-success btn-circle' data-toggle='tooltip' title='Xuất đơn đề nghị học'
                    style={{ position: 'fixed', right: '75px', bottom: '10px' }} onClick={this.exportDonDeNghiHoc}>
                    <i className='fa fa-file-word-o'></i>
                </button>
                <button type='button' className='btn btn-info btn-circle' data-toggle='tooltip' title='Xuất biên nhận học viên'
                    style={{ position: 'fixed', right: '130px', bottom: '10px' }} onClick={this.exportBienNhan}>
                    <i className='fa fa-file-text-o'></i>
                </button>
                <button type='button' className='btn btn-secondary btn-circle' data-toggle='tooltip' title='Xuất bản cam kết'
                    style={{ position: 'fixed', right: '185px', bottom: '10px' }} onClick={this.exportBanCamKet}>
                    <i className='fa fa-file-text-o'></i>
                </button>
            </main>
        );
        return item.status == 'finish' ? finish_content : unfinish_content;
    }
}

const mapStateToProps = state => ({ system: state.system, donDeNghiHoc: state.donDeNghiHoc, courseType: state.courseType });
const mapActionsToProps = { getDonDeNghiHocByUser, userUpdateDonDeNghiHoc, updateProfile, exportDonDeNghiHocToWord, exportBienNhanLanDauToWord, exportBanCamKetToWord, updateForm, getCourseTypeInPage };
export default connect(mapStateToProps, mapActionsToProps)(UserDonDeNghiPage,);
