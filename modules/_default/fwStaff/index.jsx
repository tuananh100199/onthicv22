//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import staffInfo from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { staffInfo },
    },
    routes: [
        {
            path: '/user/staff-info',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
