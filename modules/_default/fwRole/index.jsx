//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import role from './redux';

export default {
    redux: {
        role,
    },
    routes: [
        {
            path: '/user/role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        }
    ],
};