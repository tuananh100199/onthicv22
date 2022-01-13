import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DepartmentGetAll = 'DepartmentGetAll';
const DepartmentGetPage = 'DepartmentGetPage';

export default function departmentReducer(state = {}, data) {
    switch (data.type) {
        case DepartmentGetAll:
            return Object.assign({}, state, { list: data.list });
        case DepartmentGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDepartmentAll(searchText, done) {
    return dispatch => {
        const url = '/api/department/all';
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
                dispatch({ type: DepartmentGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả phòng ban bị lỗi!', 'danger'));
    };
}

T.initCookiePage('pageDepartment', true);
export function getDepartmentPage(pageNumber, pageSize, searchText, done) {
    const page = T.updatePage('pageDepartment', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/department/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy danh sách phòng ban bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DepartmentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách phòng ban bị lỗi!', 'danger'));
    };
}

export function createDepartment(data, done) {
    return dispatch => {
        const url = '/api/department';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo phòng ban bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo phòng ban thanh công!', 'success');
                done && done(data);
                dispatch(getDepartmentPage());
            }
        }, error => console.error(error) || T.notify('Tạo phòng ban bị lỗi!', 'danger'));
    };
}

export function updateDepartment(_id, changes, done) {
    return dispatch => {
        const url = '/api/department';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật phòng ban bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin phòng ban thanh công!', 'success');
                dispatch(getDepartmentPage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật phòng ban bị lỗi!', 'danger'));
    };
}

export function deleteDepartment(_id) {
    return dispatch => {
        const url = '/api/department';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa phòng ban bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa phòng ban thành công!', 'error', false, 800);
                dispatch(getDepartmentPage());
            }
        }, error => console.error(error) || T.notify('Xóa phòng ban bị lỗi!', 'danger'));
    };
}

export const ajaxSelectDepartment = T.createAjaxAdapter(
    '/api/department/page/1/20',
    params => ({searchText: params.term}),
    response => response && response.page && response.page.list ?
        response.page.list.map(department => ({ id: department._id, text: department.title })) : [],
);