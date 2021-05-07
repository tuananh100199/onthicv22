//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import student from './redux';

export default {
    redux: {
        student,
    },
    routes: [
        {
            path: '/user/pre-student',
            component: Loadable({ loading: Loading, loader: () => import('./adminPreStudentPage') })
        },
        {
            path: '/user/student',
            component: Loadable({ loading: Loading, loader: () => import('./adminStudentPage') })
        },
        {
            path: '/user/pre-student/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
    ],
    Section: {
    }
};