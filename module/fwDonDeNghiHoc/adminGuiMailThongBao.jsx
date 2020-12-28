import React from 'react';
import { getSystemEmails, saveSystemEmails } from '../_init/reduxSystem.jsx';
import Editor from '../../view/component/CkEditor4.jsx';

class AdminGuiMailThongBao extends React.Component {
    constructor(props) {
        super(props);
        this.title = React.createRef();
        this.editor = React.createRef();
    }

    set(title, text, html) {
        this.title.current.value = title;
        this.editor.current.html(html);
    }

    get() {
        return {
            title: this.title.current.value,
            text: this.editor.current.text(),
            html: this.editor.current.html(),
        }
    }

    render() {
        const className = this.props.active ? 'tab-pane fade active show' : 'tab-pane fade';
        return (
            <div className={className} id={this.props.id}>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label className='control-label'>Subject</label>
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
}

export default class EmailPage extends React.Component {
    constructor(props) {
        super(props);
        this.emailAdminNotify = React.createRef();
    }

    componentDidMount() {
        T.ready(() => {
            getSystemEmails(data => {
                this.emailAdminNotify.current.set(data.emailAdminNotifyTitle, data.emailAdminNotifyText, data.emailAdminNotifyHtml);
            });
        });
    }

    save = () => {
        const emailType = $('ul.nav.nav-tabs li.nav-item a.nav-link.active').attr('href').substring(1);
        const email = this[emailType].current.get();
        saveEmailDonDeNghiHoc(emailType, email);
    }

    render() {
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-cog' /> Email</h1>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='tile'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#emailAdminNotify'>Thông báo từ chối</a>
                                </li>
                            </ul>
                            <div className='tab-content' style={{ marginTop: '12px' }}>
                                <AdminGuiMailThongBao ref={this.emailAdminNotify} id='emailAdminNotify' active={true}
                                    params='{name}, {reason}' />
                            </div>
                        </div>
                    </div>
                </div>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}