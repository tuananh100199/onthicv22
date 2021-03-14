import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import courseType from './redux';
import SectionCourseTypeList from './sectionCourseTypeList';

export default {
    redux: {
        courseType,
    },
    routes: [
        {
            path: '/user/course-type/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminCourseTypePage') })
        },
        {
            path: '/user/course-type/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminCourseTypeEditPage') })
        },
        {
            path: '/course-type/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./homeCourseTypeDetailPage') })
        },
    ],
    Section: {
        SectionCourseTypeList
    }
};