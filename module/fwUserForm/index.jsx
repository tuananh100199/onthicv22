import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import form from './redux.jsx';

export default {
    redux: {
        form,
    },
    routes: [
        {
            path: '/user/user-form/list',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminPage.jsx') }),
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminEditPage.jsx') }),
        },
        {
            path: '/user/user-form/registration/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminRegistrationPage.jsx')})
        },
        {
            path: '/user-form/registration/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./home/homeRegistration.jsx')})
        },
    ],
};
