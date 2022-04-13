//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import enrollTarget from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { enrollTarget },
    },
    routes: [
        {
            path: '/user/enroll-target',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};