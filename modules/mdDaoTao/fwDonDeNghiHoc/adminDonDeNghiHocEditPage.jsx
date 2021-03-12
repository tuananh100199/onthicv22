import React from 'react';
import { connect } from 'react-redux';
import { getForm, updateForm, denyApplicationForm } from './redux';
import { updateProfile } from 'modules/_default/_init/reduxSystem';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import countryList from 'country-list';
import Tooltip from 'rc-tooltip';

class DenyModal extends React.Component {
    modal = React.createRef();
    editor = React.createRef();

    show = () => {
        $(this.modal.current).modal('show')
    }

    save = () => {
        $('#submit-btn').attr('disabled', true);
        if (!this.editor.current.html()) {
            T.notify('Nội dung từ chối bị trống', 'danger');
        } else {
            this.props.denyApplicationForm(this.props.item._id, this.editor.current.html(), (data) => {
                if (!data.error) {
                    T.notify('Từ chối duyệt hồ sơ thành công!', 'success');
                }
                $('#submit-btn').removeAttr('disabled');
                $(this.modal.current).modal('hide');
            })
        }
    }

    render() {
        return (
            <div ref={this.modal} className='modal' tabIndex='-1' role='dialog'>
                <div className='modal-dialog modal-lg'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Lý do từ chối đơn đề nghị học, sát hạch</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group'>
                                <label>Nội dung từ chối</label>
                                <Editor ref={this.editor} height='400px' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' id='submit-btn' onClick={this.save}>Gửi</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class AdminDonDeNghiHocEditPage extends React.Component {
    denyModal = React.createRef();

    componentDidMount() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/don-de-nghi-hoc/edit/:_id').parse(url);
        T.ready('/user/don-de-nghi-hoc')
        this.props.getForm(params._id);
    }

    accept = (user) => {
        T.confirm('Duyệt đơn đề nghị học', `Bạn có chắc muốn chấp nhận đơn đề nghị học - sát hạch từ ${user.lastname} ${user.firstname}?`, 'info', isConfirm => {
            isConfirm && this.props.updateForm(this.props.donDeNghiHoc.item._id, { status: 'approved' }, () => {
                T.alert('Đơn đề nghị học đã được duyệt!', 'success', false, 1000);
            });
        })
    }

    render() {
        const item = this.props.donDeNghiHoc && this.props.donDeNghiHoc.item ? this.props.donDeNghiHoc.item : { user: { nationality: '' } };
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-id-card-o' /> Đơn đề nghị học - sát hạch: {item.user.lastname} {item.user.firstname}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' />&nbsp;</Link>
                        / &nbsp; Biểu mẫu
                    </ul>
                </div>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Họ và tên: &nbsp;</label>
                                <label>{item.user.lastname + ' ' + item.user.firstname}</label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Giới tính: &nbsp;</label>
                                <label>{item.user.sex}</label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Quốc tịch: &nbsp;</label>
                                <label>{countryList.getName(item.user.nationality || '')}</label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Ngày sinh: &nbsp;</label>
                                <label>{T.dateToText(item.user.birthday, 'dd/mm/yyyy')}</label>
                            </div>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Số điện thoại: &nbsp;</label>
                                <label>{item.user.phoneNumber}</label>
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label'>Nơi đăng ký hộ khẩu thường trú: &nbsp;</label>
                            <label>{item.user.regularResidence}</label>
                        </div>

                        <div className='form-group'>
                            <label className='control-label'>Nơi cư trú: &nbsp;</label>
                            <label>{item.user.residence}</label>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Số CMND hoặc thẻ CCCD (hoặc hộ chiếu): &nbsp;</label>
                                <label>{item.user.identityCard}</label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Cấp ngày: &nbsp;</label>
                                <label>{T.dateToText(item.user.identityDate, 'dd/mm/yyyy')}</label>
                            </div>
                            <div className='form-group col-md-3'>
                                <label className='control-label'>Nơi cấp: &nbsp;</label>
                                <label>{item.user.identityIssuedBy}</label>
                            </div>
                        </div>

                        <div className='row'>
                            <div className='form-group col-md-6'>
                                <label className='control-label'>Đã có giấy phép lái xe số: &nbsp;</label>
                                <label>{item.licenseNumber}</label>
                            </div>
                            <div className='form-group col-md-2'>
                                <label className='control-label'>Hạng: &nbsp;</label>
                                <label>{item.licenseClass}</label>
                            </div>
                            <div className='form-group col-md-4'>
                                <label className='control-label'>Cấp bởi: &nbsp;</label>
                                <label>{item.licenseIssuedBy}</label>
                            </div>
                        </div>

                        <div className='form-group'>
                            <label className='control-label'>Đề nghị cho tôi được học, dự sát hạch để cấp giấy phép lái xe hạng: &nbsp;</label>
                            <label>{item.newLicenseClass}</label>
                        </div>
                        <div className='form-group'>
                            <label className='control-label'>Các tài liệu khác có liên quan bao gồm: &nbsp;</label><br />
                            <label className='pl-2'>{item.otherDocumentation}</label>
                        </div>
                    </div>
                </div>

                <Link className='btn btn-secondary btn-circle' to='/user/don-de-nghi-hoc/list' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {item.status == 'waiting' ?
                    <div>
                        <Tooltip placement='bottom' overlay='Từ chối đơn'>
                            <button type='button' className='btn btn-danger btn-circle' onClick={e => { e.preventDefault(); this.denyModal.current.show() }}
                                style={{ position: 'fixed', right: '70px', bottom: '10px' }}>
                                <i className='fa fa-user-times' />
                            </button>
                        </Tooltip>

                        <Tooltip placement='bottom' overlay='Chấp nhận đơn'>
                            <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '15px', bottom: '10px' }} onClick={() => this.accept(item.user)}>
                                <i className='fa fa-user-plus' />
                            </button>
                        </Tooltip>
                    </div>
                    : <p></p>
                }
                <DenyModal ref={this.denyModal} item={item} denyApplicationForm={this.props.denyApplicationForm} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ donDeNghiHoc: state.donDeNghiHoc, system: state.system });
const mapActionsToProps = { getForm, updateForm, updateProfile, denyApplicationForm };
export default connect(mapStateToProps, mapActionsToProps)(AdminDonDeNghiHocEditPage);
