import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import division from './redux';

export default {
    redux: {
        division
    },
    routes: [
        {
            path: '/user/division/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/division',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        }
    ]
};
