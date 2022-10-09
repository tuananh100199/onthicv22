//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import facility from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { facility },
    },
    routes: [
        {
            path: '/user/facility',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/facility/manager',
            component: Loadable({ loading: Loading, loader: () => import('./adminInfoPage') })
        },
        {
            path: '/user/facility/manager/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') })
        },
        {
            path: '/user/facility/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
    ],
};