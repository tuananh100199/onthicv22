//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import courseFee from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { courseFee },
    },
    routes: [
        {
            path: '/user/course-fee',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/hoc-vien/cong-no/:_id/chinh-thuc',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentInfo') })
        },
        {
            path: '/user/hoc-vien/cong-no/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPayment') })
        },
        {
            path: '/user/hoc-vien/cong-no/:_id/tang-them',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentExtraInfo') })
        },
        {
            path: '/user/hoc-vien/cong-no/:_id/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentHistory') })
        },
    ]
};
