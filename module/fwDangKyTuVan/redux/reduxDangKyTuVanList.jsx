import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DKTVListGetAll = 'DKTVList:GetAll';
const DKTVListGetPage = 'DKTVList:GetPage';
const DKTVListGetUnread = 'DKTVList:GetUnread';
const DKTVAdd = 'DKTVList:Add';
const DKTVUpdate = 'DKTVList:Update';

export default function DKTVListReducer(state = null, data) {
    switch (data.type) {
        case DKTVListGetAll:
            return Object.assign({}, state, { items: data.items });

        case DKTVListGetPage:
            return Object.assign({}, state, { page: data.page });

        case DKTVListGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case DKTVAdd:
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

        case DKTVUpdate: {
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
export function getDKTVListAll(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả đăng ký tư vấn lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DKTVListGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả đăng ký tư vấn lỗi!', 'danger'));
    }
}

T.initCookiePage('pageDKTVList');
export function getDKTVListPage(DKTVListId,pageNumber, pageSize, done) {
    const page = T.updatePage('pageDKTVList', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/page/' + page.pageNumber + '/' + page.pageSize + '/' + DKTVListId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DKTVListGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn lỗi!', 'danger'));
    }
}

export function getDKTVListItem(DKTVListId, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/' + DKTVListId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: DKTVUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getUnreadDKTVList(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DKTVListGetUnread, items: data.items });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function updateDKTVList(_id, changes, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký tư vấn thành công!', 'info');
                dispatch(getDKTVListPage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function deleteDKTVListItem(DKTVListId,_id) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký tư vấn thành công!', 'error', false, 800);
                dispatch(getDKTVListPage(DKTVListId));
            }
        }, error => T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function addDKTVList(item) {
    return { type: DKTVAdd, item };
}
export function changeDKTVList(item) {
    return { type: DKTVUpdate, item };
}

export function createDKTVListItem(dangKyTuVan, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/';
        T.post(url, {dangKyTuVan}, data => {
            if (data.error) {
                T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function phanHoiDKTVListItem(_id, content, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/response';
        T.post(url, { _id, content }, data => {
            if (data.error) {
                T.notify('Thao tác phản hồi bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            }
            done && done(data);
        }, error => T.notify('Gửi mail phản hồi bị lỗi!', 'danger'));
    }
}