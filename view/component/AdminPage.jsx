import React from 'react';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import FileBox from 'view/component/FileBox';
import Editor from 'view/component/CkEditor4';

// Table components ---------------------------------------------------------------------------------------------------
export class TableCell extends React.Component { // type = number | date | link | image | checkbox | buttons | text (default)
    render() {
        let { type = 'text', content = '', permission = {}, className = '', style = {}, alt = '', display = true } = this.props;
        if (style == null) style = {};

        if (display != true) {
            return null;
        } else if (type == 'number') {
            return <td className={className} style={{ textAlign: 'right', ...style }}>{content ? T.numberDisplay(content) : content}</td>
        } else if (type == 'date') {
            return <td className={className} style={{ ...style }}>{new Date(content).getText()}</td>
        } else if (type == 'link') {
            let url = this.props.url ? this.props.url.trim() : '',
                onClick = this.props.onClick;
            if (onClick) {
                return <td className={className} style={{ ...style }}><a href='#' onClick={onClick}>{content}</a></td>;
            } else {
                return url.startsWith('http://') || url.startsWith('https://') ?
                    <td className={className} style={{ textAlign: 'left', ...style }}><a href={url} target='_blank'>{content}</a></td> :
                    <td className={className} style={{ textAlign: 'left', ...style }}><Link to={url}>{content}</Link></td>
            }
        } else if (type == 'image') {
            return content ?
                <td style={{ textAlign: 'center', ...style }} className={className}><img src={content} alt={alt} style={{ height: '32px' }} /></td> :
                <td style={{ textAlign: 'center', ...style }} className={className}>{alt}</td>;
        } else if (type == 'checkbox') {
            return (
                <td style={{ textAlign: 'center', ...style }} className={'toggle ' + className}>
                    <label>
                        <input type='checkbox' checked={content} onChange={() => permission.write && this.props.onChanged(content ? 0 : 1)} />
                        <span className='button-indecator' />
                    </label>
                </td>);
        } else if (type == 'buttons') {
            const { onSwap, onEdit, onDelete, children } = this.props;
            return (
                <td className={className} style={{ ...style }}>
                    <div className='btn-group'>
                        {children}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => onSwap(e, content, true)}><i className='fa fa-lg fa-arrow-up' /></a> : null}
                        {permission.write && onSwap ?
                            <a className='btn btn-warning' href='#' onClick={e => onSwap(e, content, false)}><i className='fa fa-lg fa-arrow-down' /></a> : null}
                        {onEdit && typeof onEdit == 'function' ?
                            <a className='btn btn-primary' href='#' onClick={e => onEdit(e, content)}><i className='fa fa-lg fa-edit' /></a> : null}
                        {onEdit && typeof onEdit == 'string' ?
                            <Link to={onEdit} className='btn btn-primary'><i className='fa fa-lg fa-edit' /></Link> : null}
                        {permission.delete && onDelete ?
                            <a className='btn btn-danger' href='#' onClick={e => onDelete(e, content)}><i className='fa fa-lg fa-trash' /></a> : null}
                    </div>
                </td>);
        } else {
            return <td className={className} style={{ ...style }}>{content}</td>;
        }
    }
}

export function renderTable({ style = {}, className = '', getDataSource = () => null, loadingText = 'Đang tải...', emptyTable = 'Chưa có dữ liệu!', renderHead = () => null, renderRow = (item, index) => null }) {
    const list = getDataSource();
    if (list == null) {
        return (
            <div className='overlay' style={{ minHeight: '120px' }}>
                <div className='m-loader mr-4'>
                    <svg className='m-circular' viewBox='25 25 50 50'>
                        <circle className='path' cx='50' cy='50' r='20' fill='none' strokeWidth='4' strokeMiterlimit='10' />
                    </svg>
                </div>
                <h3 className='l-text'>{loadingText}</h3>
            </div>);
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

    value = function (text) {
        if (arguments.length) {
            this.setState({ value: text });
        } else {
            return this.state.value;
        }
    }

    focus = () => this.input.focus();

    render() {
        let { type = 'text', smallText = '', label = '', className = '', readOnly = false, onChange = null } = this.props;
        type = type.toLowerCase(); // type = text | number | email | password | phone
        const properties = {
            type,
            className: 'form-control',
            placeholder: label,
            value: this.state.value,
            onChange: e => this.setState({ value: e.target.value }) || onChange && onChange(e),
        };
        if (type == 'password') properties.autoComplete = 'new-password';
        if (type == 'phone') properties.onKeyPress = e => ((!/[0-9]/.test(e.key)) && e.preventDefault());
        return (
            <div className={'form-group ' + (className || '')}>
                <label onClick={e => this.input.focus()}>{label}</label>{readOnly && this.state.value ? <>: <b>{type == 'phone' ? T.mobileDisplay(this.state.value) : T.numberDisplay(this.state.value)}</b></> : ''}
                <input ref={e => this.input = e} style={{ display: readOnly ? 'none' : 'block' }}{...properties} />
                {smallText ? <small>{smallText}</small> : null}
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
        const { style = {}, rows = 3, label = '', className = '', readOnly = false, onChange = null } = this.props;
        return (
            <div className={'form-group ' + (className ? className : '')} style={style}>
                <label onClick={e => this.input.focus()}>{label}</label>{readOnly && this.state.value ? <><br /><b>{this.state.value}</b></> : ''}
                <textarea ref={e => this.input = e} className='form-control' style={{ display: readOnly ? 'none' : 'block' }} placeholder={label} value={this.state.value} rows={rows}
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

export class FormSelect extends React.Component {
    state = { valueText: '' };
    componentDidMount() {
        $(this.input).select2();
        $(this.input).on('select2:select', e => this.props.onChange && this.props.onChange(e.params.data));
    }

    focus = () => $(this.input).select2('open');

    value = function (value) {
        const dropdownParent = this.props.dropdownParent || $('.modal-body').has(this.input)[0] || $('.tile-body').has(this.input)[0];
        if (arguments.length) {
            const { data, label } = this.props,
                options = { placeholder: label, tags: true, dropdownParent };
            if (this.props.multiple) {
                value = value ? (Array.isArray(value) ? value : [value]) : [];
                // this.setState({ valueText: value.join(', ') }); // TODO: readonly value
            } else {
                this.setState({ valueText: value && value.text ? value.text : value });
            }

            if (Array.isArray(data)) {
                options.data = data;
                $(this.input).select2(options).val(value).trigger('change');
            } else {
                options.ajax = { ...data, delay: 500 };
                $(this.input).select2(options);
                if (value) {
                    $(this.input).select2('trigger', 'select', { data: value });
                } else {
                    $(this.input).val(null).trigger('change');
                }
            }
        } else {
            return $(this.input).val();
        }
    }

    render = () => {
        const { className = '', style = {}, labelStyle = {}, label = '', multiple = false, readOnly = false } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                {label ? <label style={labelStyle}>{label}{readOnly ? ':' : ''}</label> : null} {readOnly ? <b>{this.state.valueText}</b> : ''}
                <div style={{ width: '100%', display: readOnly ? 'none' : 'block' }}>
                    <select ref={e => this.input = e} multiple={multiple} disabled={readOnly}>
                        {/* <optgroup label={'Lựa chọn ' + label} /> */}
                    </select>
                </div>
            </div>
        )
    }
}

export class FormDatePicker extends React.Component {
    state = { value: '' };
    componentDidMount() {
        $(document).ready(() => $(this.input).datepicker({ format: 'dd/mm/yyyy', autoclose: true }));
    }

    value = function (date) {
        if (arguments.length) {
            date = date ? T.dateToText(date, 'dd/mm/yyyy') : '';
            this.setState({ value: date });
            $(this.input).val(date);
        } else {
            date = $(this.input).val();
            return date ? T.formatDate(date) : null;
        }
    }

    render() {
        let { label = '', className = '', readOnly = false } = this.props;
        return (
            <div className={'form-group ' + (className || '')}>
                <label onClick={e => this.input.focus()}>{label}</label>{readOnly && this.state.value ? <>: <b>{this.state.value}</b></> : ''}
                <input ref={e => this.input = e} className='form-control' type='text' placeholder={label} style={{ display: readOnly ? 'none' : 'block' }} />
            </div>);
    }
}

export class FormImageBox extends React.Component {
    setData = data => this.imageBox.setData(data);

    render() {
        let { label = '', className = '', style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', image = null, onDelete = null, onSuccess = null } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && image && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <ImageBox ref={e => this.imageBox = e} postUrl={postUrl} uploadType={uploadType} image={image} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} />
            </div>);
    }
}

export class FormFileBox extends React.Component {
    setData = data => this.fileBox.setData(data);

    render() {
        let { label = '', className = '', style = {}, readOnly = false, postUrl = '/user/upload', uploadType = '', onDelete = null, onSuccess = null } = this.props;
        return (
            <div className={'form-group ' + className} style={style}>
                <label>{label}&nbsp;</label>
                {!readOnly && onDelete ?
                    <a href='#' className='text-danger' onClick={onDelete}><i className='fa fa-fw fa-lg fa-trash' /></a> : null}
                <FileBox ref={e => this.fileBox = e} postUrl={postUrl} uploadType={uploadType} readOnly={readOnly} success={data => onSuccess && onSuccess(data)} />
            </div>);
    }
}

// Page components ----------------------------------------------------------------------------------------------------
export class CirclePageButton extends React.Component {
    render() {
        const { type = 'back', style = {}, to = '', onClick = () => { } } = this.props; // type = back | save | create | export
        if (type == 'save') {
            return (
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px', ...style }} onClick={onClick}>
                    <i className='fa fa-lg fa-save' />
                </button>);
        } else if (type == 'create') {
            return (
                <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px', ...style }} onClick={onClick}>
                    <i className='fa fa-lg fa-plus' />
                </button>);
        } else if (type == 'export') {
            return (
                <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px', ...style }} onClick={onClick}>
                    <i className='fa fa-lg fa-file-excel-o' />
                </button>);
        } else {
            return (
                <Link to={to} className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px', ...style }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>);
        }
    }
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
        const { readOnly = false } = this.props;
        return (
            <div className='modal fade' tabIndex='-1' role='dialog' ref={e => this.modal = e}>
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
                            {readOnly == null || readOnly == true ? null :
                                <button type='submit' className='btn btn-primary'>
                                    <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                </button>}
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

    getCurrentPermissions = () => this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];

    getUserPermission = (prefix, listPermissions = ['read', 'write', 'delete']) => {
        const permission = {},
            currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
        return permission;
    }

    renderPage = ({ icon, title, header, breadcrumb, content, backRoute, onCreate, onSave, onExport }) => {
        if (breadcrumb == null) breadcrumb = [];
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className={icon} /> {title}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        {header}
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        {breadcrumb.map((item, index) => <span key={index}>&nbsp;/&nbsp;{item}</span>)}
                    </ul>
                </div>
                {content}
                {backRoute ? <CirclePageButton type='back' to={backRoute} /> : null}
                {onCreate ? <CirclePageButton type='create' onClick={onCreate} /> : null}
                {onSave ? <CirclePageButton type='save' onClick={onSave} /> : null}
                {onExport ? <CirclePageButton type='export' onClick={onExport} /> : null}
            </main>);
    }

    render() { return null; }
}