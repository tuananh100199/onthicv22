import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ForumGetAll = 'ForumGetAll';
const ForumGetPage = 'ForumGetPage';
const ForumGetUnread = 'ForumGetUnread';
const ForumAdd = 'ForumAdd';
const ForumUpdate = 'ForumUpdate';

export default function forumReducer(state = null, data) {
    switch (data.type) {
        case ForumGetAll:
            return Object.assign({}, state, { list: data.list });

        case ForumGetPage:
            return Object.assign({}, state, { page: data.page });

        case ForumGetUnread:
            return Object.assign({}, state, { unreads: data.list });

        case ForumAdd:
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

        case ForumUpdate: {
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
export function getForumAll(done) {
    return dispatch => {
        const url = '/api/forum/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tất cả liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: ForumGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả liên hệ bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageForum');
export function getForumPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageForum', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/forum/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách forum bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: ForumGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách forum bị lỗi!', 'danger'));
    };
}

export function getForum(forumId, done) {
    return dispatch => {
        const url = '/api/forum/item/' + forumId;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy liên hệ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: ForumUpdate, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy liên hệ bị lỗi!', 'danger'));
    };
}

export function getUnreadForums(done) {
    return dispatch => {
        const url = '/api/forum/unread';
        T.get(url, data => {
            if (data.error) {
                done && done(null, data.error);
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: ForumGetUnread, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách liên hệ bị lỗi!', 'danger'));
    };
}

export function createForum(data, done) {
    return dispatch => {
        const url = '/api/forum';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo forum bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                T.notify('Tạo forum thành công!', 'success');
                dispatch(getForumPage());
            }
        }, error => console.error(error) || T.notify('Tạo forum bị lỗi!', 'danger'));
    };
}

export function updateForum(_id, changes, done) {
    return dispatch => {
        const url = '/api/forum';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật liên hệ bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật liên hệ thành công!', 'info');
                dispatch(getForumPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật liên hệ bị lỗi', 'danger'));
    };
}

export function swapForum(_id, isMoveUp, done) {
    return dispatch => {
        const url = '/api/forum/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự forum bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự forum thành công!', 'success');
                dispatch(getForumPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự forum bị lỗi!', 'danger'));
    };
}

export function deleteForum(_id) {
    return dispatch => {
        const url = '/api/forum';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá liên hệ bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá liên hệ thành công!', 'error', false, 800);
                dispatch(getForumPage());
            }
        }, error => console.error(error) || T.notify('Xoá liên hệ bị lỗi', 'danger'));
    };
}

export function addForum(item) {
    return { type: ForumAdd, item };
}
export function changeForum(item) {
    return { type: ForumUpdate, item };
}

export function createForumByUser(forum, done) {
    return () => {
        const url = '/api/forum';
        T.post(url, { forum }, data => {
            if (data.error) {
                T.notify('Tạo forum bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('tạo forum bị lỗi!', 'danger'));
    };
}