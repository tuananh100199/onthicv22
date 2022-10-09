//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import discount from './redux';
import discountHistory from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { discount, discountHistory },
    },
    routes: [
        {
            path: '/user/discount',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/discount-history',
            component: Loadable({ loading: Loading, loader: () => import('./adminHistoryPage') }),
        },
    ]
};
