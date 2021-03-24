import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './reduxSystem';

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
            path: '/user/setting',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingsPage') })
        },
    ],
};