//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './redux';

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
        {
            path: '/user/statistic',
            component: Loadable({ loading: Loading, loader: () => import('./adminStatisticPage') })
        },
        {
            path: '/user/setting-capture',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingCapturePage') })
        },
        {
            path: '/user/document',
            component: Loadable({ loading: Loading, loader: () => import('./adminDocumentPage') })
        },
        {
            path: '/user/sms-brandname',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingSmsPage') }),
        }
    ],
};