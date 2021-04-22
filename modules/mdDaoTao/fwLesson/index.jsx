//TEMPLATES: admin
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lesson from './redux';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {
        lesson
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={8000} headerIcon='fa-user' />
        },
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
