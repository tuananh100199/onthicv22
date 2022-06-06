//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import planCourse from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { planCourse },
    },
    routes: [
        {
            path: '/user/plan-course',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};