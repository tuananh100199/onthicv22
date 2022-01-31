//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import coursePayment from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { coursePayment },
    },
    routes: [
        {
            path: '/user/course-payment',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
