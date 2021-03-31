import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import { combineReducers } from 'redux';

import carousel, { ajaxSelectCarousel, ajaxGetCarousel } from './redux/reduxCarousel';
import content, { ajaxSelectContent, ajaxGetContent } from './redux/reduxContent';
import listContent, { ajaxSelectListContent, ajaxGetListContent } from './redux/reduxListContent';
import staffGroup from './redux/reduxStaffGroup';
import statistic, { ajaxSelectStatistic, ajaxGetStatistic } from './redux/reduxStatistic';
import video, { ajaxSelectVideo, ajaxGetVideo } from './redux/reduxVideo';
import listVideo, { ajaxSelectListVideo, ajaxGetListVideo } from './redux/reduxListVideo';

import SectionListContent from './sectionListContent';
import SectionContent from './sectionContent';
import SectionCarousel from './sectionCarousel';
import SectionStaffGroup from './sectionStaffGroup';
import SectionStatistic from './sectionStatistic';
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
        T.component['list contents'] = {
            render: (viewId) => <SectionListContent viewId={viewId} />,
            backgroundColor: '#fb6094',
            adapter: ajaxSelectListContent,
            getItem: ajaxGetListContent,
        };
        T.component['carousel'] = {
            render: (viewId) => <SectionCarousel viewId={viewId} />,
            backgroundColor: '#ef9a9a',
            adapter: ajaxSelectCarousel,
            getItem: ajaxGetCarousel,
        };
        // T.component['staff group'] = {
        //     render: (viewId) => <SectionStaffGroup viewId={viewId} />,
        //     backgroundColor: '#e6ee9c',
        // };
        T.component['video'] = {
            render: (viewId) => <SectionVideo viewId={viewId} />,
            backgroundColor: '#90caf9',
            adapter: ajaxSelectVideo,
            getItem: ajaxGetVideo,
        };
        T.component['statistic'] = {
            render: (viewId) => <SectionStatistic viewId={viewId} />,
            backgroundColor: '#b388ff',
            adapter: ajaxSelectStatistic,
            getItem: ajaxGetStatistic,
        };
        T.component['list videos'] = {
            render: (viewId) => <SectionListVideo viewId={viewId} />,
            backgroundColor: '#ef9a9b',
            adapter: ajaxSelectListVideo,
            getItem: ajaxGetListVideo,
        };
    },
    redux: {
        component: combineReducers({ carousel, content, listContent, staffGroup, statistic, video, listVideo }),
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
            path: '/user/content/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentEditPage') })
        },
        {
            path: '/user/list-content/:_id',
            component: Loadable({ loading: Loading, loader: () => import('../fwHome/adminListContentEditPage') })
        },
        {
            path: '/user/carousel/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminCarouselEditPage') })
        },
        {
            path: '/user/staff-group/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminStaffGroupEditPage') })
        },
        {
            path: '/user/statistic/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminStatisticEditPage') })
        },
        {
            path: '/user/list-video/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminListVideoEditPage') })
        },
        {
            path: '/request-login',
            component: Loadable({ loading: Loading, loader: () => import('./homeRequestLoginPage') })
        },
    ],
    Section: {
        SectionContent, SectionListContent, SectionCarousel, SectionStaffGroup, SectionStatistic, SectionVideo, SectionListVideo
    }
};
