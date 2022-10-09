//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import student from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { student },
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
            path: '/user/student/fail-exam',
            component: Loadable({ loading: Loading, loader: () => import('./adminFailStudentPage') })
        },
        {
            path: '/user/student/import-fail-pass',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportFailPassStudentPage') })
        },
        {
            path: '/user/student/fail-graduation',
            component: Loadable({ loading: Loading, loader: () => import('./adminFailGraduationPage') })
        },
        {
            path: '/user/pre-student/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/student/debt',
            component: Loadable({ loading: Loading, loader: () => import('./adminDebtTrackingPage') })
        },
        {
            path: '/user/student/debt-enroll',
            component: Loadable({ loading: Loading, loader: () => import('./adminDebtTrackingPage') })
        },
        {
            path: '/user/student/payment/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminThanhToanTrucTiepPage') })
        },
        {
            path: '/user/student/active-course',
            component: Loadable({ loading: Loading, loader: () => import('./adminActiveCoursePage') })
        },
        {
            path: '/user/student/done-course',
            component: Loadable({ loading: Loading, loader: () => import('./adminDoneCourseStudentPage') })
        },
    ],
    Section: {
    }
};