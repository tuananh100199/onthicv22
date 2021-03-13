import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import subject from './redux';

export default {
    redux: {
        subject
    },
    routes: [
        {
            path: '/user/dao-tao/mon-hoc/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminListMonHoc') })
        },
        {
            path: '/user/dao-tao/mon-hoc/edit/:monHocId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditMonHoc') })
        },
    ],
};