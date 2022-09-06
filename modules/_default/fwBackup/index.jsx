//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import backup from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { backup },
    },
    routes: [
        {
            path: '/user/backup',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ],
};