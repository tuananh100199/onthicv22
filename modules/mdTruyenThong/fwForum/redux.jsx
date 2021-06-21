import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ForumGetPage = 'ForumGetPage';
const ForumGetItem = 'ForumGetItem';

export default function forumReducer(state = null, data) {
    switch (data.type) {
        case ForumGetPage:
            return Object.assign({}, state, { page: data.page });

        case ForumGetItem: {
            return Object.assign({}, state, { item: data.item });
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageForum');
export function getForumPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageForum', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/forum/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách forum bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch({ type: ForumGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách forum bị lỗi!', 'danger'));
    };
}

export function getForum(_id, done) {
    return dispatch => {
        const url = '/api/forum';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy forum bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: ForumGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy forum bị lỗi!', 'danger'));
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
                T.notify('Cập nhật forum bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật forum thành công!', 'success');
                dispatch({ type: ForumGetItem, item: data.item });
                dispatch(getForumPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật forum bị lỗi', 'danger'));
    };
}

export function deleteForum(_id) {
    return dispatch => {
        const url = '/api/forum';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa forum bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Forum được xóa thành công!', 'error', false, 800);
                dispatch(getForumPage());
            }
        }, error => console.error(error) || T.notify('Xóa forum bị lỗi!', 'danger'));
    };
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

// Message -------------------------------------------------------------------------------------------------------
export function addMessage(_id, messages, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.post(url, { _id, messages }, data => {
            if (data.error) {
                T.notify('Thêm bài viết bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật bài viết thành công!', 'success');
                dispatch({ type: ForumGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

export function updateMessage(_id, messages, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.put(url, { _id, messages }, data => {
            if (data.error) {
                T.notify('Cập nhật bài viết bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật bài viết thành công!', 'success');
                dispatch({ type: ForumGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Cập nhật bài viết bị lỗi', 'danger'));
    };
}

export function deleteMessage(_id, messageId, done) {
    return dispatch => {
        const url = '/api/forum/message';
        T.delete(url, { _id, messageId }, data => {
            if (data.error) {
                T.notify('Xóa bài viết bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xóa bài viết thành công!', 'success');
                dispatch({ type: ForumGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

