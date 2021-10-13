//TEMPLATES: admin
import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'view/component/Loading';
import Tooltip from 'rc-tooltip';
import forum from './redux';

export default {
    redux: {
        parent: 'communication',
        reducers: { forum },
    },
    routes: [
        {
            path: '/user/category/forum', //danh mục forum
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/forum', // Các danh mục forum admin
            component: Loadable({ loading: Loading, loader: () => import('./forumCategoryPage') })
        },
        {
            path: '/user/forum/:_categoryId', // Một danh mục forum có nhiều forum admin
            component: Loadable({ loading: Loading, loader: () => import('./forumPage') })
        },
        {
            path: '/user/forum/message/:_forumId', // Tin nhắn trong admin
            component: Loadable({ loading: Loading, loader: () => import('./forumMessagePage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_courseId/forum', // Các danh mục forum trong khóa học
            component: Loadable({ loading: Loading, loader: () => import('./forumCourseCategoryPage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_courseId/forum/:_categoryid', // Một danh mục forum có nhiều forum -> lọc theo course
            component: Loadable({ loading: Loading, loader: () => import('./forumCoursePage') })
        },
        {
            path: '/user/hoc-vien/khoa-hoc/:_courseId/forum/message/:_forumId', // Tin nhắn trong forum khóa học
            component: Loadable({ loading: Loading, loader: () => import('./forumCourseMessagePage') })
        },
    ],
};

export const ForumStates = [
    { id: 'approved', text: 'Đã duyệt', color: '#1488db', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'waiting', text: 'Đang chờ duyệt', color: '#ffc107', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'reject', text: 'Từ chối', color: '#dc3545', className: 'btn btn-danger', icon: 'fa fa-lg fa-times' },
];
export const ForumStatesMapper = {};
ForumStates.forEach(({ id, text, color }) => ForumStatesMapper[id] = { text, color });

export class ForumButtons extends React.Component {
    render() {
        let { permission, state, onChangeState, onEdit, onDelete } = this.props;
        if (!onChangeState) onChangeState = () => { };
        return permission ?
            <div style={{ position: 'absolute', right: 12, top: -12 }}>
                {permission.write ?
                    <div className='btn-group btn-group-sm'>
                        {ForumStates.map((item, index) =>
                            <Tooltip key={index} placement='top' overlay={item.text}>
                                <a className={state == item.id ? item.className : 'btn btn-secondary'} href='#' onClick={e => e.preventDefault() || !onChangeState || onChangeState(item.id)}>
                                    <i className={item.icon} />
                                </a>
                            </Tooltip>)}
                    </div> : null}
                <div className='btn-group btn-group-sm' style={{ marginLeft: 6 }} >
                    {permission.write || permission.owner ?
                        <Tooltip placement='top' overlay='Chỉnh sửa'>
                            <a className='btn btn-primary' href='#' onClick={e => e.preventDefault() || onEdit()}><i className='fa fa-lg fa-edit' /></a>
                        </Tooltip> : null}
                    {permission.write || permission.owner ?
                        <Tooltip placement='top' overlay='Xoá'>
                            <a className='btn btn-danger' href='#' onClick={e => e.preventDefault() || onDelete()}><i className='fa fa-lg fa-trash' /></a>
                        </Tooltip> : null}
                </div>
            </div> : null;
    }
}