//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import revenue from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { revenue },
    },
    routes: [
        {
            path: '/user/revenue',
            component: Loadable({ loading: Loading, loader: () => import('./adminRevenuePage') }),
        },
        {
            path: '/user/revenue/info',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/revenue/debt',
            component: Loadable({ loading: Loading, loader: () => import('./adminDebtTrackingPage') }),
        },
        {
            path: '/user/revenue/tracking',
            component: Loadable({ loading: Loading, loader: () => import('./adminRevenueTrackingPage') }),
        },
    ],
};