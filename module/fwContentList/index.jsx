import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';
import contentList from './redux.jsx';
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
            path: '/content/item/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('../fwHome/homeContentDetail.jsx') })
        },
    ],
    Section: {
        SectionContent
    }
};
