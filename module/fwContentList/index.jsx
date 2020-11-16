import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import contentList from './redux.jsx';
import SectionContentList from './sectionContentList.jsx';

export default {
    redux: {
        contentList
    },
    routes: [
        {
            path: '/user/list-content/edit/:contentListId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentListEditPage.jsx') })
        },
        // { path: '/news/item/:newsId', component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail.jsx') }) },
        // {
        //     path: '/user/list-content',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminContentListPage.jsx') })
        // }
    ],
    Section: {
        SectionContentList
    }
};
