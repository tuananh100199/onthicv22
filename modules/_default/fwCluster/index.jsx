//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import cluster from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { cluster },
    },
    routes: [
        {
            path: '/user/cluster',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};