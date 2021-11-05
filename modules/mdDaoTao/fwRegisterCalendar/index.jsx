//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import registerCalendar from './redux';
import StudentView from './studentView';

export default {
    redux: {
        parent: 'trainning',
        reducers: { registerCalendar },
    },
    routes: [
        {
            path: '/user/course/:_id/student/register-calendar',
            component: Loadable({ loading: Loading, loader: () => import('./studentView') })
        }
    ,],
    Section: {
        StudentView
    }
};