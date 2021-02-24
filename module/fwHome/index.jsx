import Loadable from 'react-loadable';
import Loading from '../../view/component/Loading.jsx';

import carousel from './redux/reduxCarousel.jsx';
import content from './redux/reduxContent.jsx';
import logo from './redux/reduxLogo.jsx';
import slogan from './redux/reduxSlogan.jsx';
import staffGroup from './redux/reduxStaffGroup.jsx';
import statistic from './redux/reduxStatistic.jsx';
import testimony from './redux/reduxTestimony.jsx';
import video from './redux/reduxVideo.jsx';
import listVideo from './redux/reduxListVideo.jsx';
import contentList from '../fwContentList/redux.jsx';
import address from '../fwAddress/redux.jsx';

import SectionCarousel from './sectionCarousel.jsx';
import SectionLogo from './sectionLogo.jsx';
import SectionSlogan from './sectionSlogan.jsx';
import SectionStaffGroup from './sectionStaffGroup.jsx';
import SectionStatistic from './sectionStatistic.jsx';
import SectionTestimony from './sectionTestimony.jsx';
import SectionVideo from './sectionVideo.jsx';
import SectionListVideo from './sectionListVideo.jsx';
import SectionSubscribe from './sectionSubscribe.jsx';


export default {
    redux: {
        carousel, content, logo, slogan, staffGroup, statistic, testimony, video, listVideo, contentList, address
    },
    routes: [
        {
            path: '/content/item/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./homeContentDetail.jsx') })
        },
        {
            path: '/user/carousel/edit/:carouselId',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage.jsx') })
        },
        {
            path: '/user/content/edit/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage.jsx') })
        },
        {
            path: '/user/list-content/edit/:listContentId',
            component: Loadable({ loading: Loading, loader: () => import('../fwContentList/adminContentListEditPage.jsx') })
        },
        {
            path: '/user/slogan/edit/:sloganId',
            component: Loadable({ loading: Loading, loader: () => import('./adminSloganEditPage.jsx') })
        },
        {
            path: '/user/staff-group/edit/:staffGroupId',
            component: Loadable({ loading: Loading, loader: () => import('./adminStaffGroupEditPage.jsx') })
        },
        {
            path: '/user/statistic/edit/:statisticId',
            component: Loadable({ loading: Loading, loader: () => import('./adminStatisticEditPage.jsx') })
        },
        {
            path: '/user/logo/edit/:logoId',
            component: Loadable({ loading: Loading, loader: () => import('./adminLogoEditPage.jsx') })
        },
        {
            path: '/user/testimony/edit/:testimonyId',
            component: Loadable({ loading: Loading, loader: () => import('./adminTestimonyEditPage.jsx') })
        },
        {
            path: '/user/list-video/edit/:listVideoId',
            component: Loadable({ loading: Loading, loader: () => import('./adminListVideoEditPage.jsx') })
        },
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage.jsx') })
        },
        {
            path: '/request-login',
            component: Loadable({ loading: Loading, loader: () => import('./homeRequestLoginPage.jsx') })
        }
    ],
    Section: {
        SectionCarousel, SectionLogo, SectionSlogan, SectionStaffGroup, SectionStatistic, SectionTestimony, SectionVideo, SectionListVideo, SectionSubscribe
    }
};
