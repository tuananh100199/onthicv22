import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const TeacherLocationGetAll = 'TeacherLocationGetAll';
const TeacherLocationGetPage = 'TeacherLocationGetPage';
const TeacherLocationGetItem = 'TeacherLocationGetItem';

export default function teacherLocationReducer(state = {}, data) {
    switch (data.type) {
        case TeacherLocationGetAll:
            return Object.assign({}, state, { list: data.list });
        case TeacherLocationGetPage:
            return Object.assign({}, state, { page: data.page });

        case TeacherLocationGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageTeacherLocation');
export function getTeacherLocationPage(pageNumber, pageSize, pageCondition,filter,sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('pageTeacherLocation', pageNumber, pageSize, pageCondition, filter, sort);
    return (dispatch) => {
        const url = `/api/teacher-location/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url,{ pageCondition:page.pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách định vị giáo viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: TeacherLocationGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách định vị giáo viên bị lỗi!', 'danger'));
    };
}

export function getTeacherLocationAll(condition,done) {
    return dispatch => {
        const url = '/api/teacher-location/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy định vị giáo viên bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: TeacherLocationGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy định vị giáo viên bị lỗi', 'danger'));
    };
}

export function getTeacherLocationRandom(condition,done) {
    return dispatch => {
        const url = '/api/teacher-location/random';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy định vị giáo viên bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: TeacherLocationGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy định vị giáo viên bị lỗi', 'danger'));
    };
}

export function getTeacherLocation(_id, done) {
    return dispatch => ajaxGetTeacherLocation(_id, data => {
        if (data.error) {
            T.notify('Lấy định vị giáo viên bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: TeacherLocationGetItem, item: data.item });
        }
    });
}

export function createTeacherLocation(data, done) {
    return dispatch => {
        const url = '/api/teacher-location';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo định vị giáo viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getTeacherLocationPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo định vị giáo viên bị lỗi!', 'danger'));
    };
}

export function updateTeacherLocation(_id, changes, done) {
    return dispatch => {
        const url = '/api/teacher-location';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin định vị giáo viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: TeacherLocationGetItem, item: data.item });
                dispatch(getTeacherLocationPage());
                T.notify('Cập nhật định vị giáo viên thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật định vị giáo viên bị lỗi!', 'danger'));
    };
}

export function swapTeacherLocation(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/teacher-location/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài định vị giáo viênbị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự bài định vị giáo viênthành công!', 'info');
                dispatch(getTeacherLocationPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự bài định vị giáo viênbị lỗi!', 'danger'));
    };
}

export function updateTeacherLocationDefault(diploma, done) {
    return dispatch => {
        const url = '/api/teacher-location/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin định vị giáo viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: TeacherLocationGetItem, item: data.item });
                dispatch(getTeacherLocationPage());
                T.notify('Cập nhật định vị giáo viên thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật định vị giáo viên bị lỗi!', 'danger'));
    };
}

export function deleteTeacherLocation(_id) {
    return dispatch => {
        const url = '/api/teacher-location';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa định vị giáo viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá định vị giáo viên thành công!', 'success');
                dispatch(getTeacherLocationPage());
            }
        }, error => console.error(error) || T.notify('Xóa định vị giáo viên bị lỗi!', 'danger'));
    };
}


export const ajaxSelectTeacherLocation = {
    ajax: true,
    url: '/api/teacher-location/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getTeacherLocation(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetTeacherLocation(_id, done) {
    const url = '/api/teacher-location';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy định vị giáo viên bị lỗi!', 'danger'));
}