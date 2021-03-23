import React from 'react';
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

import SectionContent from './sectionContent';
import SectionCarousel from './sectionCarousel';
import SectionLogo from './sectionLogo';
import SectionSlogan from './sectionSlogan';
import SectionStaffGroup from './sectionStaffGroup';
import SectionStatistic from './sectionStatistic';
import SectionTestimony from './sectionTestimony';
import SectionVideo from './sectionVideo';
import SectionListVideo from './sectionListVideo';

export default {
    init: () => {
        T.component['content'] = (viewId) => <SectionContent viewId={viewId} />;
        T.component['carousel'] = (viewId) => <SectionCarousel viewId={viewId} />;
        T.component['logo'] = (viewId) => <SectionLogo viewId={viewId} />;
        T.component['slogan'] = (viewId) => <SectionSlogan viewId={viewId} />;
        // T.component['carousel'] = (viewId) => <SectionStaffGroup viewId={viewId} />;
        T.component['statistic'] = (viewId) => <SectionStatistic viewId={viewId} />;
        T.component['testimony'] = (viewId) => <SectionTestimony viewId={viewId} />;
        T.component['video'] = (viewId) => <SectionVideo viewId={viewId} />;
        T.component['list videos'] = (viewId) => <SectionListVideo viewId={viewId} />;
    },
    redux: {
        carousel, content, logo, slogan, staffGroup, statistic, testimony, video, listVideo
    },
    routes: [
        {
            path: '/content/item/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./homeContentDetail') })
        },
        {
            path: '/user/carousel/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage') })
        },
        {
            path: '/user/content/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage') })
        },
        {
            path: '/user/slogan/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminSloganEditPage') })
        },
        {
            path: '/user/staff-group/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminStaffGroupEditPage') })
        },
        {
            path: '/user/statistic/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminStatisticEditPage') })
        },
        {
            path: '/user/logo/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminLogoEditPage') })
        },
        {
            path: '/user/testimony/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminTestimonyEditPage') })
        },
        {
            path: '/user/list-video/edit/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminListVideoEditPage') })
        },
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage') })
        },
        {
            path: '/request-login',
            component: Loadable({ loading: Loading, loader: () => import('./homeRequestLoginPage') })
        },
    ],
    Section: {
        SectionContent, SectionCarousel, SectionLogo, SectionSlogan, SectionStaffGroup, SectionStatistic, SectionTestimony, SectionVideo, SectionListVideo
    }
};
