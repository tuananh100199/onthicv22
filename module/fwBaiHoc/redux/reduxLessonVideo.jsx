import T from '../../../view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_LESSON_VIDEO_LIST = 'lessonVideo:getLessonVideoList';

export default function lessonVideoReducer(state = {}, data) {
    switch (data.type) {
        case GET_LESSON_VIDEO_LIST:
            return Object.assign({}, state, { lissLessonVideo: data.lessonVideo });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function getLessonVideoList(lessonId, done) {
    return dispatch => {
        const url = `/api/lesson-video/${lessonId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET_LESSON_VIDEO_LIST, lessonVideo: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}

export function createLessonVideo(_id, data, done) {
    return dispatch => {
        const url = `/api/lesson-video/${_id}`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo video bài giảng bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                console.log('tạo video ok ')
                dispatch(getLessonVideoList(_id));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateLessonVideo(_id, data, lessonId, done) {
    return dispatch => {
        const url = '/api/lesson-video';
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getLessonVideoList(lessonId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapLessonVideo(lessonId, data, done) {
    return dispatch => {
        const url = `/api/lesson-video/swap`;
        T.put(url, { lessonId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài giảng bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getLessonVideoList(formId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteLessonVideo(_id, data, lessonId, done) {
    return dispatch => {
        const url = `/api/lesson-video`;
        T.delete(url, { data, lessonId, _id }, data => {
            if (data.error) {
                T.notify('Xóa video bài giảng bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch(getLessonVideoList(lessonId));
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}
