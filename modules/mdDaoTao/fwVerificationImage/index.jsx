//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import verificationImage from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { verificationImage },
    },
    routes: [
        {
            path: '/user/verification-image',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/verification-image/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
    ]
};
