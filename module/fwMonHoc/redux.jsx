import T from '../../view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const MonHocGetMonHocInPage = 'MonHoc:GetMonHocInPage';
const MonHocGetMonHoc = 'MonHoc:GetMonHoc';
const MonHocGetBaiHocList = 'MonHoc:GetBaiHocList';

export default function MonHocReducer(state = null, data) {
    switch (data.type) {
        case MonHocGetMonHocInPage:
            return Object.assign({}, state, { page: data.page });

        case MonHocGetMonHoc:
            return Object.assign({}, state, { monhoc: data.item });
        case MonHocGetBaiHocList:
            return Object.assign({}, state, { listbaihoc: data.baihoc });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageMonHoc');
export function getMonHocInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageMonHoc', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/mon-hoc/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: MonHocGetMonHocInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    }
}

export function getMonHoc(_id, done) {
    return dispatch => {
        const url = '/api/mon-hoc/edit/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: MonHocGetMonHoc, item: data.item });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    }
}

export function createMonHoc(done) {
    return dispatch => {
        const url = '/api/mon-hoc';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getMonHocInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    }
}

export function updateMonHoc(_id, changes, done) {
    return dispatch => {
        const url = '/api/mon-hoc';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'info');
                dispatch(getMonHocInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    }
}

export function deleteMonHoc(_id) {
    return dispatch => {
        const url = '/api/mon-hoc';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getMonHocInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}
export function getLessonList(subjectId, done) {
    return dispatch => {
        const url = `/api/baihoc/${subjectId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách bài học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: MonHocGetBaiHocList, baihoc: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}
export function addLesson(subjectId, lessonId, done) {
    return dispatch => {
        const url = `/api/baihoc/add/${subjectId}`;
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
        const url = `/api/bai-hoc/swap`;
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
        const url = `/api/baihoc/delete/${subjectId}`;
        T.post(url, { lessonId }, data => {
            if (data.error) {
                T.notify('Xóa bài học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
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
    url: `/api/mon-hoc/page/:pageNumber/:pageSize`,
    data: {},
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: item.title })) : []
    })
}
