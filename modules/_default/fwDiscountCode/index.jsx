//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import discountCode from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { discountCode },
    },
    routes: [
        {
            path: '/user/discount-code',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
