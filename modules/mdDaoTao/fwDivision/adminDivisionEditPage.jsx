import React from 'react';
import { connect } from 'react-redux';
import { getDivisionItem, updateDivision } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox } from 'view/component/AdminPage';
import ImageBox from 'view/component/ImageBox';

class DivisionEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready('/user/division', () => {
            const route = T.routeMatcher('/user/division/edit/:_id'), params = route.parse(window.location.pathname);
            this.props.getDivisionItem(params._id, data => {
                if (data.item) {
                    // this.setState(data.item);
                    // let { _id, title, address, mobile, phoneNumber, email, isOutside, image, mapURL, shortDescription, detailDescription } = data.item;
                    // data.itemTitle.value(title);
                    // this.itemAddress.value(address);
                    // this.itemEmail.value(email);
                    // this.itemPhoneNumber.value(phoneNumber);
                    // this.itemMobile.value(mobile);
                    // this.itemMapUrl.value(mapURL);
                    // this.itemShortDescription.value(shortDescription);

                    // this.itemEditor.value(detailDescription);
                    // this.itemIsOutside.value(isOutside);
                    const item = data.item;
                    this.setState(item);
                    // delete item._id;
                    // // delete item.image;
                    // delete item.__v;
                    // const capitalize = (s) => s[0].toUpperCase() + s.slice(1);
                    Object.keys(item).forEach(i => {
                        const formItemRef = this[`item${i[0].toUpperCase() + i.slice(1)}`];
                        // console.log(i)
                        // console.log(i in ["__v", "_id"]) (i !== "__v" && i !== "_id") 
                        // !["__v", "_id"].includes(i) && (i === 'image' ? this.itemImage.setData('division:' + (_id || 'new'), (image || '/img/avatar.png')) : this[`item${i[0].toUpperCase() + i.slice(1)}`].value(item[i]))
                        // if (i === 'image') this.itemImage.setData('division:' + (_id || 'new'), (image || '/img/avatar.png'))
                        // else this[`item${i[0].toUpperCase() + i.slice(1)}`].value(item[i])
                        formItemRef && (i === 'image' ? this.itemImage.setData('division:' + (this.state._id || 'new'), (this.state.image || '/img/avatar.png')) : formItemRef.value(item[i]))

                        // (i === 'image' && this.itemImage.setData('division:' + (_id || 'new'), (image || '/img/avatar.png'))) ||
                        //     this[`item${i[0].toUpperCase() + i.slice(1)}`].value(item[i]);
                    })
                    // this.itemImage.setData('division:' + (_id || 'new'), image ? image : '/img/avatar.png');
                    // this.itemImage.setData('division:' + (_id || 'new'), (image || '/img/avatar.png'));

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
            detailDescription: this.itemEditor.value(),
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
        } else if (!T.validateMobile(changes.mobile)) {
            T.notify('Di động không hợp lệ!!', 'danger');
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
        const permission = this.getUserPermission('division'),
            readOnly = !permission.write;
        const renderData = {
            icon: 'fa fa-university',
            title: 'Cơ sở đào tạo: ' + this.state.title,
            breadcrumb: [<Link to='/user/division'>Cơ sở đào tạo</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <FormCheckbox style={{ position: 'absolute', right: '24px', top: '24px' }} ref={e => this.itemIsOutside = e} label='Cơ sở ngoài' />
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <div className='col-md-3 order-md-12 form-group'>
                            <label>Hình đại diện</label>
                            <ImageBox ref={e => this.itemImage = e} postUrl='/user/upload' uploadType='DivisionImage' readOnly={readOnly} />
                        </div>
                        <div className='col-md-9 order-md-1'>
                            <FormTextBox ref={e => this.itemTitle = e} label='Tên cơ sở' readOnly={readOnly} value={this.state.title} onChange={e => this.setState({ title: e.target.value })} />
                            <FormRichTextBox ref={e => this.itemAddress = e} label='Địa chỉ' readOnly={readOnly} rows='2' />
                        </div>
                        <div className='col-md-12 order-sm-12'>
                            <div className='row'>
                                <FormTextBox className='col-md-4' ref={e => this.itemEmail = e} label='Email' readOnly={readOnly} type='email' />
                                <FormTextBox className='col-md-4' ref={e => this.itemPhoneNumber = e} label='Số điện thoại' readOnly={readOnly} />
                                <FormTextBox className='col-md-4' ref={e => this.itemMobile = e} label='Di động' readOnly={readOnly} />
                            </div>
                            <FormTextBox ref={e => this.itemMapURL = e} label='Đường dẫn Google Map' readOnly={readOnly} />
                        </div>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Mô tả</h3>
                    <div className='tile-body'>
                        <FormRichTextBox ref={e => this.itemShortDescription = e} label='Mô tả ngắn gọn' readOnly={readOnly} />
                        <FormEditor ref={e => this.itemDetailDescription = e} height='400px' label='Mô tả chi tiết' uploadUrl='/user/upload?category=division' readOnly={readOnly} />
                    </div>
                </div>

                <Link to='/user/division' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {permission.write ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                        <i className='fa fa-lg fa-save' />
                    </button> : null}
            </>,
        };
        return this.renderListPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, division: state.division });
const mapActionsToProps = { updateDivision, getDivisionItem };
export default connect(mapStateToProps, mapActionsToProps)(DivisionEditPage);
