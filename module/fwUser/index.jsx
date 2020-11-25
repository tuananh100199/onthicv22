import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import user from './redux.jsx';

export default {
    redux: {
        user
    },
    routes: [
        {
            path: '/user/user',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }),
        },
        {
            path: '/registered',
            component: Loadable({ loading: Loading, loader: () => import('../../view/component/MessagePage.jsx') })
        },
        {
            path: '/active-user/:userId',
            component: Loadable({ loading: Loading, loader: () => import('../../view/component/MessagePage.jsx') })
        },
        {
            path: '/forgot-password/:userId/:userToken',
            component: Loadable({ loading: Loading, loader: () => import('./homeForgotPasswordPage.jsx') })
        },
        {
            path: '/user/profile',
            component: Loadable({ loading: Loading, loader: () => import('./adminProfilePage.jsx') })
        },
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('../fwUserForm/admin/adminPage.jsx') })
        },
    ],
};
