//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import discount from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { discount },
    },
    routes: [
        {
            path: '/user/discount',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
