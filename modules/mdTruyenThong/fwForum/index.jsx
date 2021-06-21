//TEMPLATES: admin|home
// import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import forum from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { forum },
    },
    routes: [
        {
            path: '/user/category/forum',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/forum',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/forum/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};