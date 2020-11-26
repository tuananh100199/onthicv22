import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import BieuMau from './redux.jsx';

export default {
    redux: {
        BieuMau,
    },
    routes: [ 
        {
            path: '/user/user-form',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminPage.jsx') })
        },
        {
            path: '/user/user-form/edit/:id',
            component: Loadable({ loading: Loading, loader: () => import('./admin/adminEditPage.jsx') }),
        },
       
    ],
};
