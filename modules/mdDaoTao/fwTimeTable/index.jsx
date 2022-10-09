//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import timeTable from './redux';
import StudentView from './studentView';

export default {
    redux: {
        parent: 'trainning',
        reducers: { timeTable },
    },
    routes: [
        {
            path: '/user/time-table',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/teacher-off',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherOffPage') })
        },
    ],
    Section: {
        StudentView
    }
};