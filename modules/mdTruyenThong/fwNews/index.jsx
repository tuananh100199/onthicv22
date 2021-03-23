import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionNews from './sectionNews';
import SectionNewsList from './sectionNewsList';
import news from './redux';

export default {
    init: () => {
        T.component['all news'] = (viewId) => <SectionNewsList viewId={viewId} />;
        T.component['last news'] = (viewId) => <SectionNews viewId={viewId} />;
    },
    redux: {
        news,
    },
    routes: [
        {
            path: '/user/news/category',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/news/list',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/news/edit/:newsId',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/user/news/draft/edit/:draftId',
            component: Loadable({ loading: Loading, loader: () => import('./adminDraftEditPage') })
        },
        {
            path: '/user/news/draft',
            component: Loadable({ loading: Loading, loader: () => import('./adminWaitApprovalPage') })
        },
        {
            path: '/news/item/:newsId',
            component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') })
        },
        {
            path: '/tintuc/:link',
            component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') })
        },
    ],
    Section: {
        SectionNews, SectionNewsList,
    }
};