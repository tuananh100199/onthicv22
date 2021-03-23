import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionCourseList from './sectionCourseList';
import SectionCourse from './sectionCourse';
import course from './redux';

export default {
    init: () => {
        T.component['all courses'] = (viewId) => <SectionCourseList viewId={viewId} />;
        T.component['last course'] = (viewId) => <SectionCourse viewId={viewId} />;
    },
    redux: {
        course,
    },
    routes: [
        { path: '/user/course/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage') }) },
        { path: '/user/course/edit/:courseId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }) },
        { path: '/course/item/:courseId', component: Loadable({ loading: Loading, loader: () => import('./homeCourseDetail') }) },
    ],
    Section: {
        SectionCourse, SectionCourseList,
    }
};