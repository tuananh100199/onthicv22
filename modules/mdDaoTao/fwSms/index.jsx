//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sms from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { sms },
    },
    routes: [
        {
            path: '/user/sms',
            component: Loadable({ loading: Loading, loader: () => import('./adminSmsPage') })
        }
    ],
};