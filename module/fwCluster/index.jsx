import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import cluster from './redux.jsx';

export default {
    redux: {
        cluster,
    },
    routes: [
        {
            path: '/user/cluster',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }),
        },
    ],
};