import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import document from './redux.jsx';

export default {
    redux: {
        document,
    },
    routes: [
        { path: '/user/document/category', component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage.jsx') }) },
        // { path: '/user/document/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }) },
        // { path: '/user/document/edit/:documentId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }) },
        // { path: '/document/item/:documentId', component: Loadable({ loading: Loading, loader: () => import('./homeTaiLieuGiangDayDetail.jsx') }) },
        // { path: '/tai-lieu/:link', component: Loadable({ loading: Loading, loader: () => import('./homeTaiLieuGiangDayDetail.jsx') }) },
    ]
};