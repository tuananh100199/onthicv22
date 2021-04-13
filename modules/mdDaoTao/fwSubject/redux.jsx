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
T.initCookiePage('pageSubject', true);
export function getSubjectPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageSubject', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/subject/page/${page.pageNumber}/${page.pageSize}`;
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

export function createSubject(data, done) {
    return dispatch => {
        const url = '/api/subject';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch(getSubjectPage());
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
                dispatch(getSubjectPage());
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
                dispatch(getSubjectPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}

export const ajaxSelectSubject = T.createAjaxAdapter(
    `/api/subject/page/1/20`,
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : []
);

// Subject Lesson -------------------------------------------------------------------------------------------------------
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

// Subject Question ----------------------------------------------------------------------------------------------------
export function changeSubjectQuestions(data) {
    return { type: SubjectGetItem, item: { questions: data.questions } };
}