//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import profileStudent from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { profileStudent },
    },
    routes: [
        {
            path: '/user/profile-student',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};