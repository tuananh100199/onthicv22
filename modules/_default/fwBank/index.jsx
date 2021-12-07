//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import bank from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { bank },
    },
    routes: [
        {
            path: '/user/bank',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        }
    ],
};