import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import baihoc from './redux/redux.jsx';
import question from './redux/reduxQuestion.jsx'
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

export default {
    redux: {
        baihoc, question
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={8000} headerIcon='fa-user' />
        },
        { path: '/user/dao-tao/bai-hoc/list', component: Loadable({ loading: Loading, loader: () => import('./adminListBaiHoc.jsx') }) },
        { path: '/user/dao-tao/bai-hoc/edit/:baihocId', component: Loadable({ loading: Loading, loader: () => import('./adminEditBaiHoc.jsx') }) },
        { path: '/user/dao-tao/bai-hoc/view/:baihocId', component: Loadable({ loading: Loading, loader: () => import('./lessonDetail.jsx') }) },

    ],
};
