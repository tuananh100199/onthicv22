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
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/chinh-thuc',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/tang-them',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentExtraInfo') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/lich-su',
            component: Loadable({ loading: Loading, loader: () => import('./userPaymentHistory') })
        },
    ]
};
