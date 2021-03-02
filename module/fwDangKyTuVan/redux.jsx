import T from '../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DangKyTuVanGetAll = 'DangKyTuVan:GetAll';
const DangKyTuVanGetPage = 'DangKyTuVan:GetPage';
const DangKyTuVanGetUnread = 'DangKyTuVan:GetUnread';
const DangKyTuVanAdd = 'DangKyTuVan:Add';
const DangKyTuVanUpdate = 'DangKyTuVan:Update';

export default function DangKyTuVanReducer(state = null, data) {
    switch (data.type) {
        case DangKyTuVanGetAll:
            return Object.assign({}, state, { items: data.items });

        case DangKyTuVanGetPage:
            return Object.assign({}, state, { page: data.page });

        case DangKyTuVanGetUnread:
            return Object.assign({}, state, { unreads: data.items });

        case DangKyTuVanAdd:
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

        case DangKyTuVanUpdate: {
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
export function getDangKyTuVanAll(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DangKyTuVanGetAll, items: data.items });
            }
        }, error => T.notify('Lấy tất cả đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

T.initCookiePage('pageDangKyTuVan');
export function getDangKyTuVanPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDangKyTuVan', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/dang-ky-tu-van/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DangKyTuVanGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getDangKyTuVan(DangKyTuVanId, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/item/' + DangKyTuVanId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: DangKyTuVanUpdate, item: data.item });
            }
        }, error => T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getUnreadDangKyTuVans(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DangKyTuVanGetUnread, items: data.items });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function updateDangKyTuVan(_id, changes, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật đăng ký tư vấn thành công!', 'info');
                dispatch(getDangKyTuVanPage());
                done && done();
            }
        }, error => T.notify('Cập nhật đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function deleteDangKyTuVan(_id) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá đăng ký tư vấn thành công!', 'error', false, 800);
                dispatch(getDangKyTuVanPage());
            }
        }, error => T.notify('Xoá đăng ký tư vấn bị lỗi', 'danger'));
    }
}

export function addDangKyTuVan(item) {
    return { type: DangKyTuVanAdd, item };
}
export function changeDangKyTuVan(item) {
    return { type: DangKyTuVanUpdate, item };
}

export function createDangKyTuVan(DangKyTuVan, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.post(url, { DangKyTuVan }, data => {
            if (data.error) {
                T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => T.notify('Gửi đăng ký tư vấn bị lỗi!', 'danger'));
    }
}