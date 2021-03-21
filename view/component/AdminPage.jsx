import React from 'react';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component { // type = number | link | image | checkbox | text
    render() {
        let { type = 'text', content = '', readOnly = false, style = {}, alt = '', display = true } = this.props;
        if (style == null) style = {};

        if (display != true) {
            return null;
        } else if (type == 'number') {
            return <td style={{ textAlign: 'right', ...style }}>{content}</td>
        } else if (type == 'link') {
            const url = this.props.url.trim();
            return url.startsWith('http://') || url.startsWith('https://') ?
                <td style={{ textAlign: 'left', ...style }}><a href={url} target='_blank'>{content}</a></td> :
                <td style={{ textAlign: 'left', ...style }}><Link to={url}>{content}</Link></td>
        } else if (type == 'image') {
            return <td style={{ textAlign: 'center', ...style }}><img src={content} alt={alt} style={{ height: '32px' }} /></td>;
        } else if (type == 'checkbox') {
            return (
                <td style={{ textAlign: 'center', ...style }} className='toggle'  >
                    <label>
                        <input type='checkbox' checked={content} onChange={() => readOnly || this.props.onChanged(content ? 0 : 1)} />
                        <span className='button-indecator' />
                    </label>
                </td>);
        } else if (type == 'text') {
            return <td style={{ textAlign: 'left', ...style }}>{content}</td>;
        } else {
            return <td style={{ ...style }}>{content}</td>;
        }
    }
}

export function renderTable({ style = {}, className = '', dataSource = null, loadingText = 'Đang tải...', emptyTable = 'Chưa có dữ liệu!', renderHead = () => null, renderRow = (item, index) => null }) {
    const list = dataSource && (dataSource.list || (dataSource.page ? dataSource.page.list : null));
    if (list == null) {
        return loadingText;
    } else if (list.length) {
        return (
            <table className={'table table-hover table-bordered ' + className} style={style}>
                <thead>{renderHead()}</thead>
                <tbody>{list.map(renderRow)}</tbody>
            </table>);
    } else {
        return emptyTable;
    }
};

// Form components ----------------------------------------------------------------------------------------------------
export class FormTabs extends React.Component {
    state = { tabIndex: 0 };

    componentDidMount() {
        $(document).ready(() => {
            let tabIndex = parseInt(T.cookie(this.props.id || 'tab'));
            if (isNaN(tabIndex) || tabIndex < 0 || tabIndex >= $(this.tabs).children().length) tabIndex = 0;
            this.setState({ tabIndex });
        });
    }

    onSelectTab = (e, tabIndex) => e.preventDefault() || this.setState({ tabIndex }) || T.cookie(this.props.id || 'tab', tabIndex);

    selectedTabIndex = () => this.state.tabIndex;

    render() {
        const { tabClassName = '', contentClassName = '', tabs = [] } = this.props,
            id = this.props.id || 'tab',
            tabLinks = [], tabPanes = [];
        tabs.forEach((item, index) => {
            const tabId = id + '_' + T.randomPassword(8),
                className = (index == this.state.tabIndex ? ' active show' : '');
            tabLinks.push(<li key={index} className={'nav-item' + className}><a className='nav-link' data-toggle='tab' href={'#' + tabId} onClick={e => this.onSelectTab(e, index)}>{item.title}</a></li>);
            tabPanes.push(<div key={index} className={'tab-pane fade' + className} id={tabId}>{item.component}</div>);
        });

        return <>
            <ul ref={e => this.tabs = e} className={'nav nav-tabs ' + tabClassName}>{tabLinks}</ul>
            <div className={'tab-content ' + contentClassName}>{tabPanes}</div>
        </>;
    }
}

export class FormCheckbox extends React.Component {
    state = { checked: false };

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

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.focus();

    render() {
        let { type = 'text', label = '', className = '', readOnly = false, onChange = null } = this.props;
        type = type.toLowerCase(); // type = text | email | password
        className = 'form-group' + (className ? ' ' + className : '');
        return (
            <div className={className}>
                <label onClick={e => this.input.focus()}>{label}</label>{readOnly && this.state.value ? <>: <b>{this.state.value}</b></> : ''}
                <input ref={e => this.input = e} type={type} className='form-control' style={{ display: readOnly ? 'none' : 'block' }} placeholder={label} value={this.state.value}
                    onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    };
}

export class FormRichTextBox extends React.Component {
    state = { value: '' };

    value = (text) => {
        if (text === '' || text) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.focus();

    render() {
        let { rows = 3, label = '', className = '', readOnly = false, onChange = null } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return readOnly ? (
            <div className={className}>
                <label>{label}</label>{this.state.value ? <br /> : ''}<b>{this.state.value}</b>
            </div>
        ) : (
            <div className={className}>
                <label onClick={e => this.input.focus()}>{label}</label>
                <textarea ref={e => this.input = e} className='form-control' placeholder={label} value={this.state.value} rows={rows}
                    onChange={e => this.setState({ value: e.target.value }) || onChange && onChange(e)} />
            </div>);
    };
}

export class FormEditor extends React.Component {
    state = { value: '' };

    html = (text) => {
        if (text === '' || text) {
            this.input.html(text);
            this.setState({ value: text });
        } else {
            return this.input.html();
        }
    }

    text = () => this.input.text();

    focus = () => this.input.focus();

    render() {
        let { height = '400px', label = '', className = '', readOnly = false, uploadUrl = '', smallText = '' } = this.props;
        className = 'form-group' + (className ? ' ' + className : '');
        return (
            <div className={className}>
                <label>{label}</label>{readOnly && this.state.value ? <br /> : ''}
                <p style={{ width: '100%', fontWeight: 'bold', display: readOnly ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: this.state.value }} />
                {!readOnly && smallText ? <small className='form-text text-muted'>{smallText}</small> : null}
                <div style={{ display: readOnly ? 'none' : 'block' }}>
                    <Editor ref={e => this.input = e} height={height} placeholder={label} uploadUrl={uploadUrl} />
                </div>
            </div>);
    };
}

// Page components ----------------------------------------------------------------------------------------------------
export class BackButton extends React.Component {
    render = () =>
        <Link to={this.props.to} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
            <i className='fa fa-lg fa-reply' />
        </Link>;
}

export class AdminModal extends React.Component {
    state = { display: '' };
    _data = {};

    onShown = (modalShown) => {
        $(this.modal).on('shown.bs.modal', () => modalShown());
    }

    show = (item) => {
        this.onShow && this.onShow(item);
        $(this.modal).modal('show');
    }

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal).modal('hide');
    }

    data = (key, value) => {
        if (value === '' || value) {
            this._data[key] = value;
        } else {
            return this._data[key];
        }
    }

    renderModal = ({ title, body, size }) => {
        const { readOnly } = this.props;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={e => this.modal = e}>
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
                            {/* {readOnly == null || readOnly == true ? null : */}
                                <button type='submit' className='btn btn-primary'>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button>
                                {/* } */}
                        </div>
                    </div>
                </form>
            </div>);
    }

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

    renderPage = ({ icon, title, breadcrumb, content, onCreate }) => {
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

    render() { return null; }
}