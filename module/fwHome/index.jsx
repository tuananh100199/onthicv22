import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';

import carousel from './redux/reduxCarousel';
import content from './redux/reduxContent';
import logo from './redux/reduxLogo';
import slogan from './redux/reduxSlogan';
import staffGroup from './redux/reduxStaffGroup';
import statistic from './redux/reduxStatistic';
import testimony from './redux/reduxTestimony';
import video from './redux/reduxVideo';
import listVideo from './redux/reduxListVideo';
import contentList from '../fwContentList/redux';

import SectionCarousel from './sectionCarousel';
import SectionLogo from './sectionLogo';
import SectionSlogan from './sectionSlogan';
import SectionStaffGroup from './sectionStaffGroup';
import SectionStatistic from './sectionStatistic';
import SectionTestimony from './sectionTestimony';
import SectionVideo from './sectionVideo';
import SectionListVideo from './sectionListVideo';
import SectionSubscribe from './sectionSubscribe';
export default {
    redux: {
        carousel, content, logo, slogan, staffGroup, statistic, testimony, video, listVideo, contentList
    },
    routes: [
        {
            path: '/content/item/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./homeContentDetail') })
        },
        {
            path: '/user/carousel/edit/:carouselId',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage') })
        },
        {
            path: '/user/content/edit/:contentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage') })
        },
        {
            path: '/user/list-content/edit/:listContentId',
            component: Loadable({ loading: Loading, loader: () => import('../fwContentList/adminContentListEditPage') })
        },
        {
            path: '/user/slogan/edit/:sloganId',
            component: Loadable({ loading: Loading, loader: () => import('./adminSloganEditPage') })
        },
        {
            path: '/user/staff-group/edit/:staffGroupId',
            component: Loadable({ loading: Loading, loader: () => import('./adminStaffGroupEditPage') })
        },
        {
            path: '/user/statistic/edit/:statisticId',
            component: Loadable({ loading: Loading, loader: () => import('./adminStatisticEditPage') })
        },
        {
            path: '/user/logo/edit/:logoId',
            component: Loadable({ loading: Loading, loader: () => import('./adminLogoEditPage') })
        },
        {
            path: '/user/testimony/edit/:testimonyId',
            component: Loadable({ loading: Loading, loader: () => import('./adminTestimonyEditPage') })
        },
        {
            path: '/user/list-video/edit/:listVideoId',
            component: Loadable({ loading: Loading, loader: () => import('./adminListVideoEditPage') })
        },
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage') })
        },
        {
            path: '/request-login',
            component: Loadable({ loading: Loading, loader: () => import('./homeRequestLoginPage') })
        }
    ],
    Section: {
        SectionCarousel, SectionLogo, SectionSlogan, SectionStaffGroup, SectionStatistic, SectionTestimony, SectionVideo, SectionListVideo, SectionSubscribe
    }
};
