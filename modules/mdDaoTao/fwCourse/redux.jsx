import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CourseGetPage = 'CourseGetPage';
const CourseGetItem = 'CourseGetItem';
const CourseGetPageByUser = 'CourseGetPageByUser';

export default function courseReducer(state = null, data) {
    switch (data.type) {
        case CourseGetPage:
            return Object.assign({}, state, { page: data.page });

        case CourseGetItem:
            return Object.assign({}, state, { item: data.item });

        case CourseGetPageByUser:
            if (state == null || state.userCondition != data.condition) {
                return Object.assign({}, state, { userCondition: data.condition, userPage: data.page });
            } else {
                const userPage = Object.assign({}, data.page);
                userPage.list = state.userPage && state.userPage.list ? state.userPage.list.slice() : [];
                let _ids = userPage.list.map(item => item._id);
                if (data.page && data.page.list && data.page.list.length > 0) {
                    data.page.list.forEach(item => {
                        if (_ids.indexOf(item._id) == -1) {
                            _ids.push(item._id);
                            userPage.list.push(item);
                        }
                    });
                }
                return Object.assign({}, state, { userPage });
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCourse');
export function getCoursePage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCourse', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getCourse(_id, done) {
    return dispatch => {
        const url = '/api/course';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: CourseGetItem, item: data.item });
            }
        }, error => T.notify('Lấy khóa học bị lỗi!', 'danger'));
    }
}

export function createCourse(newData, done) {
    return dispatch => {
        const url = '/api/course';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCoursePage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo khóa học bị lỗi!', 'danger'));
    }
}

export function updateCourse(_id, changes, done) {
    return dispatch => {
        const url = '/api/course';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin khóa học thành công!', 'info');
                dispatch({ type: CourseGetItem, item: data.item });
                dispatch(getCoursePage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin khóa học bị lỗi!', 'danger'));
    }
}

export function deleteCourse(_id) {
    return dispatch => {
        const url = '/api/course';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getCoursePage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getCoursePageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/course/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CourseGetPageByUser, page: data.page });
                done && done()
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getCourseByUser(courseId, courseLink, done) {
    return dispatch => {
        const url = courseId ? '/course/item/id/' + courseId : '/course/item/link/' + courseLink;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
            }
        }, error => T.notify('Lấy khóa học bị lỗi!', 'danger'));
    }
}

export function getCourseFeed(done) {
    return dispatch => {
        const url = '/course/page/1/' + T.courseFeedPageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.list);
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}