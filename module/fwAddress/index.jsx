import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import address from './redux.jsx';

export default {
    redux: {
        address
    },
    routes: [
        {
            path: '/user/address/edit/:addressId',
            component: Loadable({ loading: Loading, loader: () => import('./adminAddressEdit.jsx') })
        },
        {
            path: '/user/address/all',
            component: Loadable({ loading: Loading, loader: () => import('./adminAddressView.jsx') })
        }
    ],
    Section: {
    }
};
