import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import system from './reduxSystem';
import category from './reduxCategory';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {
        system, category,
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
            path: '/user/multimedia',
            component: Loadable({ loading: Loading, loader: () => import('./adminMultimediaPage') })
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-gear' />
        },
    ],
};