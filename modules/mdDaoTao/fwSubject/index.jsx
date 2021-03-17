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
            component: Loadable({ loading: Loading, loader: () => import('./adminListSubject') })
        },
        {
            path: '/user/dao-tao/mon-hoc/edit/:subjectId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
    ],
};