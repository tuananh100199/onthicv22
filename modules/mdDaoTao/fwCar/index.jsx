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
        {
            path: '/user/car/manager',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminInfoPage') })
        },
        {
            path: '/user/car/practice',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminXeTapLai') })
        },
        {
            path: '/user/car/course',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminCoursePage') })
        },
        {
            path: '/user/car/course/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminCourseEditPage') })
        },
        {
            path: '/user/car/registration',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminRegistrationPage') })
        },
        {
            path: '/user/car/category',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminCategoryPage') })
        },
        {
            path: '/user/car/fuel',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFuelPage') })
        },
        {
            path: '/user/car/fuel/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminFuelEditPage') })
        },
        {
            path: '/user/car/repair',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminRepairPage') })
        },
        {
            path: '/user/car/import',
            component: Loadable({ loading: Loading, loader: () => import('./pages/adminImportPage') })
        },
    ],
};