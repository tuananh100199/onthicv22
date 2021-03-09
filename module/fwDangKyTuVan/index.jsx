import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionDangKyTuVan from './sectionDangKyTuVan.jsx';
import dangKyTuVanList from './redux/reduxDangKyTuVanList.jsx';
import dangKyTuVan from './redux/reduxDangKyTuVan.jsx';
// import statisticDangKyTuVan from './redux/reduxStatisticDangKyTuVan.jsx';



export default {
    redux: {
        dangKyTuVan,dangKyTuVanList,
    },
    routes: [
        {
            path: '/user/dang-ky-tu-van',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') })
        },
        { 
            path: '/user/dang-ky-tu-van/edit/:dangKyTuVanId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }) 
        },
        
    ],
    Section: {
        SectionDangKyTuVan,
    }
};