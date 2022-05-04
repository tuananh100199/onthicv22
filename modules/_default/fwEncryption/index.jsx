//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import encryption from './redux';

export default {
    redux: {
        parent: 'framwork',
        reducers: { encryption },
    },
    routes: [
        {
            path: '/user/encryption/export',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/encryption/import',
            component: Loadable({ loading: Loading, loader: () => import('./adminImportPage') }),
        },
    ]
};
