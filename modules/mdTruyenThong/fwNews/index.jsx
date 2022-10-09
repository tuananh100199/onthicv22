//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import SectionNews from './sectionNews';
import SectionNewsList from './sectionNewsList';
import news from './redux';
export default {
    init: () => {
        T.component['all news'] = {
            render: (viewId) => <SectionNewsList viewId={viewId} />,
            text: 'Tất cả bài viết',
            backgroundColor: '#82b1ff',
        };
        T.component['last news'] = {
            render: (viewId) => <SectionNews viewId={viewId} />,
            text: 'Những điều cần biết',
            backgroundColor: '#d7ccc8',
        };
    },
    redux: {
        parent: 'communication',
        reducers: { news },
    },
    routes: [
        {
            path: '/user/category/news',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/news',
            component: Loadable({ loading: Loading, loader: () => import('./adminPage') })
        },
        {
            path: '/user/news/:_id',
            component: Loadable({ loading: Loading, loader: () => import('./adminEditPage') })
        },
        {
            path: '/news/:newsId',
            component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') })
        },
        {
            path: '/tintuc/:link',
            component: Loadable({ loading: Loading, loader: () => import('./homeNewsDetail') })
        },
        {
            path: '/news',
            component: Loadable({ loading: Loading, loader: () => import('./sectionNewsList') })
        },
    ],
    Section: {
        SectionNews, SectionNewsList,
    }
};