import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import SectionNews from './sectionNews.jsx';
import SectionNewsList from './sectionNewsList.jsx';
import news from './redux.jsx';

export default {
    redux: {
        news,
    },
    routes: [
        { path: '/user/news/category', component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage.jsx') }) },
        { path: '/user/news/list', component: Loadable({ loading: Loading, loader: () => import('./adminPage.jsx') }) },
        { path: '/user/news/edit/:newsId', component: Loadable({ loading: Loading, loader: () => import('./adminEditPage.jsx') }) },
        { path: '/user/news/draft/edit/:draftId', component: Loadable({ loading: Loading, loader: () => import('./adminDraftEditPage.jsx') }) },
        { path: '/user/news/draft', component: Loadable({ loading: Loading, loader: () => import('./adminWaitApprovalPage.jsx') }) },
        { path: '/news/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail.jsx') }) },
        { path: '/tintuc/:link', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail.jsx') }) },
    ],
    Section: {
        SectionNews, SectionNewsList,
    }
};