import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import contentList from './redux';
import SectionContent from './sectionContent';

export default {
    init: () => {
        T.component['list contents'] = (viewId) => <SectionContent viewId={viewId} />;
    },
    redux: {
        contentList
    },
    routes: [
        {
            path: '/user/list-content/edit/:listContentId',
            component: Loadable({ loading: Loading, loader: () => import('./adminContentListEditPage') })
        },
    ],
    Section: {
        SectionContent
    }
};
