//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lesson from './redux';

export default {
    redux: {
        lesson
    },
    routes: [
        {
            path: '/user/dao-tao/bai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/bai-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/mon-hoc/bai-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPage') })
        },
    ],
};
