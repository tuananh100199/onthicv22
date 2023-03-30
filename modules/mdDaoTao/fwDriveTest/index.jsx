//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import driveTest from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { driveTest },
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
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTest') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-thi-thu/:_id',
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
        {
            path: '/user/hoc-vien/khoa-hoc/cau-de-sai',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestEasyFail') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/cau-de-sai/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestEasyFailDetail') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-co-dinh',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestFixed') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-co-dinh/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestFixedPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/bo-de-co-dinh/:_id/:_index',
            component: Loadable({ loading: Loading, loader: () => import('./userPageDriveTestFixedDetail') })
        },
    ]
};
