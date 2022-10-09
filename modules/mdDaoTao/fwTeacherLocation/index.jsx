//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import teacherLocation from './redux';

export default {
    redux: {
        parent: 'teacher',
        reducers: { teacherLocation },
    },
    routes: [
        {
            path: '/user/teacher-location',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/teacher-location/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        }
        
    ]
};
