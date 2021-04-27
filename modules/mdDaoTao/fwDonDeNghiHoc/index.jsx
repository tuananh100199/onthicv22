//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import donDeNghiHoc from './redux';

export default {
    redux: {
        donDeNghiHoc
    },
    routes: [
        {
            path: '/user/bieu-mau/don-de-nghi-hoc/:id',
            component: Loadable({ loading: Loading, loader: () => import('./userDonDeNghiPage') })
        },
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('./danhSachBieuMau') })
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./chinhSuaBieuMau') }),
        },
        {
            path: '/user/don-de-nghi-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonDeNghiList') }),
        },
        {
            path: '/user/don-de-nghi-hoc/list/:licenseClass',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonDeNghiHocPage') }),
        },
        {
            path: '/user/don-de-nghi-hoc/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminDonDeNghiHocEditPage') }),
        },
        {
            path: '/user/don-de-nghi-hoc/email',
            component: Loadable({ loading: Loading, loader: () => import('./adminEmailPage') }),
        },
    ],
};
