import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lesson from './redux';
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {
        lesson
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={8000} headerIcon='fa-user' />
        },
        {
            path: '/user/dao-tao/bai-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminLessonPage') })
        },
        {
            path: '/user/dao-tao/bai-hoc/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/dao-tao/bai-hoc/view/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./lessonDetail') })
        },
    ],
};
