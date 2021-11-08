//TEMPLATES: admin
// eslint-disable-next-line no-unused-vars
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import registerCalendar from './redux';
import StudentView from './studentView';

export default {
    redux: {
        parent: 'trainning',
        reducers: { registerCalendar },
    },
    routes: [
        {
            path: '/user/hoc-vien/khoa-hoc/:_id/dang-ky-lich-hoc',
            component: Loadable({ loading: Loading, loader: () => import('./studentView') })
        }
    ,],
    Section: {
        StudentView
    }
};


export const RegisterCalendarStates = [
    { id: 'approved', text: 'Đã duyệt', color: '#1488db', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'waiting', text: 'Đang chờ duyệt', color: '#ffc107', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'reject', text: 'Từ chối', color: '#dc3545', className: 'btn btn-danger', icon: 'fa fa-lg fa-times' },
    { id: 'cancel', text: 'Hủy', color: '#6C757D', className: 'btn btn-danger', icon: 'fa fa-ban' },
];
export const RegisterCalendarStatesMapper = {};
RegisterCalendarStates.forEach(({ id, text, color }) => RegisterCalendarStatesMapper[id] = { text, color });

export const timeOffStates = [
    { id: 'morning', text: 'Buổi sáng', color: 'black', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'noon', text: 'Buổi chiều', color: 'black', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'allDay', text: 'Cả ngày', color: 'green', className: 'btn btn-success', icon: 'fa fa-lg fa-clock-o' },
];
export const timeOffStatesMapper = {};
timeOffStates.forEach(({ id, text, color }) => timeOffStatesMapper[id] = { text, color });

export const sectionHours = [
    { id: 1, startHour: 7, text: '7-8'},
    { id: 2, startHour: 8, text: '8-9'},
    { id: 3, startHour: 9, text: '9-10'},
    { id: 4, startHour: 10, text: '10-11'},
    { id: 5, startHour: 13, text: '13-14'},
    { id: 6, startHour: 14, text: '14-15'},
    { id: 7, startHour: 15, text: '15-16'},
    { id: 8, startHour: 16, text: '16-17'},
 ];