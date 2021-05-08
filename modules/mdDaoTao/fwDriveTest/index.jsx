//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveTest from './redux';

export default {
    redux: {
        driveTest
    },
    routes: [
        {
            path: '/user/drive-test',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/drive-test/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-thu',
            component: Loadable({ loading: Loading, loader: () => import('./userPageView') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTest') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-thu/chi-tiet/:_id/',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestDetail') })
        },      
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien',
            component: Loadable({ loading: Loading, loader: () => import('./userPageRandomDriveTest') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-ngau-nhien/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageRandomDriveTestDetail') })
        },
    ]
};
