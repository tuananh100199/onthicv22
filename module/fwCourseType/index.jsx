import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import courseType from './redux.jsx';
import SectionCTypeList from './sectionCTypeList.jsx';
import SectionCTypeDetail from './sectionCTypeDetail.jsx';

export default {
    redux: {
        courseType,
    },
    routes: [
        { path: '/user/course-type/list', component: Loadable({ loading: Loading, loader: () => import('./adminListCType.jsx') }) },
        { path: '/user/course-type/edit/:courseTypeId', component: Loadable({ loading: Loading, loader: () => import('./adminEditCType.jsx') }) },
        { path: '/course-type/:courseTypeId', component: Loadable({ loading: Loading, loader: () => import('./sectionCTypeDetail.jsx') }) },
    ],
    Section: {
        SectionCTypeList, SectionCTypeDetail
    }
};