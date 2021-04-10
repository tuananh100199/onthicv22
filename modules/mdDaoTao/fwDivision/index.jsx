//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import division from './redux';

export default {
    redux: {
        division
    },
    routes: [
        {
            path: '/user/division',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/division/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
    ]
};
