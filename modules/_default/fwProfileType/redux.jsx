import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const ProfileTypeGetAll = 'ProfileTypeGetAll';
const ProfileTypeGetPage = 'ProfileTypeGetPage';

export default function EnrollTargetReducer(state = {}, data) {
    switch (data.type) {
        case ProfileTypeGetAll:
            return Object.assign({}, state, { list: data.list });
        case ProfileTypeGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getProfileTypeAll(searchText, done) {
    return dispatch => {
        const url = '/api/profile-type/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: ProfileTypeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageProfileType', true);
export function getProfileTypePage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageProfileType', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/profile-type/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: ProfileTypeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function createProfileType(data, done) {
    return dispatch => {
        const url = '/api/profile-type';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo loại hồ sơ học viên thanh công!', 'success');
                done && done(data);
                dispatch(getProfileTypePage());
            }
        }, error => console.error(error) || T.notify('Tạo loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function updateProfileType(_id, changes, done) {
    return dispatch => {
        const url = '/api/profile-type';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin loại hồ sơ học viên thanh công!', 'success');
                dispatch(getProfileTypePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export function deleteProfileType(_id) {
    return dispatch => {
        const url = '/api/profile-type';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa loại hồ sơ học viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa loại hồ sơ học viên thành công!', 'error', false, 800);
                dispatch(getProfileTypePage());
            }
        }, error => console.error(error) || T.notify('Xóa loại hồ sơ học viên bị lỗi!', 'danger'));
    };
}

export const ajaxSelectProfileType = T.createAjaxAdapter(
    '/api/profile-type/page/1/20',
    params => ({searchText: params.term}),
    response => response && response.page && response.page.list ?
        response.page.list.map(item => ({ id: item._id, text: item.title })) : [],
);