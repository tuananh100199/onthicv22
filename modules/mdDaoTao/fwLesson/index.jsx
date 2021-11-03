//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lesson from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { lesson },
    },
    routes: [
        {
            path: '/user/dao-tao/bai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/dao-tao/bai-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/tai-lieu/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userTaiLieuThamKhao') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/thong-tin/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userLessonInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:courseId/mon-hoc/:subjectId/bai-hoc/cau-hoi/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userQuestion') })
        },
    ],
};
