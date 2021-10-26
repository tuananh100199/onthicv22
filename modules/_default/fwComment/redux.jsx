import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CommentGetPage = 'CommentGetPage';

export default function commentReducer(state = null, data) {
    switch (data.type) {
        case CommentGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageComment');
export function getCommentPage(refParentId, refId, pageNumber, pageSize, done) {
    const page = T.updatePage('pageComment', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/comment/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { refParentId, refId }, data => {
            if (data.error) {
                T.notify('Lấy bình luận bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: CommentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy bình luận bị lỗi!', 'danger'));
    };
}

export function getCommentScope(_id, from, limit, done) {
    return () => {
        const url = `/api/comment/scope/${_id}/${from}/${limit}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy bình luận bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.replies);
            }
        }, error => console.error(error) || T.notify('Lấy bình luận bị lỗi!', 'danger'));
    };
}

export function createComment(_parentId, data, done) {
    return () => {
        const url = '/api/comment';
        T.post(url, { _parentId, data }, data => {
            if (data.error) {
                T.notify('Tạo bình luận mới bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Tạo bình luận mới bị lỗi!', 'danger'));
    };
}

export function updateComment(_id, changes, done) {
    return () => {
        const url = '/api/comment';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bình luận bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin bình luận bị lỗi!', 'danger'));
    };
}

export function approveComment(_id, state, done) {
    return () => {
        const url = '/api/comment-approval';
        T.put(url, { _id, state }, data => {
            if (data.error) {
                T.notify('Duyệt bình luận bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Duyệt bình luận bị lỗi!', 'danger'));
    };
}

export function deleteComment(comment, done) {
    return () => {
        const url = '/api/comment';
        T.delete(url, { data: comment }, data => {
            if (data.error) {
                T.notify('Xóa bình luận bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Bình luận được xóa thành công!', 'error', false, 800);
                done && done();
            }
        }, error => console.error(error) || T.notify('Xóa bình luận bị lỗi!', 'danger'));
    };
}