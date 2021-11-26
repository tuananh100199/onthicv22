//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import payment from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { payment },
    },
    routes: [
        {
            path: '/user/payment',
            component: Loadable({ loading: Loading, loader: () => import('./adminPaymentPage') })
        }
    ],
    Section: {
    }
};