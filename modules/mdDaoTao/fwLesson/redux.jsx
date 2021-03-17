import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const LessonGetPage = 'LessonGetPage';
const LessonGetItem = 'LessonGetItem';
const LessonGetVideoItem = 'LessonGetVideoItem';
const LessonGetQuestionItem = 'LessonGetQuestionItem';

export default function LessonReducer(state = null, data) {
    switch (data.type) {
        case LessonGetPage:
            return Object.assign({}, state, { page: data.page });

        case LessonGetItem:
            return Object.assign({}, state, { lesson: data.item });

        case LessonGetVideoItem:
            return Object.assign({}, state, { listLessonVideo: data.lessonVideo });

        case LessonGetQuestionItem:
            return Object.assign({}, state, { questions: data.questions });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
const getPageUrl = (pageNumber, pageSize) => `/api/lesson/page/${pageNumber}/${pageSize}`;
T.initCookiePage('pageLesson', true);
export function getLessonInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageLesson', pageNumber, pageSize, pageCondition);
    if (page.pageCondition && typeof page.pageCondition == 'object') {
        page.pageCondition = JSON.stringify(page.pageCondition);
    }
    return (dispatch) => {
        ajaxGetLessonInPage(page.pageNumber, page.pageSize, page.pageCondition ? JSON.parse(page.pageCondition) : {}, page => {
            done && done(page);
            dispatch({ type: LessonGetPage, page });
        });
    }
}
export function ajaxGetLessonInPage(pageNumber, pageSize, pageCondition, done) {
    const url = getPageUrl(pageNumber, pageSize);
    T.get(url, { condition: pageCondition }, data => {
        if (data.error) {
            T.notify('Lấy danh sách bài học bị lỗi!', 'danger');
            console.error('GET: ' + url + '. ' + data.error);
        } else {
            if (pageCondition) data.page.pageCondition = pageCondition;
            done && done(data.page);
        }
    }, error => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
}
export function getLesson(_id, done) {
    return dispatch => {
        const url = '/api/lesson/edit/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: LessonGetItem, item: data.item });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    }
}

export function createLesson(done) {
    return dispatch => {
        const url = '/api/lesson';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getLessonInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    }
}

export function updateLesson(_id, changes, done) {
    return dispatch => {
        const url = '/api/lesson';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin bài học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin bài học thành công!', 'success');
                dispatch(getLessonInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin bài học bị lỗi!', 'danger'));
    }
}

export function deleteLesson(_id) {
    return dispatch => {
        const url = '/api/lesson';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getLessonInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}

export const ajaxSelectLesson = {
    ajax: true,
    url: getPageUrl(1, 100),
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.title}` })) : []
    })
}
// Lesson Video
export function getLessonVideoList(lessonId, done) {
    return dispatch => {
        const url = `/api/lesson/video/${lessonId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: LessonGetVideoItem, lessonVideo: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}

export function createLessonVideo(_id, data, done) {
    return dispatch => {
        const url = `/api/lesson/video/${_id}`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo video bài giảng bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getLessonVideoList(_id));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateLessonVideo(_id, data, lessonId, done) {
    return dispatch => {
        const url = '/api/lesson/video';
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
        const url = `/api/lesson/video/swap`;
        T.put(url, { lessonId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài giảng bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getLessonVideoList(lessonId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteLessonVideo(_id, data, lessonId, done) {
    return dispatch => {
        const url = `/api/lesson/video`;
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
export function getLessonVideo(_id, done) {
    return dispatch => {
        const url = '/api/lesson/video/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done(data.item);
            }
        }, error => T.notify('Lấy video bị lỗi!', 'danger'));
    }
}
// Lesson Question
export function getQuestionsList(lessonId, done) {
    return dispatch => {
        const url = `/api/lesson/question/${lessonId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: LessonGetQuestionItem, questions: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}

export function createQuestion(_id, data, done) {
    return dispatch => {
        const url = `/api/lesson/question/${_id}`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(_id));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateQuestion(_id, data, lessonId, done) {
    return dispatch => {
        const url = '/api/lesson/question';
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(lessonId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapQuestion(lessonId, data, done) {
    return dispatch => {
        const url = `/api/lesson/question/swap`;
        T.put(url, { lessonId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(lessonId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteQuestion(_id, data, lessonId, done) {
    return dispatch => {
        const url = `/api/lesson/question`;
        T.delete(url, { data, lessonId, _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(lessonId));
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}