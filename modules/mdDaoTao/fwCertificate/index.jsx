//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import certificate from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { certificate },
    },
    routes: [
        {
            path: '/user/certificate',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/certification',
            component: Loadable({ loading: Loading, loader: () => import('./adminCertificationPage') }),
        },
        {
            path: '/user/license',
            component: Loadable({ loading: Loading, loader: () => import('./adminLicensePage') }),
        },
    ]
};
