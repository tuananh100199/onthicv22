//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
// import SectionCourseList from './sectionCourseList';
// import SectionCourse from './sectionCourse';
import course from './redux';

export default {
    init: () => {
        // T.component['all courses'] = {
        //     render: (viewId) => <SectionCourseList viewId={viewId} />,
        //     backgroundColor: '#ef9a9c',
        // };
        // T.component['last course'] = {
        //     render: (viewId) => <SectionCourse viewId={viewId} />,
        //     backgroundColor: '#ef9a9a',
        // };
    },
    redux: {
        parent: 'trainning',
        reducers: { course },
    },
    routes: [
        {
            path: '/user/course',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/course/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/thong-tin/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userCourseInfo') })
        },
    ],
    Section: {
        // SectionCourse, SectionCourseList,
    }
};