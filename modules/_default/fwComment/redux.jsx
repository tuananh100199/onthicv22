import T from 'view/js/common';

T.initPage('pageComment');

const texts = {
    vi: {
        getCommentFail: 'Lấy bình luận bị lỗi!',
        createNewCommentFail: 'Tạo bình luận mới bị lỗi!',
        updateCommentFail: 'Cập nhật thông tin bình luận bị lỗi!',
        updateCommentSuccessful: 'Cập nhật thông tin bình luận thành công!',
        deleteCommentFail: 'Xóa bình luận bị lỗi!',
        deleteCommentSuccessful: 'Bình luận được xóa thành công!'
    },
    en: {
        getCommentFail: 'Failed to retrieve comment!',
        createNewCommentFail: 'Failed to create new comment!',
        updateCommentFail: 'Failed to update comment information!',
        updateCommentSuccessful: 'Update comment information successfully!',
        deleteCommentFail: 'Failed to delete comment!',
        deleteCommentSuccessful: 'Delete comment successfully!'
    },
    kr: {
        getCommentFail: '시설을 검색하지 못했습니다!',
        createNewCommentFail: '새 시설을 만들지 못했습니다!',
        updateCommentFail: '시설 정보를 업데이트하지 못했습니다!',
        updateCommentSuccessful: '시설 정보 업데이트 성공!',
        deleteCommentFail: '시설을 삭제하지 못했습니다!',
        deleteCommentSuccessful: '시설을 삭제했습니다!'
    }
};

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
export function getCommentPage(refParentId, refId, pageNumber, pageSize, done) {
    const page = T.updatePage('pageComment', pageNumber, pageSize);
    return (dispatch) => {
        const language = T.language(texts);
        const url = `/api/comment/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { refParentId, refId }, data => {
            if (data.error) {
                T.notify(language.getCommentFail, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: CommentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify(language.getCommentFail, 'danger'));
    };
}

export function getCommentScope(_id, from, limit, done) {
    return () => {
        const language = T.language(texts);
        const url = `/api/comment/scope/${_id}/${from}/${limit}`;
        T.get(url, data => {
            if (data.error) {
                T.notify(language.getCommentFail, 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.replies);
            }
        }, error => console.error(error) || T.notify(language.getCommentFail, 'danger'));
    };
}

export function createComment(_parentId, data, done) {
    return () => {
        const language = T.language(texts);
        const url = '/api/comment';
        T.post(url, { _parentId, data }, data => {
            if (data.error) {
                T.notify(language.createNewCommentFail, 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify(language.createNewCommentFail, 'danger'));
    };
}

export function updateComment(_id, changes, done) {
    return () => {
        const language = T.language(texts);
        const url = '/api/comment';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify(language.updateCommentFail, 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify(language.updateCommentFail, 'danger'));
    };
}

export function deleteComment(comment, done) {
    return () => {
        const language = T.language(texts);
        const url = '/api/comment';
        T.delete(url, { data: comment }, data => {
            if (data.error) {
                T.notify(language.deleteCommentFail, 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert(language.deleteCommentSuccessful, 'error', false, 800);
                done && done();
            }
        }, error => console.error(error) || T.notify(language.deleteCommentFail, 'danger'));
    };
}