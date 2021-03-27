import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const SubjectGetPage = 'SubjectGetPage';
const SubjectGetItem = 'SubjectGetItem';

export default function subjectReducer(state = {}, data) {
    switch (data.type) {
        case SubjectGetPage:
            return Object.assign({}, state, { page: data.page });

        case SubjectGetItem:
            let updatedPage = Object.assign({}, state.page || {}),
                updatedItem = Object.assign({}, state.item || {}, data.item);
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { item: updatedItem, page: updatedPage });

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
        const url = `/api/subject`;
        T.get(url, { _id }, data => {
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

export function addSubjectLesson(_subjectId, _subjectLessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson`;
        T.post(url, { _subjectId, _subjectLessonId }, data => {
            if (data.error) {
                T.notify('Thêm bài học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else if (data.check) {
                T.notify(data.check, 'danger');
            } else {
                dispatch({ type: SubjectGetItem, item: { lessons: data.lessons } });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}


export function swapSubjectLesson(_subjectId, _subjectLessonId, isMoveUp, done) {
    return dispatch => {
        const url = `/api/subject/lesson/swap`;
        T.put(url, { _subjectId, _subjectLessonId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { lessons: data.lessons } });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteSubjectLesson(_subjectId, _subjectLessonId, done) {
    return dispatch => {
        const url = `/api/subject/lesson`;
        T.delete(url, { _subjectId, _subjectLessonId }, data => {
            if (data.error) {
                T.notify('Xóa bài học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { lessons: data.item.lessons } });
                done && done();
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

export function createSubjectQuestion(_subjectId, data, done) {
    return dispatch => {
        const url = `/api/subject/question`;
        T.post(url, { _subjectId, data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { questions: data.questions } });
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateSubjectQuestion(_subjectId, _subjectQuestionId, data, done) {
    return dispatch => {
        const url = '/api/subject/question';
        T.put(url, { _subjectId, _subjectQuestionId, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Cập nhật câu hỏi thành công!', 'success');
                dispatch({ type: SubjectGetItem, item: { questions: data.questions } });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapSubjectQuestion(_subjectId, _subjectQuestionId, isMoveUp, done) {
    return dispatch => {
        const url = `/api/subject/question/swap`;
        T.put(url, { _subjectId, _subjectQuestionId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { questions: data.questions } });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteSubjectQuestion(_subjectQuestionId, _subjectId, done) {
    return dispatch => {
        const url = `/api/subject/question`;
        T.delete(url, { _subjectId, _subjectQuestionId }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xóa câu hỏi thành công!', 'success');
                dispatch({ type: SubjectGetItem, item: { questions: data.questions } });
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}