//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import device from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { device },
    },
    routes: [
        {
            path: '/user/device',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/device/manager',
            component: Loadable({ loading: Loading, loader: () => import('./adminInfoPage') })
        },
        {
            path: '/user/device/manager/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/device/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
    ],
};