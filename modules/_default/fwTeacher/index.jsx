//TEMPLATES: admin|home
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import teacher from './redux';

export default {
    redux: {
        parent: 'enrollment',
        reducers: { teacher },
    },
    routes: [
        {
            path: '/user/teacher-type/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherTypeCategoryPage') }),
        },
        {
            path: '/user/profile/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminProfileCategoryPage') }),
        },
        {
            path: '/user/gplx/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminGplxCategoryPage') }),
        },
        {
            path: '/user/contract/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminContractCategoryPage') }),
        },
        {
            path: '/user/teacher-certification/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCertificationCategoryPage') }),
        },
        {
            path: '/user/teacher',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') }),
        },
        {
            path: '/user/teacher-tutorial',
            component: Loadable({ loading: Loading, loader: () => import('./teacherDocumentPage') }),
        },
        {
            path: '/user/teacher/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') }),
        },
        {
            path: '/user/teacher-course',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherCoursePage') }),
        },
        {
            path: '/user/teacher-course/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherCourseDetailPage') }),
        },
        {
            path: '/user/teacher-calendar',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherCalendarPage') }),
        },
        {
            path: '/user/teacher-calendar/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminTeacherCalendarDetailPage') }),
        },
    ]
};
