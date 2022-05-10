//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import licenseTest from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { licenseTest },
    },
    routes: [
        {
            path: '/user/license-test',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
