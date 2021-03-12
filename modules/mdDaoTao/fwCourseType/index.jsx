import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import courseType from './redux';
import SectionCTypeList from './sectionCTypeList';

export default {
    redux: {
        courseType,
    },
    routes: [
        { path: '/user/course-type/list', component: Loadable({ loading: Loading, loader: () => import('./adminListCType') }) },
        { path: '/user/course-type/edit/:courseTypeId', component: Loadable({ loading: Loading, loader: () => import('./adminEditCType') }) },
        { path: '/course-type/:courseTypeId', component: Loadable({ loading: Loading, loader: () => import('./homeCTypeDetail') }) },
    ],
    Section: {
        SectionCTypeList
    }
};
