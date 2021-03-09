import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import subject from './redux.jsx';
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

export default {
    redux: {
        subject
    },
    routes: [
        {
            path: '/user/dao-tao',
            component: () => <SubMenusPage menuLink='/user/dao-tao' menuKey={8000} headerIcon='fa-user' />
        },
        { path: '/user/dao-tao/mon-hoc/list', component: Loadable({ loading: Loading, loader: () => import('./adminListMonHoc.jsx') }) },
        { path: '/user/dao-tao/mon-hoc/edit/:monHocId', component: Loadable({ loading: Loading, loader: () => import('./adminEditMonHoc.jsx') }) },
        { path: '/user/dao-tao/mon-hoc/list-bai-hoc/:monHocId', component: Loadable({ loading: Loading, loader: () => import('./adminListBaiHocTheoMonHoc.jsx') }) },

    ],
};
