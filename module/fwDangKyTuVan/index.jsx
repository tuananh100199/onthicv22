import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionDangKyTuVan from './sectionDangKyTuVan.jsx';
import dangKyTuVan from './redux.jsx';

export default {
    redux: {
        dangKyTuVan,
    },
    routes: [
        {
            path: '/user/dang-ky-tu-van',
            component: Loadable({ loading: Loading, loader: () => import('./admin.jsx') })
        }
    ],
    Section: {
        SectionDangKyTuVan,
    }
};