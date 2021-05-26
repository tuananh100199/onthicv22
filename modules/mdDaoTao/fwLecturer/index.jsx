//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lecturer from './redux';

export default {
    init: () => {
    },
    redux: {
        parent: 'trainning',
        reducers: { lecturer },
    },
    routes: [
        {
            path: '/user/lecturer',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/lecturer/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminCourseInfo') })
        },
    ],
    Section: {
        // SectionCourse, SectionCourseList,
    }
};