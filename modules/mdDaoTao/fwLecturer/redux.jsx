import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const LecturerGetPage = 'LecturerGetPage';
const LecturerGetItem = 'LecturerGetItem';
const LecturerGetPageByUser = 'LecturerGetPageByUser';

export default function lecturerReducer(state = {}, data) {
    switch (data.type) {
        case LecturerGetPage: {
            const newState = {};
            newState[data.lecturerType] = data.page;
            return Object.assign({}, state, newState);
        }

        case LecturerGetItem: {
            return Object.assign({}, state, { item: Object.assign({}, state.item || {}, data.item) });
        }

        case LecturerGetPageByUser:
            if (state.userCondition != data.condition) {
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
T.initCookiePage('pageLecturer');
export function getLecturerCoursePage(courseType, pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageLecturer', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/lecturer-course/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { courseType, pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách khóa học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: LecturerGetPage, courseType, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách khóa học bị lỗi!', 'danger'));
    };
}
