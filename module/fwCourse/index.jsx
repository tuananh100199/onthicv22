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
        { path: '/user/course/category', component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage.jsx') }) },
        { path: '/user/course/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }) },
        { path: '/user/course/edit/:courseId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }) },
        // { path: '/user/course/draft/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./adminDraftEditPage.jsx') }) },
        // { path: '/user/course/draft', component: Loadable({ loading: Loading, loader: () => import('./adminWaitApprovalPage.jsx') }) },
        { path: '/course/item/:courseId', component: Loadable({ loading: Loading, loader: () => import('./homeCourseDetail.jsx') }) },
        { path: '/tintuc/:link', component: Loadable({ loading: Loading, loader: () => import('./homeCourseDetail.jsx') }) },
    ],
    Section: {
        SectionCourse, SectionCourseList,
    }
};