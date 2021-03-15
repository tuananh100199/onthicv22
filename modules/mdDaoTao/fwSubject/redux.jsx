import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const SubjectGetPage = 'SubjectGetPage';
const SubjectGetItem = 'SubjectGetItem';
const SubjectGetLessonItem = 'SubjectGetLessonItem';
const SubjectGetQuestionItem = 'SubjectGetQuestionItem';

export default function SubjectReducer(state = null, data) {
    switch (data.type) {
        case SubjectGetPage:
            return Object.assign({}, state, { page: data.page });

        case SubjectGetItem:
            return Object.assign({}, state, { subject: data.item });

        case SubjectGetLessonItem:
            return Object.assign({}, state, { listLesson: data.lesson });

        case SubjectGetQuestionItem:
            return Object.assign({}, state, { questions: data.questions });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageSubject');
export function getSubjectInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageSubject', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/subject/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SubjectGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    }
}

export function getSubject(_id, done) {
    return dispatch => {
        const url = '/api/subject/edit/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: SubjectGetItem, item: data.item });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    }
}

export function createSubject(done) {
    return dispatch => {
        const url = '/api/subject';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    }
}

export function updateSubject(_id, changes, done) {
    return dispatch => {
        const url = '/api/subject';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
                dispatch(getSubjectInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    }
}

export function deleteSubject(_id) {
    return dispatch => {
        const url = '/api/subject';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getSubjectInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}
export function getLessonList(subjectId, done) {
    return dispatch => {
        const url = `/api/lesson/${subjectId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetLessonItem, lesson: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}
export function addLesson(subjectId, lessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson/add/${subjectId}`;
        T.post(url, { lessonId }, data => {
            if (data.error) {
                T.notify('Thêm bài học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch(getLessonList(subjectId));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function swapLesson(_id, data, done) {
    return dispatch => {
        const url = `/api/subject/lesson/swap`;
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getLessonList(_id));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteLesson(subjectId, lessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson/${subjectId}`;
        T.delete(url, { lessonId }, data => {
            if (data.error) {
                T.notify('Xóa bài học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xóa bài học thành công!', 'success');
                dispatch(getLessonList(subjectId));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export const ajaxSelectSubject = {
    ajax: true,
    url: `/api/subject/page/:pageNumber/:pageSize`,
    data: {},
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : []
    })
}
// Feedback Question
export function getQuestionsList(subjectId, done) {
    return dispatch => {
        const url = `/api/feedback-question/${subjectId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetQuestionItem, questions: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}

export function createQuestion(_id, data, done) {
    return dispatch => {
        const url = `/api/feedback-question/${_id}`;
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

export function updateQuestion(_id, data, subjectId, done) {
    return dispatch => {
        const url = '/api/feedback-question';
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapQuestion(subjectId, data, done) {
    return dispatch => {
        const url = `/api/feedback-question/swap`;
        T.put(url, { subjectId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteQuestion(_id, data, subjectId, done) {
    return dispatch => {
        const url = `/api/feedback-question`;
        T.delete(url, { data, subjectId, _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}
