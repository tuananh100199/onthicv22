import React from 'react';
import { connect } from 'react-redux';
import { getAddressItem, updateAddress } from './redux.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';
import { Link } from 'react-router-dom';

class AddressEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {} };
        this.imageBox = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/settings', () => {
            const route = T.routeMatcher('/user/address/edit/:addressId'), params = route.parse(window.location.pathname);
            this.props.getAddressItem(params.addressId, data => {
                if (data.item) {
                    this.setState({ item: data.item });
                    let { _id, title, address, mobile, phoneNumber, email, image, mapURL } = data.item;
                    $('#title').val(title).focus();
                    $('#address').val(address);
                    $('#phoneNumber').val(phoneNumber);
                    $('#mobile').val(mobile);
                    $('#email').val(email);
                    $('#mapURL').val(mapURL);
                    this.imageBox.current.setData('address:' + (_id || 'new'), image ? image : '/img/avatar.png');
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }
    save = () => {
        const changes = {
            title: $('#title').val(),
            address: $('#address').val(),
            phoneNumber: $('#phoneNumber').val(),
            mobile: $('#mobile').val(),
            email: $('#email').val(),
            mapURL: $('#mapURL').val()
        };
        if (!changes.title) {
            T.notify('Tên địa chỉ bị trống!', 'danger');
            $('#title').focus();
        } else if (!changes.phoneNumber) {
            T.notify('Số điện thoại bị trống!', 'danger');
            $('#phoneNumber').focus();
        } else if (!changes.email) {
            T.notify('Email bị trống!', 'danger');
            $('#email').focus();
        } else if (!T.validateEmail(changes.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            $('#email').focus();
        } else if (!changes.mobile) {
            T.notify('Di động bị trống!', 'danger');
            $('#mobile').focus();
        } else if (!changes.mapURL) {
            T.notify('Đường dẫn Google Map bị trống!', 'danger');
            $('#mapURL').focus();
        } else if (!changes.address) {
            T.notify('Địa chỉ bị trống!', 'danger');
            $('#address').focus();
        } else {
            this.props.updateAddress(this.state.item._id, changes, () => T.notify('Cập nhật địa chỉ thành công!', 'success'))
        }
    }

    render() {
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Địa chỉ: Chỉnh sửa</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Địa chỉ</h3>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='title'>Tên địa chỉ</label>
                                        <input type='text' className='form-control' id='title' placeholder='Tên địa chỉ' />
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='phoneNumber'>Số điện thoại</label>
                                        <input type='text' className='form-control' id='phoneNumber' placeholder='Số điện thoại' />
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='email'>Email</label>
                                        <input className='form-control' type='email' placeholder='Email' id='email' />
                                    </div>
                                    <div className='form-group col-md-6'>
                                        <label className='control-label' htmlFor='mobile'>Di động</label>
                                        <input className='form-control' type='text' placeholder='Di động' id='mobile' />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-md-12'>
                                        <label className='control-label' htmlFor='mapURL'>Đường dẫn Google Map</label>
                                        <input className='form-control' type='text' placeholder='Đường dẫn Google Map' id='mapURL' />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className='form-group'>
                                            <label className='control-label' htmlFor='address'>Địa chỉ</label>
                                            <textarea className='form-control' id='address' placeholder='Địa chỉ' rows='5' />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className='form-group'>
                                            <label className='control-label'>Hình đại diện</label>
                                            < ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='AddressImage' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                                <i className='fa fa-lg fa-reply' />
                            </Link>
                            <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                                <i className='fa fa-lg fa-save' />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
}
const mapStateToProps = state => ({ system: state.system, address: state.address });
const mapActionsToProps = { updateAddress, getAddressItem };
export default connect(mapStateToProps, mapActionsToProps)(AddressEditPage);
