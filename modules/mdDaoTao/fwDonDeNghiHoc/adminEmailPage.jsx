import React from 'react';
import { getApplicationFormEmail, saveApplicationFormEmail } from './redux';
import Editor from 'view/component/CkEditor4';
import { Link } from 'react-router-dom';

class EmailItem extends React.Component {
    set(title, text, html) {
        this.title.value = title;
        this.editor.html(html);
    }

    get() {
        return {
            title: this.title.value,
            text: this.editor.text(),
            html: this.editor.html(),
        }
    }

    render() {
        const className = this.props.active ? 'tab-pane fade active show' : 'tab-pane fade';
        return (
            <div className={className} id={this.props.id}>
                <div className='tile-body'>
                    <div className='form-group'>
                        <label className='control-label'>Subject</label>
                        <input className='form-control' type='text' defaultValue='' ref={e => this.title = e} placeholder='Subject' />
                    </div>
                    <div className='form-group'>
                        <label className='control-label'>HTML</label>
                        <small className='form-text text-muted'>Parameters: {this.props.params}</small>
                        <Editor ref={e => this.editor = e} placeholder='Content' height={600} />
                    </div>
                </div>
            </div>
        );
    }
}

export default class AdminEmailPage extends React.Component {
    rejectDonDeNghiHoc = React.createRef();

    componentDidMount() {
        T.ready('/user/don-de-nghi-hoc', () => {
            getApplicationFormEmail(data => {
                this.rejectDonDeNghiHoc.current.set(data.rejectDonDeNghiHocTitle, data.rejectDonDeNghiHocText, data.rejectDonDeNghiHocHtml);
            });
        });
    }

    save = () => {
        const emailType = $('ul.nav.nav-tabs li.nav-item a.nav-link.active').attr('href').substring(1);
        const email = this[emailType].current.get();
        saveApplicationFormEmail(emailType, email);
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
                                    <a className='nav-link active show' data-toggle='tab' href='#rejectDonDeNghiHoc'>Từ chối duyệt đơn</a>
                                </li>
                            </ul>
                            <div className='tab-content' style={{ marginTop: '12px' }}>
                                <EmailItem ref={this.rejectDonDeNghiHoc} id='rejectDonDeNghiHoc' active={true} params='{name}, {reason}' />
                            </div>
                        </div>
                    </div>
                </div>
                <Link className='btn btn-secondary btn-circle' to='/user/don-de-nghi-hoc' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                    <i className='fa fa-lg fa-save' />
                </button>
            </main>
        );
    }
}