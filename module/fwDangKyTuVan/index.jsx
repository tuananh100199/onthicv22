import React from 'react';
import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionDangKyTuVan from './sectionDangKyTuVan.jsx';
import dangKyTuVanList from './redux/reduxDangKyTuVanList.jsx';
import dangKyTuVan from './redux/reduxDangKyTuVan.jsx';


export default {
    redux: {
        dangKyTuVan,dangKyTuVanList,
    },
    routes: [
        { 
            path: '/user/dang-ky-tu-van/edit/:dangKyTuVanId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }) 
        },
        { 
            path: '/user/dang-ky-tu-van-list', component: Loadable({ loading: Loading, loader: () => import('./adminDangKyTuVanList.jsx') }) 
        },  
        { 
            path: '/user/dang-ky-tu-van-list/edit/:dangKyTuVanListId', component: Loadable({ loading: Loading, loader: () => import('./adminDangKyTuVanListDetail.jsx') }) 
        },
          
    ],
    Section: {
        SectionDangKyTuVan,
    }
};