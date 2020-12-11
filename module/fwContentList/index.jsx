import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import contentList from './redux.jsx';
import SectionAllContent from './sectionAllContent.jsx';
import SectionContent from './sectionContent.jsx';

export default {
    redux: {
        contentList
    },
    routes: [
        {
            path: '/user/list-content/edit/:listContentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentListEditPage.jsx') })
        },
        {
            path: '/content/item/:id',
            component: Loadable({ loading: Loading, loader: () => import('./homeContentDetail.jsx') })
        },
        // {
        //     path: '/user/list-content',
        //     component: Loadable({ loading: Loading, loader: () => import('./adminContentListPage.jsx') })
        // }
    ],
    Section: {
        SectionAllContent, SectionContent
    }
};
