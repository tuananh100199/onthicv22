//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import teacherDiploma from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { teacherDiploma },
    },
    routes: [
        {
            path: '/user/teacher-diploma',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
    ]
};
