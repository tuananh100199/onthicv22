import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import donDeNghiHoc from './redux.jsx';
import SubMenusPage from '../../view/component/SubMenusPage.jsx';

export default {
    redux: {
        donDeNghiHoc
    },
    routes: [
        {
            path: '/user/bieu-mau/don-de-nghi-hoc/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userDonDeNghiPage.jsx') })
        },
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('./danhSachBieuMau.jsx') })
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./chinhSuaBieuMau.jsx') }),
        },
        {
            path: '/user/don-de-nghi-hoc',
            component: () => <SubMenusPage menuLink='/user/don-de-nghi-hoc' menuKey={3000} headerIcon='fa-user' />
        },
        {
            path: '/user/don-de-nghi-hoc/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonDeNghiHocPage.jsx') }),
        },
        {
            path: '/user/don-de-nghi-hoc/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonDeNghiHocEditPage.jsx') }),
        },
        {
            path: '/user/don-de-nghi-hoc/email',
            component: Loadable({ loading: Loading, loader: () => import('./adminEmailPage.jsx') }),
        },
    ],
};
