//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import registerCalendar from './redux';
import StudentView from './studentView';

export default {
    redux: {
        parent: 'trainning',
        reducers: { registerCalendar },
    },
    routes: [],
    Section: {
        StudentView
    }
};