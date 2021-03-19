import React from 'react';
import { getSystemEmails, saveSystemEmails } from '../_init/reduxSystem';
import Editor from 'view/component/CkEditor4';

class EmailItem extends React.Component {
    title = React.createRef();
    editor = React.createRef();

    set = (title, text, html) => {
        this.title.current.value = title;
        this.editor.current.html(html);
    }

    get = () => {
        return {
            title: this.title.current.value,
            text: this.editor.current.text(),
            html: this.editor.current.html(),
        }
    }

    render = () => (
        <div className={this.props.active ? 'tab-pane fade active show' : 'tab-pane fade'} id={this.props.id}>
            <div className='tile-body'>
                <div className='form-group'>
                    <label className='control-label'>Chủ đề</label>
                    <input className='form-control' type='text' defaultValue='' ref={this.title} placeholder='Subject' />
                </div>
                <div className='form-group'>
                    <label className='control-label'>HTML</label>
                    <small className='form-text text-muted'>Parameters: {this.props.params}</small>
                    <Editor ref={this.editor} placeholder='Content' height={600} />
                </div>
            </div>
        </div>
    );
}

export default class EmailPage extends React.Component {
    constructor(props) {
        super(props);
        this.emailRegisterMember = React.createRef();
        this.emailCreateMemberByAdmin = React.createRef();
        this.emailNewPassword = React.createRef();
        this.emailForgotPassword = React.createRef();
        this.emailContact = React.createRef();
        this.emailTuChoiDonDeNghiHoc = React.createRef();
        this.emailDangKyTuVan = React.createRef();
    }

    componentDidMount() {
        T.ready(() => {
            getSystemEmails(data => {
                this.emailRegisterMember.current.set(data.emailRegisterMemberTitle, data.emailRegisterMemberText, data.emailRegisterMemberHtml);
                this.emailCreateMemberByAdmin.current.set(data.emailCreateMemberByAdminTitle, data.emailCreateMemberByAdminText, data.emailCreateMemberByAdminHtml);
                this.emailNewPassword.current.set(data.emailNewPasswordTitle, data.emailNewPasswordText, data.emailNewPasswordHtml);
                this.emailForgotPassword.current.set(data.emailForgotPasswordTitle, data.emailForgotPasswordText, data.emailForgotPasswordHtml);
                this.emailContact.current.set(data.emailContactTitle, data.emailContactText, data.emailContactHtml);
                this.emailTuChoiDonDeNghiHoc.current.set(data.emailTuChoiDonDeNghiHocTitle, data.emailTuChoiDonDeNghiHocText, data.emailTuChoiDonDeNghiHocHtml);
                this.emailDangKyTuVan.current.set(data.emailDangKyTuVanTitle, data.emailDangKyTuVanText, data.emailDangKyTuVanHtml);
            });
        });
    }

    save = () => {
        const emailType = $('ul.nav.nav-tabs li.nav-item a.nav-link.active').attr('href').substring(1);
        const email = this[emailType].current.get();
        saveSystemEmails(emailType, email);
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-envelope-o' /> Email</h1>
                </div>

                <ul className='nav nav-tabs'>
                    <li className='nav-item'>
                        <a className='nav-link active show' data-toggle='tab' href='#emailRegisterMember'>Người dùng mới</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailCreateMemberByAdmin'>Tạo người dùng mới</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailNewPassword'>Mật khẩu mới</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailForgotPassword'>Quên mật khẩu</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailContact'>Liên hệ</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailTuChoiDonDeNghiHoc'>Từ chối đơn đề nghị học</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailContact'>Đăng ký tư vấn</a>
                    </li>
                    <li className='nav-item'>
                        <a className='nav-link' data-toggle='tab' href='#emailTuChoiDonDeNghiHoc'>Phản hồi đăng ký tư vấn</a>
                    </li>
                </ul>

                <div className='tile tab-content'>
                    <EmailItem ref={this.emailRegisterMember} id='emailRegisterMember' active={true}
                        params='{name}, {url}' />
                    <EmailItem ref={this.emailCreateMemberByAdmin} id='emailCreateMemberByAdmin'
                        params='{name}, {email}, {password}, {url}' />
                    <EmailItem ref={this.emailNewPassword} id='emailNewPassword'
                        params='{name}, {email}, {password}' />
                    <EmailItem ref={this.emailForgotPassword} id='emailForgotPassword'
                        params='{name}, {email}, {url}' />
                    <EmailItem ref={this.emailContact} id='emailContact'
                        params='{name}, {subject}, {message}' />
                    <EmailItem ref={this.emailTuChoiDonDeNghiHoc} id='emailTuChoiDonDeNghiHoc'
                        params='{name}, {subject}, {message}' />
                    <EmailItem ref={this.emailDangKyTuVan} id='emailDangKyTuVan'
                        params='{name}' />
                </div>

                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}