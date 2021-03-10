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
            path: '/user/dashboard',
            component: Loadable({ loading: Loading, loader: () => import('./adminDashboardPage.jsx') })
        },
        {
            path: '/user',
            component: Loadable({ loading: Loading, loader: () => import('./userProfilePage.jsx') })
        },
        {
            path: '/user/multimedia',
            component: Loadable({ loading: Loading, loader: () => import('./adminMultimediaPage.jsx') })
        },
        {
            path: '/user/settings',
            component: () => <SubMenusPage menuLink='/user/settings' menuKey={2000} headerIcon='fa-gear' />
        },
    ],
};