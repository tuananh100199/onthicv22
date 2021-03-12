import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import address from './redux';

export default {
    redux: {
        address
    },
    routes: [
        {
            path: '/user/address/edit/:addressId',
            component: Loadable({ loading: Loading, loader: () => import('./adminAddressEdit') }),
        },
        {
            path: '/user/address/all',
            component: Loadable({ loading: Loading, loader: () => import('./adminAddressView') }),
        }
    ]
};
