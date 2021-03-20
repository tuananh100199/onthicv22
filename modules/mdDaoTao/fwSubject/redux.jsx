import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const SubjectGetPage = 'SubjectGetPage';
const SubjectGetItem = 'SubjectGetItem';
const SubjectGetLessonItem = 'SubjectGetLessonItem';
const SubjectGetQuestionItem = 'SubjectGetQuestionItem';

export default function subjectReducer(state = null, data) {
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
export function getSubjectInPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageSubject', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/subject/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
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
        const url = `/api/subject/item/${_id}`;
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

export function createSubject(newData, done) {
    return dispatch => {
        const url = '/api/subject';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch(getSubjectInPage());
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

export function getSubjectLessonList(subjectId, done) {
    return dispatch => {
        const url = `/api/subject/lesson/${subjectId}`;
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
export function addSubjectLesson(subjectId, lessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson/${subjectId}`;
        T.post(url, { lessonId }, data => {
            if (data.error) {
                T.notify('Thêm bài học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch(getSubjectLessonList(subjectId));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}
export function swapSubjectLesson(_id, data, done) {
    return dispatch => {
        const url = `/api/subject/lesson/swap`;
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectLessonList(_id));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteSubjectLesson(subjectId, lessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson/${subjectId}`;
        T.delete(url, { lessonId }, data => {
            if (data.error) {
                T.notify('Xóa bài học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xóa bài học thành công!', 'success');
                dispatch(getSubjectLessonList(subjectId));
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

// Question
export function getSubjectQuestionList(subjectId, done) {
    return dispatch => {
        const url = `/api/subject/question/${subjectId}`;
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

export function createSubjectQuestion(_id, data, done) {
    return dispatch => {
        const url = `/api/subject/question/${_id}`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectQuestionList(_id));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateSubjectQuestion(_id, data, subjectId, done) {
    return dispatch => {
        const url = '/api/subject/question';
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectQuestionList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapSubjectQuestion(subjectId, data, done) {
    return dispatch => {
        const url = `/api/subject/question/swap`;
        T.put(url, { subjectId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectQuestionList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteSubjectQuestion(_id, subjectId, done) {
    return dispatch => {
        const url = `/api/subject/question`;
        T.delete(url, { subjectId, _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch(getSubjectQuestionList(subjectId));
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}