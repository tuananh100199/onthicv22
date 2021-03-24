import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import { combineReducers } from 'redux';

import carousel, { ajaxSelectCarousel, ajaxGetCarousel } from './redux/reduxCarousel';
import content, { ajaxSelectContent, ajaxGetContent } from './redux/reduxContent';
import logo from './redux/reduxLogo';
import slogan from './redux/reduxSlogan';
import staffGroup from './redux/reduxStaffGroup';
import statistic from './redux/reduxStatistic';
import testimony from './redux/reduxTestimony';
import video, { ajaxSelectVideo, ajaxGetVideo } from './redux/reduxVideo';
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
        T.component['content'] = {
            render: (viewId) => <SectionContent viewId={viewId} />,
            backgroundColor: '#f48fb1',
            adapter: ajaxSelectContent,
            getItem: ajaxGetContent,
        };
        T.component['carousel'] = {
            render: (viewId) => <SectionCarousel viewId={viewId} />,
            backgroundColor: '#ef9a9a',
            adapter: ajaxSelectCarousel,
            getItem: ajaxGetCarousel,
        };
        // T.component['logo'] = {
        //     render: (viewId) => <SectionLogo viewId={viewId} />,
        //     backgroundColor: '#ef9a9a',
        // };
        // T.component['slogan'] = {
        //     render: (viewId) => <SectionSlogan viewId={viewId} />,
        //     backgroundColor: '#b2ebf2',
        // };
        // T.component['staff group'] = {
        //     render: (viewId) => <SectionStaffGroup viewId={viewId} />,
        //     backgroundColor: '#e6ee9c',
        // };
        // T.component['statistic'] = {
        //     render: (viewId) => <SectionStatistic viewId={viewId} />,
        //     backgroundColor: '#b388ff',
        // };
        // T.component['testimony'] = {
        //     render: (viewId) => <SectionTestimony viewId={viewId} />,
        //     backgroundColor: '#b2dfdb',
        // };
        T.component['video'] = {
            render: (viewId) => <SectionVideo viewId={viewId} />,
            backgroundColor: '#90caf9',
        };
        T.component['video'] = {
            render: (viewId) => <SectionVideo viewId={viewId} />,
            backgroundColor: '#f48fb1',
            adapter: ajaxSelectVideo,
            getItem: ajaxGetVideo,
        };
        T.component['list videos'] = {
            render: (viewId) => <SectionListVideo viewId={viewId} />,
            backgroundColor: '#ef9a9b',
        };
    },
    redux: {
        component: combineReducers({ carousel, content, logo, slogan, staffGroup, statistic, testimony, video, listVideo })
    },
    routes: [
        {
            path: '/user/component',
            component: Loadable({ loading: Loading, loader: () => import('./adminComponentPage') })
        },
        {
            path: '/content/:_id',
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
            path: '/request-login',
            component: Loadable({ loading: Loading, loader: () => import('./homeRequestLoginPage') })
        },
    ],
    Section: {
        SectionContent, SectionCarousel, SectionLogo, SectionSlogan, SectionStaffGroup, SectionStatistic, SectionTestimony, SectionVideo, SectionListVideo
    }
};
