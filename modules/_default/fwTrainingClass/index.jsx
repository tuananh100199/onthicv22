//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import trainingClass from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { trainingClass },
    },
    routes: [
        {
            path: '/user/training-class/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/training-class',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
