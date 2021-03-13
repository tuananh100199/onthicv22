import React from 'react';
import { Link } from 'react-router-dom';

export function getUserPermission(system, prefix, listPermissions = ['read', 'write', 'delete']) {
    const permission = {},
        currentPermissions = system && system.user && system.user.permissions ? system.user.permissions : [];
    listPermissions.forEach(item => permission[item] = currentPermissions.includes(`${prefix}:${item}`));
    return permission;
}

export function renderListPage({ icon, title, breadcrumb, content, onCreate }) {
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
                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={onCreate}>
                    <i className='fa fa-lg fa-plus' />
                </button> : null}
        </main>);
}