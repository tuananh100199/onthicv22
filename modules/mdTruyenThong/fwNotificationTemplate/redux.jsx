import T from 'view/js/common';

const NotificationTemplateGetAll = 'NotificationTemplateGetAll';
const NotificationTemplateChange = 'NotificationTemplateChange';
const NotificationTemplateGetItem = 'NotificationTemplateGetItem';
export default function NotificationTemplateReducer(state = [], data) {
    switch (data.type) {
        case NotificationTemplateGetAll:
            return data.items;

        case NotificationTemplateGetItem:
            return Object.assign({}, state, { item: data.item });

        case NotificationTemplateChange: {
            let updateItemState = state.slice();
            for (let i = 0; i < updateItemState.length; i++) {
                if (updateItemState[i]._id == data.item._id) {
                    updateItemState[i] = data.item;
                    break;
                }
            }
            return updateItemState;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getNotificationTemplateAll(condition, done) {
    return dispatch => {
        const url = '/api/notification-template/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NotificationTemplateGetAll, items: data.items });
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy thông báo bị lỗi!', 'danger'));
    };
}

export function getNotificationTemplate(_id, done) {
    return dispatch => {
        const url = '/api/notification-template';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: NotificationTemplateGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Lấy thông báo bị lỗi!', 'danger'));
    };
}

export function createNotificationTemplate(data, done) {
    return dispatch => {
        const url = '/api/notification-template';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo thông báo bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật template thông báo thành công!', 'success');
                dispatch(getNotificationTemplateAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thông báo bị lỗi!', 'danger'));
    };
}

export function updateNotificationTemplate(_id, changes, done) {
    return dispatch => {
        const url = '/api/notification-template';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật template thông báo bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật template thông báo thành công!', 'success');
                dispatch(getNotificationTemplateAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật template thông báo bị lỗi!', 'danger'));
    };
}

export function deleteNotificationTemplate(_id) {
    return dispatch => {
        const url = '/api/notification-template';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa template thông báo bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Xóa template thông báo thành công!', 'error', false, 800);
                dispatch(getNotificationTemplateAll());
            }
        }, error => console.error(error) || T.notify('Xóa template thông báo bị lỗi!', 'danger'));
    };
}

