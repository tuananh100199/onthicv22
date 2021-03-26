import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseTypeGetAll = 'CourseTypeGetAll';
const CourseTypeGetPage = 'CourseTypeGetPage';
const CourseTypeGetItem = 'CourseTypeGetItem';

export default function courseTypeReducer(state = null, data) {
    switch (data.type) {
        case CourseTypeGetAll:
            return Object.assign({}, state, { items: data.items });
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
export function getCourseTypeInPage(pageNumber, pageSize, done) {
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
        }, error => T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    }
}

export function getAllCourseType(done) {
    return dispatch => {
        const url = `/api/course-type/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: CourseTypeGetAll, items: data.items });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi', 'danger'));
    }
}

export function getCourseType(_id, done) {
    return dispatch => ajaxGetCourseType(_id, data => {
        if (data.error) {
            T.notify('Lấy loại khóa học bị lỗi!', 'danger');
            console.error('GET: ' + url + '.', data.error);
        } else {
            if (done) done(data.item);
            dispatch({ type: CourseTypeGetItem, item: data.item });
        }
    });
}

export function createCourseType(done) {
    return dispatch => {
        const url = `/api/course-type`;
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCourseTypeInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    }
}

export function updateCourseType(_id, changes, done) {
    return dispatch => {
        const url = `/api/course-type`;
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin loại khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: CourseTypeGetItem, item: data.item });
                dispatch(getCourseTypeInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin loại khóa học bị lỗi!', 'danger'));
    }
}

export function deleteCourseType(_id) {
    return dispatch => {
        const url = `/api/course-type`;
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

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllCourseTypeByUser(done) {
    return dispatch => {
        const url = `/home/course-type/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: CourseTypeGetAll, items: data.items });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi', 'danger'));
    }
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
        }, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    }
}

export const ajaxSelectCourseType = {
    ajax: true,
    url: '/api/course-type/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    })
};

export function ajaxGetCourseType(_id, done) {
    const url = '/api/course-type';
    T.get(url, { _id }, done, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
};