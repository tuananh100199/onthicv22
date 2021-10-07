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
            path: '/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('./studentView') })
        },
        {
            path: '/user/lecturer/student-time-table',
            component: Loadable({ loading: Loading, loader: () => import('./lecturerView') })
        },
        {
            path: '/user/course-admin/student-time-table',
            component: Loadable({ loading: Loading, loader: () => import('./courseAdminView') })
        },
        {
            path: '/user/course/:courseId/student/:studentId/time-table',
            component: Loadable({ loading: Loading, loader: () => import('./timeTableEditView') })
        },
    ],
    Section: {
        StudentView
    }
};