import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseTypeGetAll = 'CourseTypeGetAll';
const CourseTypeGetPage = 'CourseTypeGetPage';
const CourseTypeGetItem = 'CourseTypeGetItem';

export default function courseTypeReducer(state = {}, data) {
    switch (data.type) {
        case CourseTypeGetAll:
            return Object.assign({}, state, { list: data.list });
        case CourseTypeGetPage:
            return Object.assign({}, state, { page: data.page });

        case CourseTypeGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCourseType');
export function getCourseTypePage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCourseType', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/course-type/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseTypeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    };
}

export function getCourseTypeAll(done) {
    return dispatch => {
        const url = '/api/course-type/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: CourseTypeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy loại khóa học bị lỗi', 'danger'));
    };
}

export function getCourseType(_id, done) {
    return dispatch => ajaxGetCourseType(_id, data => {
        if (data.error) {
            T.notify('Lấy loại khóa học bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            if (done) done(data.item);
            dispatch({ type: CourseTypeGetItem, item: data.item });
        }
    });
}

export function createCourseType(data, done) {
    return dispatch => {
        const url = '/api/course-type';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCourseTypePage());
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    };
}

export function updateCourseType(_id, changes, done) {
    return dispatch => {
        const url = '/api/course-type';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin loại khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch(getCourseTypePage());
                T.notify('Cập nhật khóa học thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin loại khóa học bị lỗi!', 'danger'));
    };
}

export function deleteCourseType(_id) {
    return dispatch => {
        const url = '/api/course-type';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa loại khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá loại khóa học thành công!', 'success');
                dispatch(getCourseTypePage());
            }
        }, error => console.error(error) || T.notify('Xóa loại khóa học bị lỗi!', 'danger'));
    };
}

export function addCourseTypeSubject(_courseTypeId, _subjectId, done) {
    return dispatch => {
        const url = '/api/course-type/subject';
        T.post(url, { _courseTypeId, _subjectId }, data => {
            if (data.error) {
                T.notify('Thêm môn học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Môn học được thêm thành công!', 'success');
                dispatch({ type: CourseTypeGetItem, item: data.item });
                done && done(data.item);
            }
        }, error => console.error(error) || T.notify('Thêm môn học bị lỗi!', 'danger'));
    };
}
export function deleteCourseTypeSubject(_courseTypeId, _subjectId, done) {
    return dispatch => {
        const url = '/api/course-type/subject';
        T.delete(url, { _courseTypeId, _subjectId }, data => {
            if (data.error) {
                T.notify('Xóa môn học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Môn học được xoá thành công!', 'success');
                dispatch({ type: CourseTypeGetItem, item: data.item });
                done && done();
            }
        }, error => console.error(error) || T.notify('Xóa môn học bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllCourseTypeByUser(done) {
    return dispatch => {
        const url = '/home/course-type/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                // dispatch({ type: CourseTypeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy loại khóa học bị lỗi', 'danger'));
    };
}

export function getCourseTypeByUser(_id, done) {
    return dispatch => {
        const url = `/course-type/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: CourseTypeGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    };
}

// export const ajaxSelectCourseType = {
//     ajax: true,
//     url: '/api/course-type/all',
//     data: {},
//     processResults: response => ({
//         results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
//     })
// };

export const ajaxSelectCourseType = T.createAjaxAdapter(
    '/api/course-type/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetCourseType(_id, done) {
    const url = '/api/course-type';
    T.get(url, { _id }, done, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
}