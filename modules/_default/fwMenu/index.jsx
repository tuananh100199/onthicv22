import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import menu from './redux';

export default {
    redux: {
        menu,
    },
    routes: [
        {
            path: '/user/menu/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/menu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        }
    ],
};