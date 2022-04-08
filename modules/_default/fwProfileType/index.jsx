//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import profileType from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { profileType },
    },
    routes: [
        {
            path: '/user/profile-type',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};