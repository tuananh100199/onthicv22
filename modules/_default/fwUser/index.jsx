import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import user from './redux';

export default {
    redux: {
        user
    },
    routes: [
        {
            path: '/user/user',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/registered',
            component: Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') }),
        },
        {
            path: '/active-user/:userId',
            component: Loadable({ loading: Loading, loader: () => import('view/component/MessagePage') }),
        },
        {
            path: '/forgot-password/:userId/:userToken',
            component: Loadable({ loading: Loading, loader: () => import('./homeForgotPasswordPage') }),
        },
        {
            path: '/user/profile',
            component: Loadable({ loading: Loading, loader: () => import('./adminProfilePage') }),
        },
    ],
};
