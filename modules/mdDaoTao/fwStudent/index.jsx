import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    init: () => {
    },
    redux: {
    },
    routes: [
        {
            path: '/user/student',
            component: Loadable({ loading: Loading, loader: () => import('./adminStudentPage') })
        },
    ],
    Section: {
    }
};