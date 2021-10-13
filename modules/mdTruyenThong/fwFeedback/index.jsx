//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import feedback from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { feedback },
    },
    routes: [
        {
            path: 'user/hoc-vien/phan-hoi/he-thong',
            component: Loadable({ loading: Loading, loader: () => import('./userFeedbackSystemPage') })
        },
        {
            path: '/user/feedback/system',
            component: Loadable({ loading: Loading, loader: () => import('./adminFeedbackSystemPage') })
        },
    ],
};