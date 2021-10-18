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
            path: '/user/course/:_id/manager',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminManagerPage') })
        },
        {
            path: '/user/course/:_id/student',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminStudentPage') })
        },
        {
            path: '/user/course/:_id/teacher',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminTeacherPage') })
        },
        {
            path: '/user/course/:_id/representer',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminRepresenterPage') })
        },
        {
            path: '/user/course/:_id/rate-teacher',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminTeacherRatePage') })
        },
        {
            path: '/user/course/:_id/feedback',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFeedbackPage') })
        },
        {
            path: '/user/course/:_id/your-students',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerStudentPage') })
        },
        {
            path: '/user/course/:_id/learning',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminLearningProgressPage') })
        },
        {
            path: '/user/course/:_id/calendar',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerTimeTablePage') })
        },
        {
            path: '/user/course/:_id/rate-subject',
            component: Loadable({ loading: Loading, loader: () => import('./pages/lecturerRatingPage') })
        },
        {
            path: '/user/course/:_id/chat-all',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminChatAllPage') })
        },
        {
            path: '/user/course/:_id/chat',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminChatPersonalPage') })
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