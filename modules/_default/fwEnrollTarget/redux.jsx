import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const EnrollTargetGetAll = 'DepartmentGetAll';
const EnrollTargetGetPage = 'EnrollTargetGetPage';

export default function EnrollTargetReducer(state = {}, data) {
    switch (data.type) {
        case EnrollTargetGetAll:
            return Object.assign({}, state, { list: data.list });
        case EnrollTargetGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getEnrollTargetAll(searchText, done) {
    return dispatch => {
        const url = '/api/enroll-target/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả phòng ban bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: EnrollTargetGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả phòng ban bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageEnrollTarget', true);
export function getEnrollTargetPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageEnrollTarget', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/enroll-target/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng ban bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: EnrollTargetGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách phòng ban bị lỗi!', 'danger'));
    };
}

export function createEnrollTarget(data, done) {
    return dispatch => {
        const url = '/api/enroll-target';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo phòng ban bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo phòng ban thanh công!', 'success');
                done && done(data);
                dispatch(getEnrollTargetPage());
            }
        }, error => console.error(error) || T.notify('Tạo phòng ban bị lỗi!', 'danger'));
    };
}

export function updateEnrollTarget(_id, changes, done) {
    return dispatch => {
        const url = '/api/enroll-target';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật phòng ban bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phòng ban thanh công!', 'success');
                dispatch(getEnrollTargetPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật phòng ban bị lỗi!', 'danger'));
    };
}

export function deleteEnrollTarget(_id) {
    return dispatch => {
        const url = '/api/enroll-target';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa phòng ban bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa phòng ban thành công!', 'error', false, 800);
                dispatch(getEnrollTargetPage());
            }
        }, error => console.error(error) || T.notify('Xóa phòng ban bị lỗi!', 'danger'));
    };
}

export function exportReport(year) {
    T.download(T.url(`/api/enroll-target/export/${year}`));
}

export const ajaxSelectDepartment = T.createAjaxAdapter(
    '/api/enroll-target/page/1/20',
    params => ({searchText: params.term}),
    response => response && response.page && response.page.list ?
        response.page.list.map(department => ({ id: department._id, text: department.title })) : [],
);