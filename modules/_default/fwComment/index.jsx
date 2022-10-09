//TEMPLATES: admin|home
// eslint-disable-next-line no-unused-vars
import React from 'react';
import comment from './redux';
import CommentSection from './CommentSection';

export default {
    redux: {
        parent: 'framework',
        reducers: { comment },
    },
    routes: [],
    Section: { CommentSection },
};