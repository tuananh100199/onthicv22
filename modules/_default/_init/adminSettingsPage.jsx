import React from 'react';
import { connect } from 'react-redux';
import { saveSystemState } from './redux';
import QRCode from 'react-qr-code';
import { AdminPage, FormTextBox, FormImageBox, FormSelect } from 'view/component/AdminPage';

class SettingsPage extends AdminPage {
    state = {
        banks: [],
        money: '000',
    };

    componentDidMount() {
        T.ready(() => {
            this.getBanks();
            let { address, email, mobile, fax, facebook, youtube, twitter, instagram, logo, footer, contact, subscribe, smsAPIToken, moneyLine, moneyStr, contentLine, contentStr, banks} = this.props.system ?
                this.props.system : { address: '', email: '', mobile: '', fax: '', facebook: '', youtube: '', twitter: '', instagram: '', logo: '/img/logo.jpg', footer: '/img/footer.jpg', contact: '/img/contact.jpg', subscribe: '/img/subscribe.jpg', smsAPIToken:'' };
            console.log(banks, typeof banks,'banssssk mout');
            this.systemAddress.value(address);
            this.systemEmail.value(email);
            this.systemMobile.value(mobile);
            this.systemFax.value(fax);
            this.systemFacebook.value(facebook);
            this.systemYoutube.value(youtube);
            this.systemTwitter.value(twitter);
            this.systemInstagram.value(instagram);
            this.systemMoneyStartStr.value(moneyLine || 2);
            this.systemMoneyEndStr.value(moneyStr || '(+)/:money/VND');
            this.systemContentStartStr.value(contentLine || 3);
            this.systemContentEndStr.value(contentStr|| 'N/dung:/:content/');
            // this.systemBank.value('OCB');
            this.systemLogo.setData('logo', logo);
            this.systemContact.setData('contact', contact);
            this.systemSubscribe.setData('subscribe', subscribe);
            this.setState({ logo, footer, contact, subscribe, smsAPIToken, bankSystems: JSON.parse(banks) });
        });
    }

    getBanks = () => {
        fetch('https://api.vietqr.io/v1/banks').then(
        (response) => response.json().then(
          (jsonData) => {
               console.log(jsonData);
               this.setState({banks: jsonData.data && jsonData.data.map(({code,name})=>({id:code,text:code+' - '+name}))}, ()=>{
               console.log(this.state.bankSystems, typeof this.state.bankSystems,'bank');
               this.systemBank.value(this.state.bankSystems || []);
                // this.systemBank.value(['OCB']);
               });
          }
      )
    );}

    saveCommonInfo = () => {
        this.props.saveSystemState({
            address: this.systemAddress.value(),
            email: this.systemEmail.value(),
            mobile: this.systemMobile.value(),
            fax: this.systemFax.value(),
            facebook: this.systemFacebook.value(),
            youtube: this.systemYoutube.value(),
            twitter: this.systemTwitter.value(),
            instagram: this.systemInstagram.value(),
        });
    }

    saveSMS = () => {
        this.props.saveSystemState({
            banks: this.systemBank.value().length == 0 ? 'empty' : this.systemBank.value(),
            // banks: JSON.stringify(this.systemBank.value()),
            moneyLine: this.systemMoneyStartStr.value(),
            moneyStr: this.systemMoneyEndStr.value(),
            contentLine: this.systemContentStartStr.value(),
            contentStr: this.systemContentEndStr.value() //== '' ? '\n' : this.systemContentEndStr.value(),
        });
    }

    changePassword = () => {
        const emailPassword1 = this.emailPassword1.value(),
            emailPassword2 = this.emailPassword2.value();
        if (emailPassword1 == '') {
            T.notify('Mật khẩu mới của email hiện tại bị trống!', 'danger');
            this.emailPassword1.focus();
        } else if (emailPassword2 == '') {
            T.notify('Nhập lại mật khẩu mới!', 'danger');
            this.emailPassword2.focus();
        } else if (emailPassword1 != emailPassword2) {
            T.notify('Mật khẩu mới không giống nhau!', 'danger');
            this.emailPassword1.focus();
        } else {
            this.props.saveSystemState({ emailPassword: emailPassword1 });
            this.emailPassword1.value('');
            this.emailPassword2.value('');
        }
    }

    render() {
        const permission = this.getUserPermission('system', ['settings']);
        const readOnly = !permission.settings;
        return this.renderPage({
            icon: 'fa fa-cog',
            title: 'Cài đặt hệ thống',
            breadcrumb: ['Thông tin hệ thống'],
            content: <>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.systemAddress = e} label='Địa chỉ' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemEmail = e} label='Email' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemMobile = e} label='Số điện thoại' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemFax = e} label='Fax' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemFacebook = e} label='Facebook' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemYoutube = e} label='You tube' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemTwitter = e} label='Twitter' readOnly={readOnly} />
                                <FormTextBox ref={e => this.systemInstagram = e} label='Instagram' readOnly={readOnly} />
                            </div>
                            {readOnly ? null :
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.saveCommonInfo}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </div>}
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>SMS</h3>
                            <div className='tile-body'>
                            <p>API Token QR Code</p>
                            {this.state.smsAPIToken ? <QRCode value={this.state.smsAPIToken} size={200}/>: null}
                            <p style={{ fontWeight:'bold', marginTop: 10 }} >CKT: Chuỗi ký tự; GD: Giao dịch</p>
                            <FormSelect ref={e => this.systemBank = e} label='Ngân hàng' data={this.state.banks} multiple={true} readOnly={readOnly} onChange={
                                ({id})=>console.log(id,'đjdj')
                            }/>
                            <FormTextBox ref={e => this.systemMoneyStartStr = e} label='Dòng biến động số dư' readOnly={readOnly} />
                            <FormTextBox ref={e => this.systemMoneyEndStr = e} label='Chuỗi phần biến động số dư' readOnly={readOnly} />
                            <FormTextBox ref={e => this.moneyStringEx = e} label='Chuỗi phần biến động số dư ví dụ' readOnly={readOnly} />
                                                               
                            <button className='btn btn-primary' type='button' onClick={()=>{

                                this.setState({money:'123'});
                                }}>
                                        Tính
                                    </button>
                            &nbsp; &nbsp; Số tiền (money) = 20000
                            {/* <span style={{ fontWeight:'bold'}}>{this.state.money}</span>  */}
                            <FormTextBox ref={e => this.systemContentStartStr = e} label='Dòng nội dung GD' readOnly={readOnly} />
                            <FormTextBox ref={e => this.systemContentEndStr = e} label='CKT phần nội dung GD' readOnly={readOnly} />
                            {/* smallText='Nếu kí tự kết thúc là xuống dòng thì để trống' */}
                            CKT nội dung GD ví dụ: <span style={{ fontWeight:'bold'}}>N/dung: 123456789 B1</span>                      
                            </div>
                            {readOnly ? null :
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.saveSMS}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </div>}
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thay đổi mật khẩu</h3>
                            <div className='tile-body'>
                                <FormTextBox ref={e => this.emailPassword1 = e} label='Mật khẩu mới' type='password' readOnly={readOnly} />
                                <FormTextBox ref={e => this.emailPassword2 = e} label='Nhập lại mật khẩu mới' type='password' readOnly={readOnly} />
                            </div>
                            {readOnly ? null :
                                <div className='tile-footer' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-primary' type='button' onClick={this.changePassword}>
                                        <i className='fa fa-fw fa-lg fa-check-circle' />Thay đổi mật khẩu
                                    </button>
                                </div>}
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Hình ảnh</h3>
                            <div className='tile-body'>
                                <FormImageBox ref={e => this.systemLogo = e} label='Logo công ty' uploadType='SettingImage' image={this.state.logo} readOnly={readOnly} />
                                <FormImageBox ref={e => this.systemContact = e} label='Hình nền phần liên hệ' uploadType='SettingImage' image={this.state.contact} readOnly={readOnly} />
                                <FormImageBox ref={e => this.systemSubscribe = e} label='Hình nền phần đăng ký nhận tin' uploadType='SettingImage' image={this.state.subscribe} readOnly={readOnly} />
                            </div>
                        </div>
                    </div>
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { saveSystemState };
export default connect(mapStateToProps, mapActionsToProps)(SettingsPage);