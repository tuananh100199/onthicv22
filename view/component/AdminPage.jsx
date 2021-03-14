import React from 'react';
// import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

export default class AdminPage extends React.Component {
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
                    <h1><i className={icon} />{title}</h1>
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