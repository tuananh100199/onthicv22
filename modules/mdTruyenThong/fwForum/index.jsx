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
            path: '/user/category/forum', 
            component: Loadable({ loading: Loading, loader: () => import('./adminCategoryPage') })
        },
        {
            path: '/user/forum', 
            component: Loadable({ loading: Loading, loader: () => import('./forumCategoryPage') })
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

export const ForumStates = [
    { id: 'approved', text: 'Đã duyệt', color: '#1488db', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'waiting', text: 'Đang chờ duyệt', color: '#ffc107', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'reject', text: 'Từ chối', color: '#dc3545', className: 'btn btn-danger', icon: 'fa fa-lg fa-times' },
];
export const ForumActive = [
    { id: 'true', text: 'Bật', color: '#1488db', className: 'btn btn-success', icon: 'fa fa-lg fa-eye' },
    { id: 'false', text: 'Tắt', color: '#dc3545', className: 'btn btn-danger', icon: 'fa fa-lg fa-power-off' },
];
export const ForumStatesMapper = {};
ForumStates.forEach(({ id, text, color }) => ForumStatesMapper[id] = { text, color });

export const ForumActiveMapper = {};
ForumActive.forEach(({ id, text, color }) => ForumActiveMapper[id] = { text, color });

export class ForumButtons extends React.Component {
    render() {
        let { permission, isForumPage, state, onChangeState, active, onChangeActive, onEdit, onDelete } = this.props;
        if (!onChangeState) onChangeState = () => { };
        if (!onChangeActive) onChangeActive = () => { };
        return permission ?
            <div style={{ position: 'absolute', right: 12, top: -12 }}>
                {permission.forumOwner && isForumPage? // QTHT, QTKH, Giáo viên có quyền bật/tắt forum
                    <div className='btn-group btn-group-sm'>
                        {ForumActive.map((item, index) =>
                            <Tooltip key={index} placement='top' overlay={item.text}>
                                <a className={String(active) == item.id ? item.className : 'btn btn-secondary'} href='#' onClick={e => e.preventDefault() || !onChangeActive || onChangeActive(item.id)}>
                                    <i className={item.icon} />
                                </a>
                            </Tooltip>)}
                    </div>
                    : null}
                {permission.forumAdmin || !isForumPage && permission.forumOwner ? // trustLecturer == true thì được quyền chuyển, không tin cậy thì như một học viên binh thường không làm được gì
                    <div className='btn-group btn-group-sm' style={{ marginLeft: 6 }}>
                        {ForumStates.map((item, index) =>
                            <Tooltip key={index} placement='top' overlay={item.text}>
                                <a className={state == item.id ? item.className : 'btn btn-secondary'} href='#' onClick={e => e.preventDefault() || !onChangeState || onChangeState(item.id)}>
                                    <i className={item.icon} />
                                </a>
                            </Tooltip>)}
                    </div> : null}
                <div className='btn-group btn-group-sm' style={{ marginLeft: 6 }} >
                    {(permission.forumOwner || permission.messageOwner) ?
                        <Tooltip placement='top' overlay='Chỉnh sửa'>
                            <a className='btn btn-primary' href='#' onClick={e => e.preventDefault() || onEdit()}><i className='fa fa-lg fa-edit' /></a>
                        </Tooltip> : null}
                    {(permission.forumOwner || permission.messageOwner) ?
                        <Tooltip placement='top' overlay='Xoá'>
                            <a className='btn btn-danger' href='#' onClick={e => e.preventDefault() || onDelete()}><i className='fa fa-lg fa-trash' /></a>
                        </Tooltip> : null}
                </div>
            </div> : null;
    }
}