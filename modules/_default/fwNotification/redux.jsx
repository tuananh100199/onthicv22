import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const NotificationGetPage = 'NotificationGetPage';
const NotificationUpdate = 'NotificationUpdate';

export default function notificationReducer(state = null, data) {
    switch (data.type) {
        case NotificationGetPage:
            return Object.assign({}, state, { page: data.page });

        case NotificationUpdate: {
            if (state) {
                let updatedPage = Object.assign({}, state.page),
                    updatedItem = data.item;
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { page: updatedPage });
            } else {
                return state;
            }
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageNotification');
export function getNotificationPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageNotification', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/notification/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách thông báo bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: NotificationGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách thông báo bị lỗi!', 'danger'));
    };
}

export function createNotification(notification, done) {
    return () => {
        const url = '/api/notification';
        T.post(url, { notification }, data => {
            if (data.error) {
                T.notify('Gửi thông báo bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Gửi thông báo bị lỗi!', 'danger'));
    };
}

export function updateNotification(_id, changes, done) {
    return dispatch => {
        const url = '/api/notification';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông báo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông báo thành công!', 'info');
                dispatch(getNotificationPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông báo bị lỗi', 'danger'));
    };
}

export function deleteNotification(_id) {
    return dispatch => {
        const url = '/api/notification';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá thông báo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá thông báo thành công!', 'error', false, 800);
                dispatch(getNotificationPage());
            }
        }, error => console.error(error) || T.notify('Xoá thông báo bị lỗi', 'danger'));
    };
}

export function changeNotification(item) {
    return { type: NotificationUpdate, item };
}