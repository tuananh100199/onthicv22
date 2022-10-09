//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import role from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { role },
    },
    routes: [
        {
            path: '/user/role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        }
    ],
};