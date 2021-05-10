//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import sign from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { sign },
    },
    routes: [
        {
            path: '/user/sign/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') }),
        },
        {
            path: '/user/sign',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};