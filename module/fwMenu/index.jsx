import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import menu from './redux.jsx';

export default {
    redux: {
        menu,
    },
    routes: [
        {
            path: '/user/menu/edit/:menuId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }),
        },
        {
            path: '/user/menu',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }),
        }
    ],
};