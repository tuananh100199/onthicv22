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
            path: '/user/hoc-vien/cong-no/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./userPayment') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/cong-no/huong-dan',
            component: Loadable({ loading: Loading, loader: () => import('./userDocumentPaymentPage') })
        },
    ]
};
