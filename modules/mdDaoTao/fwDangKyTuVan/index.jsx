import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionDangKyTuVan from './sectionDangKyTuVan';
import dangKyTuVanList from './redux/reduxDangKyTuVanList';
import dangKyTuVan from './redux/reduxDangKyTuVan';

export default {
    init: () => {
        T.component['dangKyTuVan'] = {
            render: (viewId) => <SectionDangKyTuVan viewId={viewId} />,
            backgroundColor: '#c8e6f9',
        };
    },
    redux: {
        dangKyTuVan, dangKyTuVanList,
    },
    routes: [
        {
            path: '/user/dang-ky-tu-van/edit/:dangKyTuVanId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/dang-ky-tu-van-list', component: Loadable({ loading: Loading, loader: () => import('./adminDangKyTuVanList') })
        },
    ],
    Section: {
        SectionDangKyTuVan,
    }
};