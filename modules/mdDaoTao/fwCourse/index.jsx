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
            path: '/user/course/:_id/info',
            component: Loadable({ loading: Loading, loader: () => import('./pages/courseInfoPage') })
        },
        {
            path: '/user/course/:_id/subject',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminSubjectPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/thong-tin/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userCourseInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/phan-hoi',
            component: Loadable({ loading: Loading, loader: () => import('./userCourseFeedbackPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/thoi-khoa-bieu',
            component: Loadable({ loading: Loading, loader: () => import('modules/mdDaoTao/fwTimeTable/studentView') })
        },
    ],
    Section: {
        // SectionCourse, SectionCourseList,
    }
};