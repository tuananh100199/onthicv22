import React from 'react';
import { Link } from 'react-router-dom';

export class Checkbox extends React.Component {
    state = { checked: false };
    box = React.createRef();

    val = (checked) => {
        if (checked != null) {
            this.setState({ checked });
        } else {
            return this.state.checked;
        }
    }

    onCheck = () => this.props.permissionWrite && this.setState({ checked: !this.state.checked });

    render() {
        const { className, label } = this.props;
        return (
            <div className={className} style={{ display: 'inline-flex' }}>
                <label style={{ marginBottom: 0 }} onClick={this.onCheck}>{label}:&nbsp;</label>
                <div className='toggle'>
                    <label style={{ marginBottom: 0 }}>
                        <input type='checkbox' checked={this.state.checked} onChange={this.onCheck} /><span className='button-indecator' />
                    </label>
                </div>
            </div>);
    }
}

export class AdminModal extends React.Component {
    modal = React.createRef();

    onShown = (modalShown) => {
        $(this.modal.current).on('shown.bs.modal', () => modalShown());
    }

    show = (item) => {
        this.onShow && this.onShow(item);
        $(this.modal.current).modal('show');
    }

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal.current).modal('hide');
    }

    renderModal = ({ title, body, size }) => (
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
    );

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
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>{breadcrumb}&nbsp;/&nbsp;{title}
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