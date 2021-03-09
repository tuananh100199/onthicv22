import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DangKyTuVanListGetAll = 'DangKyTuVanList:GetAll';
const DangKyTuVanListGetPage = 'DangKyTuVanList:GetPage';
const DangKyTuVanListGetUnread = 'DangKyTuVanList:GetUnread';
const DangKyTuVanListAdd = 'DangKyTuVanList:Add';
const DangKyTuVanListUpdate = 'DangKyTuVanList:Update';

export default function DangKyTuVanListReducer(state = null, data) {
    switch (data.type) {
        case DangKyTuVanListGetAll:
            return Object.assign({}, state, { items: data.items });

        case DangKyTuVanListGetPage:
            return Object.assign({}, state, { page: data.page });

        case DangKyTuVanListGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case DangKyTuVanListAdd:
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

        case DangKyTuVanListUpdate: {
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
export function getDangKyTuVanListAll(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DangKyTuVanListGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

T.initCookiePage('pageDangKyTuVanList');
export function getDangKyTuVanListPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDangKyTuVanList', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DangKyTuVanListGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getDangKyTuVanListItem(dangKyTuVanId, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/' + dangKyTuVanId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: DangKyTuVanListUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function updateDangKyTuVanListItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký tư vấn thành công!', 'info');
                dispatch(getDangKyTuVanListPage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function deleteDangKyTuVanListItem(_id) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký tư vấn thành công!', 'error', false, 800);
                dispatch(getDangKyTuVanListPage());
            }
        }, error => T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function addDangKyTuVanList(item) {
    return { type: DangKyTuVanListAdd, item };
}
export function changeDangKyTuVanList(item) {
    return { type: DangKyTuVanListUpdate, item };
}

export function createDangKyTuVanListItem(dangKyTuVan, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van-list/item/';
        T.post(url, { dangKyTuVan}, data => {
            if (data.error) {
                T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function phanHoiDangKyTuVanListItem(_id, content, done) {
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
