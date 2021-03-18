import React from 'react';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

export class FormCheckbox extends React.Component {
    state = { checked: false };
    box = React.createRef();

    value = (checked) => {
        if (checked != null) {
            this.setState({ checked });
        } else {
            return this.state.checked;
        }
    }

    onCheck = () => this.props.readOnly || this.setState({ checked: !this.state.checked });

    render() {
        let { className, label, style } = this.props;
        if (style == null) style = {};
        return (
            <div className={className} style={{ ...style, display: 'inline-flex' }}>
                <label style={{ cursor: 'pointer' }} onClick={this.onCheck}>{label}:&nbsp;</label>
                <div className='toggle'>
                    <label style={{ marginBottom: 0 }}>
                        <input type='checkbox' checked={this.state.checked} onChange={this.onCheck} /><span className='button-indecator' />
                    </label>
                </div>
            </div>);
    }
}

export class FormTextBox extends React.Component {
    state = { value: '' };
    input = React.createRef();

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.current.focus();

    render() {
        let { type = 'text', label = '', className = '', readOnly = false, onChange = null } = this.props;
        type = type.toLowerCase(); // type = text | email | password
        className = 'form-group' + (className ? ' ' + className : '');
        return readOnly ? (
            <div className={className}>
                <label>{label}</label>{this.state.value ? ': ' : ''}<b>{this.state.value}</b>
            </div>
        ) : (
            <div className={className}>
                <label onClick={e => this.input.current.focus()}>{label}</label>
                <input ref={this.input} type={type} className='form-control' placeholder={label} value={this.state.value}
                    onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    };
}

export class FormRichTextBox extends React.Component {
    state = { value: '' };
    input = React.createRef();

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.current.focus();

    render() {
        let { rows = 3, label = '', className = '', readOnly = false, onChange = null } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return readOnly ? (
            <div className={className}>
                <label>{label}</label>{this.state.value ? <br /> : ''}<b>{this.state.value}</b>
            </div>
        ) : (
            <div className={className}>
                <label onClick={e => this.input.current.focus()}>{label}</label>
                <textarea ref={this.input} className='form-control' placeholder={label} value={this.state.value} rows={rows}
                    onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    };
}

export class FormEditor extends React.Component {
    state = { value: '' };
    input = React.createRef();

    value = (text) => {
        if (text === '' || text) {
            this.input.current.html(text);
            this.setState({ value: text });
        } else {
            return this.props.readOnly ? this.state.value : this.input.current ? this.input.current.html() : '';
        }
    }

    focus = () => this.input.current.focus();

    render() {
        let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '' } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return readOnly ? (
            <div className={className}>
                <label>{label}</label>{this.state.value ? <br /> : ''}
                <p style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
            </div>
        ) : (
            <div className={className}>
                <label>{label}</label>
                <Editor ref={this.input} height={height} placeholder={label} uploadUrl={uploadUrl} />
            </div>);
    };
}

export class AdminModal extends React.Component {
    state = { display: '' };
    modal = React.createRef();
    _data = {};

    onShown = (modalShown) => {
        $(this.modal.current).on('shown.bs.modal', () => modalShown());
    }

    show = (item) => {
        this.onShow && this.onShow(item);
        // this.setState({ display: 'show123' });
        $(this.modal.current).modal('show');
    }

    hide = () => {
        this.onHide && this.onHide();
        // this.setState({ display: '' });
        $(this.modal.current).modal('hide');
    }

    data = (key, value) => {
        if (value === '' || value) {
            this._data[key] = value;
        } else {
            return this._data[key];
        }
    }

    renderModal = ({ title, body, size }) => {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className={'modal-dialog' + (size == 'large' ? ' modal-lg' : '')} role='document' onSubmit={e => { e.preventDefault() || this.onSubmit && this.onSubmit(e) }}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{title}</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>{body}</div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>
                                <i className='fa fa-fw fa-lg fa-times' />Đóng
                        </button>
                            {this.props.permissionWrite == null || this.props.permissionWrite == true ?
                                <button type='submit' className='btn btn-primary'>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button> : null}
                        </div>
                    </div>
                </form>
            </div>
        )
    };

    render = () => null;
}

export class AdminPage extends React.Component {
    componentWillUnmount() {
        T.onSearch = null;
    }

    getUserPermission = (prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {},
            currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    }

    renderListPage = ({ icon, title, breadcrumb, content, onCreate }) => {
        if (breadcrumb == null) breadcrumb = [];
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className={icon} /> {title}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        {breadcrumb.map((item, index) => <span key={index}>&nbsp;/&nbsp;{item}</span>)}
                    </ul>
                </div>
                {content}
                {onCreate ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={onCreate}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </main>);
    }

    render() {
        return null;
    }
}