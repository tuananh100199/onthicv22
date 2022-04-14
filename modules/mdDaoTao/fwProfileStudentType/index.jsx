//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import profileStudentType from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { profileStudentType },
    },
    routes: [
        {
            path: '/user/profile-student-type',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};