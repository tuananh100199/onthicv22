import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import system from './reduxSystem.jsx';
import category from './reduxCategory.jsx';
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

export default {
    redux: {
        system, category,
    },
    routes: [
        {
            path: '/user/settings',
            component: Loadable({ loading: Loading, loader: () => import('./adminSettingsPage.jsx') })
        },
        {
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage.jsx') })
        },
        {
            path: '/user',
            component: () => <SubMenusPage menuLink='/user' menuKey={1000} headerIcon='fa-user' />
        },
        {
            path: '/user/don-de-nghi-hoc',
            component: () => <SubMenusPage menuLink='/user/don-de-nghi-hoc' menuKey={3000} headerIcon='fa-user' />
        }
    ],
};