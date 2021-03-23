import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './reduxSystem';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {
        system,
    },
    routes: [
        {
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage') })
        },
        {
            path: '/user',
            component: Loadable({ loading: Loading, loader: () => import('./userProfilePage') })
        },
        {
            path: '/user/settings',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingsPage') })
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-gear' />
        },
    ],
};