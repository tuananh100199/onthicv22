//TEMPLATES: admin|home
// import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import forum from './redux';

export const ForumStates = [{ id: 'approved', text: 'Đã duyệt', color: '#1488db' }, { id: 'waiting', text: 'Đang chờ duyệt', color: '#28a745' }, { id: 'reject', text: 'Từ chối', color: '#dc3545' }];
export const ForumStatesMapper = {};
ForumStates.forEach(({ id, text, color }) => ForumStatesMapper[id] = { text, color });

export default {
    redux: {
        parent: 'communication',
        reducers: { forum },
    },
    routes: [
        {
            path: '/user/category/forum',
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/forum',
            component: Loadable({ loading: Loading, loader: () => import('./categoryPage') })
        },
        {
            path: '/user/forum/:_categoryId',
            component: Loadable({ loading: Loading, loader: () => import('./forumPage') })
        },
        {
            path: '/user/forum/message/:_forumId',
            component: Loadable({ loading: Loading, loader: () => import('./forumMessagePage') })
        },
    ],
};