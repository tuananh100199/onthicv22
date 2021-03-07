import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionCourse from './sectionCourse.jsx';
import SectionCourseList from './sectionCourseList.jsx';
import course from './redux.jsx';

export default {
    redux: {
        course,
    },
    routes: [
        { path: '/user/course/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }) },
        { path: '/user/course/item/:courseId', component: Loadable({ loading: Loading, loader: () => import('./adminOverviewCourse.jsx') }) },
        { path: '/user/course/edit/:courseId/common', component: Loadable({ loading: Loading, loader: () => import('./adminEditCommonPage.jsx') }) },
        { path: '/course/item/:courseId', component: Loadable({ loading: Loading, loader: () => import('./homeCourseDetail.jsx') }) },
        { path: '/khoa-hoc/:link', component: Loadable({ loading: Loading, loader: () => import('./homeCourseDetail.jsx') }) },
    ],
    Section: {
        SectionCourse, SectionCourseList,
    }
};