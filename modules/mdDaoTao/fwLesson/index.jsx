import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import lesson from './redux/reduxLesson';
import question from './redux/reduxQuestion'
import SubMenusPage from 'view/component/SubMenusPage';

export default {
    redux: {
        lesson, question
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={8000} headerIcon='fa-user' />
        },
        {
            path: '/user/dao-tao/bai-hoc/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminListBaiHoc') })
        },
        {
            path: '/user/dao-tao/bai-hoc/edit/:baihocId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditBaiHoc') })
        },
        {
            path: '/user/dao-tao/bai-hoc/view/:baihocId',
            component: Loadable({ loading: Loading, loader: () => import('./lessonDetail') })
        },
    ],
};
