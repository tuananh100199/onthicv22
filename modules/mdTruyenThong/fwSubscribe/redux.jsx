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
            return Object.assign({}, state, { list: data.list });

        case SubscribeGetPage:
            return Object.assign({}, state, { page: data.page });

        case SubscribeGetUnread:
            return Object.assign({}, state, { unreads: data.list });

        case SubscribeAdd:
            if (state) {
                let addedList = Object.assign({}, state.list),
                    addedPage = Object.assign({}, state.page),
                    addedUnreads = Object.assign({}, state.unreads),
                    addedItem = data.item;
                if (addedList) {
                    addedList.splice(0, 0, addedItem);
                }
                if (addedPage && addedPage.pageNumber == 1) {
                    addedPage.list = addedPage.list.slice(0);
                    addedPage.list.splice(0, 0, addedItem);
                }
                if (addedItem && addedItem.read == false) {
                    addedUnreads.splice(0, 0, addedItem);
                }
                return Object.assign({}, state, { list: addedList, page: addedPage, unreads: addedUnreads });
            } else {
                return state;
            }

        case SubscribeUpdate: {
            if (state) {
                let updatedList = Object.assign({}, state.list),
                    updatedPage = Object.assign({}, state.page),
                    updatedUnreads = Object.assign({}, state.unreads),
                    updatedItem = data.item;
                if (updatedList) {
                    for (let i = 0, n = updatedList.length; i < n; i++) {
                        if (updatedList[i]._id == updatedItem._id) {
                            updatedList.splice(i, 1, updatedItem);
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
                return Object.assign({}, state, { list: updatedList, page: updatedPage, unreads: updatedUnreads });
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
                done && done(data.list);
                dispatch({ type: SubscribeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả đăng ký nhận tin bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageSubscribe');
export function getSubscribePage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageSubscribe', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/subscribe/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SubscribeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách đăng ký nhận tin bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Xoá đăng ký nhận tin bị lỗi', 'danger'));
    };
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
                dispatch({ type: SubscribeGetPage, page: data.page });
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Gửi đăng ký nhận tin bị lỗi!', 'danger'));
    };
}
export function exportSubscribeToExcel() {
    T.download(T.url('/api/subscribe/export'));
}