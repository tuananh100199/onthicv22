import T from 'view/js/common';

const SubjectGetPage = 'SubjectGetPage';
const SubjectGetItem = 'SubjectGetItem';

export default function subjectReducer(state = {}, data) {
    switch (data.type) {
        case SubjectGetPage:
            return Object.assign({}, state, { page: data.page });

        case SubjectGetItem: {
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
        }

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
                T.notify('Lấy danh sách môn học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: SubjectGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách môn học bị lỗi!', 'danger'));
    };
}

export function getSubjectAll(condition, done) {
    const url = '/api/subject/all';
    if (!done) {
        done = condition;
        condition = {};
    }
    T.get(url, { condition }, data => {
        if (data.error) {
            T.notify('Lấy tất cả môn học bị lỗi!', 'danger');
            console.error('GET: ' + url + '. ' + data.error);
        } else {
            done && done(data.list);
        }
    }, error => console.error(error) || T.notify('Lấy tất cả môn học bị lỗi!', 'danger'));
}

export function getSubject(_id, done) {
    return dispatch => {
        const url = '/api/subject';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy môn học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: SubjectGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy môn học bị lỗi!', 'danger'));
    };
}

export function getSubjectByStudent(_id, done) {
    return dispatch => {
        const url = '/api/subject/student';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy môn học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: SubjectGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy môn học bị lỗi!', 'danger'));
    };
}

export function createSubject(data, done) {
    return dispatch => {
        const url = '/api/subject';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo môn học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch(getSubjectPage());
            }
        }, error => console.error(error) || T.notify('Tạo môn học bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    };
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
        }, error => console.error(error) || T.notify('Xóa khóa học bị lỗi!', 'danger'));
    };
}

export function submitFeedback(subjectId, courseId, answers, done) {
    return () => {
        const url = '/api/subject/student/submit';
        T.post(url, { subjectId, courseId, answers }, data => {
            if (data.error) {
                T.notify('Kiểm tra đáp án bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.result);
            }
        }, error => console.error(error) || T.notify('Kiểm tra đáp án bị lỗi!', 'danger'));
    };
}

export function getRandomSubjectTest(subjectId, done) {
    return () => {
        const url = '/api/subject/random';
        T.get(url, { subjectId }, data => {
            if (data.error) {
                T.notify('Lấy bộ đề thi ngẫu nhiên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.driverTest);
            }
        }, error => console.error(error) || T.notify('Lấy bộ đề thi ngẫu nhiên bị lỗi!', 'danger'));
    };
}

export function createRandomSubjectTest(subjectId,courseId, done) {
    return () => {
        const url = '/api/subject/random';
        T.post(url, { subjectId, courseId }, data => {
            if (data.error) {
                T.notify('Tạo bộ đề thi ngẫu nhiên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo bộ đề thi ngẫu nhiên bị lỗi!', 'danger'));
    };
}

export function checkRandomSubjectTest( subjectId, courseId, answers, done) {
    return () => {
        const url = '/api/subject/random/submit';
        T.post(url, { subjectId, courseId, answers }, data => {
            if (data.error) {
                T.notify('Kiểm tra đáp án bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.result);
            }
        }, error => console.error(error) || T.notify('Kiểm tra đáp án bị lỗi!', 'danger'));
    };
}

export function resetStudentSubjectScore( subjectId, courseId, done) {
    return () => {
        const url = '/api/subject/random/reset';
        T.put(url, { subjectId, courseId }, data => {
            if (data.error) {
                T.notify('Làm lại câu hỏi ôn tập bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                done && done(data.result);
            }
        }, error => console.error(error) || T.notify('Làm lại câu hỏi ôn tập bị lỗi!', 'danger'));
    };
}

export const ajaxSelectSubject = T.createAjaxAdapter(
    '/api/subject/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : []
);

// Subject Lesson -------------------------------------------------------------------------------------------------------
export function addSubjectLesson(_subjectId, _subjectLessonId, done) {
    return dispatch => {
        const url = '/api/subject/lesson';
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
    };
}

export function swapSubjectLesson(_subjectId, _subjectLessonId, isMoveUp, done) {
    return dispatch => {
        const url = '/api/subject/lesson/swap';
        T.put(url, { _subjectId, _subjectLessonId, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { lessons: data.lessons } });
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    };
}

export function deleteSubjectLesson(_subjectId, _subjectLessonId, done) {
    return dispatch => {
        const url = '/api/subject/lesson';
        T.delete(url, { _subjectId, _subjectLessonId }, data => {
            if (data.error) {
                T.notify('Xóa bài học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch({ type: SubjectGetItem, item: { lessons: data.item.lessons } });
                done && done();
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}

// Subject Question ----------------------------------------------------------------------------------------------------
export function changeSubjectQuestions(data) {
    return { type: SubjectGetItem, item: { questions: data.questions } };
}