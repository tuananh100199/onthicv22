import T from '../../view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const CourseTypeGetCourseTypeInPage = 'CourseType:GetCourseTypeInPage';
const CourseTypeGetCourseType = 'CourseType:GetCourseType';

export default function courseTypeReducer(state = null, data) {
    switch (data.type) {
        case CourseTypeGetCourseTypeInPage:
            return Object.assign({}, state, { page: data.page });

        case CourseTypeGetCourseType:
            return Object.assign({}, state, { courseType: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCourseType');
export function getCourseTypeInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCourseType', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/course-type/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseTypeGetCourseTypeInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getCourseType(_id, done) {
    return dispatch => {
        const url = '/api/course-type/edit/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: CourseTypeGetCourseType, item: data.item });
            }
        }, error => T.notify('Lấy khóa học bị lỗi!', 'danger'));
    }
}

export function createCourseType(done) {
    return dispatch => {
        const url = '/api/course-type';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCourseTypeInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo khóa học bị lỗi!', 'danger'));
    }
}

export function updateCourseType(_id, changes, done) {
    return dispatch => {
        const url = '/api/course-type';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khóa học thành công!', 'info');
                dispatch(getCourseTypeInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger'));
    }
}

export function deleteCourseType(_id) {
    return dispatch => {
        const url = '/api/course-type';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getCourseTypeInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}
//Home
export function getAllCourseTypeByUser(done) {
    return dispatch => {
        const url = '/course-type/all/';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: CourseTypeGetCourseTypeInPage, page: data.items });
            }
            if (done) done(data);

        }, error => T.notify('Lấy danh sách khóa học bị lỗi', 'danger'));
    }
}
