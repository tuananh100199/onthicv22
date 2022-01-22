//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import courseFee from './redux';

export default {
    redux: {
        parent: 'accountant',
        reducers: { courseFee },
    },
    routes: [
        {
            path: '/user/course-fee',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
