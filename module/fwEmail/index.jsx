import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';

export default {
    redux: {},
    routes: [
        {
            path: '/user/email',
            component: Loadable({ loading: Loading, loader: () => import('./admin.jsx') })
        }
    ],
};