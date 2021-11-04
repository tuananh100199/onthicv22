//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import car from './redux';

export default {
    redux: {
        parent: 'trainning',
        reducers: { car },
    },
    routes: [
        {
            path: '/user/car',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
    ],
};