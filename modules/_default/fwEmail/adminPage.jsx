import React from 'react';
import { connect } from 'react-redux';
import { getSystemEmails, saveSystemEmails } from '../_init/redux';
import { AdminPage, FormTabs, FormTextBox, FormEditor } from 'view/component/AdminPage';

class EmailItem extends React.Component {
    set = (title, text, html) => {
        this.title.value(title);
        this.editor.html(html);
    }

    get = () => ({
        title: this.title.value(),
        text: this.editor.text(),
        html: this.editor.html(),
    });

    render = () => (
        <div className='tile-body' id={this.props.id}>
            <FormTextBox ref={e => this.title = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormEditor ref={e => this.editor = e} height='600px' label='Nội dung' smallText={'Parameters: ' + this.props.params} readOnly={this.props.readOnly} />
        </div>);
}

class EmailPage extends AdminPage {
    emailItems = [
        { title: 'Người dùng mới', id: 'emailRegisterMember', params: '{name}, {url}' },
        { title: 'Tạo người dùng mới', id: 'emailCreateMemberByAdmin', params: '{name}, {identityCard}, {email}, {password}, {url}' },
        { title: 'Mật khẩu mới', id: 'emailNewPassword', params: '{name}, {email}, {password}' },
        { title: 'Quên mật khẩu', id: 'emailForgotPassword', params: '{name}, {email}, {url}' },
        { title: 'Liên hệ', id: 'emailContact', params: '{name}, {subject}, {message}' },
        { title: 'Từ chối đơn đề nghị học', id: 'emailTuChoiDonDeNghiHoc', params: '{name}, {subject}, {message}' },
        { title: 'Đăng ký tư vấn', id: 'emailDangKyTuVan', params: '{name}' },
    ];

    componentDidMount() {
        T.ready(() => getSystemEmails(data => {
            this.emailRegisterMember.set(data.emailRegisterMemberTitle, data.emailRegisterMemberText, data.emailRegisterMemberHtml);
            this.emailCreateMemberByAdmin.set(data.emailCreateMemberByAdminTitle, data.emailCreateMemberByAdminText, data.emailCreateMemberByAdminHtml);
            this.emailNewPassword.set(data.emailNewPasswordTitle, data.emailNewPasswordText, data.emailNewPasswordHtml);
            this.emailForgotPassword.set(data.emailForgotPasswordTitle, data.emailForgotPasswordText, data.emailForgotPasswordHtml);
            this.emailContact.set(data.emailContactTitle, data.emailContactText, data.emailContactHtml);
            this.emailTuChoiDonDeNghiHoc.set(data.emailTuChoiDonDeNghiHocTitle, data.emailTuChoiDonDeNghiHocText, data.emailTuChoiDonDeNghiHocHtml);
            this.emailDangKyTuVan.set(data.emailDangKyTuVanTitle, data.emailDangKyTuVanText, data.emailDangKyTuVanHtml);
        }));
    }

    save = () => {
        const index = this.tabs.selectedTabIndex();
        if (0 <= index && index < this.emailItems.length) {
            const emailType = this.emailItems[index].id,
                email = this[emailType].get();
            saveSystemEmails(emailType, email);
        }
    }

    render() {
        const permission = this.getUserPermission('system', ['email']);
        const tabs = this.emailItems.map(item => ({
            title: item.title,
            component: <EmailItem ref={e => this[item.id] = e} id={item.id} params={item.params} readOnly={!permission.email} />
        }));

        return this.renderPage({
            icon: 'fa fa-envelope-o',
            title: 'Email',
            breadcrumb: ['Email'],
            content: <FormTabs ref={e => this.tabs = e} id='emailPageTab' contentClassName='tile' tabs={tabs} />,
            onSave: permission.email ? this.save : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(EmailPage);