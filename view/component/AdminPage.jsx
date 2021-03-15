import React from 'react';
import { Link } from 'react-router-dom';

export class AdminModal extends React.Component {
    modal = React.createRef();

    onShown = (modalShown) => {
        $(this.modal.current).on('shown.bs.modal', () => modalShown());
    }

    show = () => {
        this.onShow && this.onShow();
        $(this.modal.current).modal('show');
    }

    hide = () => {
        this.onHide && this.onHide();
        $(this.modal.current).modal('hide');
    }

    renderModal = ({ title, body }) => (
        <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
            <form className='modal-dialog' role='document' onSubmit={e => { e.preventDefault() || this.onSubmit && this.onSubmit(e) }}>
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
                        <button type='submit' className='btn btn-primary'>
                            <i className='fa fa-fw fa-lg fa-save' /> Lưu
                        </button>
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
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </main>);
    }

    render() {
        return null;
    }
}