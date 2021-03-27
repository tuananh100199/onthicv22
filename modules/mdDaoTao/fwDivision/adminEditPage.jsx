import React from 'react';
import { connect } from 'react-redux';
import { getDivisionItem, updateDivision } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox } from 'view/component/AdminPage';

class DivisionEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/division', () => {
            const route = T.routeMatcher('/user/division/:_id'), params = route.parse(window.location.pathname);
            this.props.getDivisionItem(params._id, data => {
                if (data.item) {
                    this.setState(data.item);
                    let { _id, title, address, mobile, phoneNumber, email, isOutside, image, mapURL, shortDescription, detailDescription } = data.item;
                    this.itemTitle.value(title);
                    this.itemAddress.value(address);
                    this.itemEmail.value(email);
                    this.itemPhoneNumber.value(phoneNumber);
                    this.itemMobile.value(mobile);
                    this.itemMapUrl.value(mapURL);
                    this.itemShortDescription.value(shortDescription);

                    this.itemEditor.html(detailDescription);
                    this.itemIsOutside.value(isOutside);
                    this.itemImage.setData('division:' + (_id || 'new'), image ? image : '/img/avatar.png');

                    this.itemTitle.focus();
                } else {
                    this.props.history.push('/user/division');
                }
            });
        });
    }

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            address: this.itemAddress.value(),
            phoneNumber: this.itemPhoneNumber.value(),
            mobile: this.itemMobile.value(),
            email: this.itemEmail.value(),
            mapURL: this.itemMapUrl.value(),
            isOutside: this.itemIsOutside.value() ? 1 : 0,
            shortDescription: this.itemShortDescription.value().trim(),
            detailDescription: this.itemEditor.html(),
        };
        if (!changes.title) {
            T.notify('Tên cơ sở bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (!changes.phoneNumber) {
            T.notify('Số điện thoại bị trống!', 'danger');
            this.itemPhoneNumber.focus();
        } else if (!changes.email) {
            T.notify('Email bị trống!', 'danger');
            this.itemEmail.focus();
        } else if (!T.validateEmail(changes.email)) {
            T.notify('Email không hợp lệ!', 'danger');
            this.itemEmail.focus();
        } else if (!changes.mobile) {
            T.notify('Di động bị trống!', 'danger');
            this.itemMobile.focus();
        } else if (!changes.mapURL) {
            T.notify('Đường dẫn Google Map bị trống!', 'danger');
            this.itemMapUrl.focus();
        } else if (!changes.address) {
            T.notify('Địa chỉ bị trống!', 'danger');
            this.itemAddress.focus();
        } else {
            this.props.updateDivision(this.state._id, changes, () => T.notify('Cập nhật cơ sở thành công!', 'success'))
        }
    }

    render() {
        const permission = this.getUserPermission('division');
        return this.renderPage({
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo: ' + this.state.title,
            breadcrumb: [<Link to='/user/division'>Cơ sở đào tạo</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <FormCheckbox style={{ position: 'absolute', right: '24px', top: '24px' }} ref={e => this.itemIsOutside = e} label='Cơ sở ngoài' />
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <FormImageBox ref={e => this.itemImage = e} className='col-md-3 order-md-12' label='Hình đại diện' uploadType='DivisionImage' image={this.state.image} readOnly={!permission.write} />
                        <div className='col-md-9 order-md-1'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tên cơ sở' readOnly={!permission.write} value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
                            <FormRichTextBox ref={e => this.itemAddress = e} label='Địa chỉ' readOnly={!permission.write} rows='2' />
                        </div>
                        <div className='col-md-12 order-sm-12'>
                            <div className='row'>
                                <FormTextBox className='col-md-4' ref={e => this.itemEmail = e} label='Email' readOnly={!permission.write} type='email' />
                                <FormTextBox className='col-md-4' ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={!permission.write} />
                                <FormTextBox className='col-md-4' ref={e => this.itemMobile = e} label='Di động' readOnly={!permission.write} />
                            </div>
                            <FormTextBox ref={e => this.itemMapUrl = e} label='Đường dẫn Google Map' readOnly={!permission.write} />
                        </div>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Mô tả</h3>
                    <div className='tile-body'>
                        <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={!permission.write} />
                        <FormEditor ref={e => this.itemEditor = e} height='400px' label='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={!permission.write} />
                    </div>
                </div>
            </>,
            backRoute: '/user/division',
            onSave: permission.write ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division });
const mapActionsToProps = { updateDivision, getDivisionItem };
export default connect(mapStateToProps, mapActionsToProps)(DivisionEditPage);
