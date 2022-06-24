import React from 'react';
import { connect } from 'react-redux';
import { getSystemSettings,updateSystemSettings } from './redux';
import { AdminPage, FormTextBox, FormTabs, FormRichTextBox } from 'view/component/AdminPage';

const brandNameViettelKeys = ['brandName','usernameViettel','passwordViettel','totalSMSViettel'];
class SmsItem extends React.Component {
    set = ( content='') => {
        this.content.value(content);
    }

    get = () => ({
        content: this.content.value(),
    });

    render = () => (
        <>
        <div className='tile-body' id={this.props.id}>
            <small className='form-text text-muted'>Tham số: {this.props.params}</small>
            <FormRichTextBox ref={e => this.content = e} label='Nội dung' rows={10} readOnly={this.props.readOnly} />
        </div>

        <div className='tile-footer' style={{ textAlign: 'right' }}>
            <button className='btn btn-primary' type='button' onClick={this.props.save}>
                <i className='fa fa-fw fa-lg fa-save' /> Lưu
            </button>
        </div>
        </>
        );
}

class SettingsPage extends AdminPage {

    smsItems = [
        { title: 'Đăng ký tư vấn', id: 'smsCandidate', params: '{name}' },
        { title: 'Tạo người dùng mới', id: 'smsCreateMemberByAdmin', params: '{name}, {identityCard}, {password}' },
    ];

    componentDidMount() {
        T.ready('/user/sms-brandname',() => {
            const smsItemsKeys = this.smsItems.map(item=>item.id);
            this.props.getSystemSettings([...brandNameViettelKeys,...smsItemsKeys],data=>{
                console.log({data});
                brandNameViettelKeys.forEach(key=>{// settings viettel sms info
                    this[key] && this[key].value(data[key]||'');
                });

                smsItemsKeys.forEach(key=>{// settings content sms
                    this[key] && this[key].set(data[key]||'');
                });
            });

            // viết api lấy data từ setting.
            // this.smsCreateMemberByAdmin && this.smsCreateMemberByAdmin.set(data.smsCreateMemberByAdminTitle, data.smsCreateMemberByAdminText, data.smsCreateMemberByAdminHtml);
            // this.smsCandidate && this.smsCandidate.set(data.smsCandidateTitle, data.smsCandidateText, data.smsCandidateHtml);
        });
    }

    saveInfo = () => {
        this.props.updateSystemSettings({
            brandName: this.brandName.value(),
            usernameViettel: this.usernameViettel.value(),
            passwordViettel: this.passwordViettel.value(),
        });
    }

    saveSms = ()=>{
        const smsItemsKeys = this.smsItems.map(item=>item.id);
        const changes = {};
        smsItemsKeys.forEach(key=>{
            changes[key] = this[key] && this[key].get ? this[key].get().content:'';
        });
        this.props.updateSystemSettings(changes);
    }

    render() {
        const permission = this.getUserPermission('system', ['settings']);
        const readOnly = !permission.settings;
        console.log(this.props.system);
        const tabs = this.smsItems.map(item => ({
            title: item.title,
            component: <SmsItem ref={e => this[item.id] = e} id={item.id} params={item.params} readOnly={readOnly} save={this.saveSms} />
        }));
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Cấu hình sms',
            breadcrumb: ['Cấu hình sms'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>SMS VIETTEL</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.brandName = e} label='Tên thương hiệu' readOnly={readOnly} />
                                <FormTextBox ref={e => this.usernameViettel = e} label='Username' readOnly={readOnly} />
                                <FormTextBox ref={e => this.passwordViettel = e} label='Password' readOnly={readOnly} />
                                <FormTextBox ref={e => this.totalSMSViettel = e} label='Tổng tin nhắn' type='number' readOnly={true} />
                            </div>
                            {readOnly ? null :
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.saveInfo}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </div>}
                        </div>
                    </div>

                       <div className='col-md-6'>
                            <FormTabs ref={e => this.tabs = e} id='smsPageTab' contentClassName='tile' tabs={tabs} />
                        </div>
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getSystemSettings,updateSystemSettings };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);