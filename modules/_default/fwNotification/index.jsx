//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import notification from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { notification },
    },
    routes: [
        {
            path: '/user/notification',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};