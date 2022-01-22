//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import feeType from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { feeType },
    },
    routes: [
        {
            path: '/user/fee-type',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
