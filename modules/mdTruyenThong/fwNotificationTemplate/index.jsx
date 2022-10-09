//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import notificationTemplate from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { notificationTemplate },
    },
    routes: [
        {
            path: '/user/notification/template',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};