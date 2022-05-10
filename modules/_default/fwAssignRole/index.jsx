//TEMPLATES: admin
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import assignRole from './redux';

export default {
    redux: {
        parent: 'framework',
        reducers: { assignRole },
    },
    routes: [
        {
            path: '/user/assign-role',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/assign-role/course-admin',
            component: Loadable({ loading: Loading, loader: () => import('./page/adminCourseAdminAssignRole') }),
        },
        {
            path: '/user/assign-role/course-enroll',
            component: Loadable({ loading: Loading, loader: () => import('./page/adminCourseEnrollAssignRole') }),
        },
        {
            path: '/user/assign-role/course-teacher',
            component: Loadable({ loading: Loading, loader: () => import('./page/adminCourseTeacherAssignRole') }),
        },
        {
            path: '/user/assign-role/course-device',
            component: Loadable({ loading: Loading, loader: () => import('./page/adminCourseDeviceAssignRole') }),
        },
        {
            path: '/user/assign-role/course-accountant',
            component: Loadable({ loading: Loading, loader: () => import('./page/adminCourseAccountantAssignRole') }),
        }
    ],
};