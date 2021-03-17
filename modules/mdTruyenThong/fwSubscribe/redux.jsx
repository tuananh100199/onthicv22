import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SubscribeGetAll = 'Subscribe:GetAll';
const SubscribeGetPage = 'Subscribe:GetPage';
const SubscribeGetUnread = 'Subscribe:GetUnread';
const SubscribeAdd = 'Subscribe:Add';
const SubscribeUpdate = 'Subscribe:Update';

export default function subscribeReducer(state = null, data) {
    switch (data.type) {
        case SubscribeGetAll:
            return Object.assign({}, state, { items: data.items });

        case SubscribeGetPage:
            return Object.assign({}, state, { page: data.page });

        case SubscribeGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case SubscribeAdd:
            if (state) {
                let addedItems = Object.assign({}, state.items),
                    addedPage = Object.assign({}, state.page),
                    addedUnreads = Object.assign({}, state.unreads),
                    addedItem = data.item;
                if (addedItems) {
                    addedItems.splice(0, 0, addedItem);
                }
                if (addedPage && addedPage.pageNumber == 1) {
                    addedPage.list = addedPage.list.slice(0);
                    addedPage.list.splice(0, 0, addedItem);
                }
                if (addedItem && addedItem.read == false) {
                    addedUnreads.splice(0, 0, addedItem);
                }
                return Object.assign({}, state, { items: addedItems, page: addedPage, unreads: addedUnreads });
            } else {
                return state;
            }

        case SubscribeUpdate: {
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedPage = Object.assign({}, state.page),
                    updatedUnreads = Object.assign({}, state.unreads),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedPage) {
                    for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                        if (updatedPage.list[i]._id == updatedItem._id) {
                            updatedPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedUnreads) {
                    if (updatedItem.read) {
                        for (let i = 0, n = updatedUnreads.length; i < n; i++) {
                            if (updatedUnreads[i]._id == updatedItem._id) {
                                updatedUnreads.splice(i, 1);
                                break;
                            }
                        }
                    } else {
                        updatedPage.list.splice(0, 1, updatedItem);
                    }
                }
                return Object.assign({}, state, { items: updatedItems, page: updatedPage, unreads: updatedUnreads });
            } else {
                return state;
            }
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getSubscribeAll(done) {
    return dispatch => {
        const url = '/api/subscribe/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: SubscribeGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

T.initCookiePage('pageSubscribe');
export function getSubscribePage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageSubscribe', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/subscribe/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, {searchText}, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SubscribeGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function getSubscribe(subscribeId, done) {
    return dispatch => {
        const url = '/api/subscribe/item/' + subscribeId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: SubscribeUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function getUnreadSubscribes(done) {
    return dispatch => {
        const url = '/api/subscribe/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: SubscribeGetUnread, items: data.items });
            }
        }, error => T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger'));
    }
}

export function updateSubscribe(_id, changes, done) {
    return dispatch => {
        const url = '/api/subscribe';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký nhận tin bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký nhận tin thành công!', 'info');
                dispatch(getSubscribePage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký nhận tin bị lỗi', 'danger'));
    }
}

export function deleteSubscribe(_id) {
    return dispatch => {
        const url = '/api/subscribe';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký nhận tin bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký nhận tin thành công!', 'error', false, 800);
                dispatch(getSubscribePage());
            }
        }, error => T.notify('Xoá đăng ký nhận tin bị lỗi', 'danger'));
    }
}

export function addSubscribe(item) {
    return { type: SubscribeAdd, item };
}
export function changeSubscribe(item) {
    return { type: SubscribeUpdate, item };
}

export function createSubscribe(subscribe, done) {
    return dispatch => {
        const url = '/api/subscribe';
        T.post(url, { subscribe }, data => {
            if (data.error) {
                T.notify('Gửi đăng ký nhận tin bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Gửi đăng ký nhận tin bị lỗi!', 'danger'));
    }
}
export function exportSubscribeToExcel(done) {
    return dispatch => {
        T.download(T.url(`/api/subscribe/export`));
    }
}