import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const CourseGetCourseInPage = 'Course:GetCourseInPage';
const CourseGetCourse = 'Course:GetCourse';
const CourseGetCourseInPageByUser = 'Course:GetCourseInPageByUser';
const CourseGetCourseByUser = 'Course:GetCourseByUser';
const CourseGetCourseFeed = 'Course:GetCourseFeed';

export default function courseReducer(state = null, data) {
    switch (data.type) {
        case CourseGetCourseInPage:
            return Object.assign({}, state, { page: data.page });

        case CourseGetCourse:
            return Object.assign({}, state, { course: data.item });

        case CourseGetCourseInPageByUser:
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

        case CourseGetCourseByUser:
            return Object.assign({}, state, { userCourse: data.item });

        case CourseGetCourseFeed:
            return Object.assign({}, state, { courseFeed: data.list });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCourse');
export function getCourseInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCourse', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CourseGetCourseInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}

export function getCourse(_id, done) {
    return dispatch => {
        const url = '/api/course/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: CourseGetCourse, item: data.item });
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
                dispatch(getCourseInPage());
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
                dispatch({ type: CourseGetCourse, item: data.item });
                dispatch(getCourseInPage());
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
                dispatch(getCourseInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}

// Actions (user) -----------------------------------------------------------------------------------------------------
const texts = {
    getCourseInPageByUserError: 'Lấy danh sách khóa học bị lỗi!',
    getCourseByUserError: 'Lấy khóa học bị lỗi!',
    getCourseFeedError: 'Lấy new feed bị lỗi!',
};

export function getCourseInPageByUser(pageNumber, pageSize, done) {
    return dispatch => {
        const url = '/course/page/' + pageNumber + '/' + pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: CourseGetCourseInPageByUser, page: data.page });
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
                dispatch({ type: CourseGetCourseByUser, item: data.item });
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
                dispatch({ type: CourseGetCourseFeed, list: data.page.list });
            }
        }, error => T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    }
}