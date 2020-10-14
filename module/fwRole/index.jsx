import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import role from './redux.jsx';

export default {
    redux: {
        role,
    },
    routes: [
        {
            path: '/user/role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }),
        }
    ],
};