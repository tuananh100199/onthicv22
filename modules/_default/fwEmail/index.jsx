//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

export default {
    redux: {},
    routes: [
        {
            path: '/user/email',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        }
    ],
};