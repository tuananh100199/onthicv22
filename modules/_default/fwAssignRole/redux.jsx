import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const AssignRoleGetAll = 'AssignRoleGetAll';
const AssignRoleGetPage = 'AssignRoleGetPage';
const AssignRoleGetItem = 'AssignRoleGetItem';

export default function assignRoleReducer(state = {}, data) {
    switch (data.type) {
        case AssignRoleGetAll:
            return Object.assign({}, state, { list: data.list });
        case AssignRoleGetPage:
            return Object.assign({}, state, { page: data.page });

        case AssignRoleGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageAssignRole');
export function getAssignRolePage(pageNumber, pageSize,pageCondition, done) {
    const page = T.updatePage('pageAssignRole', pageNumber, pageSize,pageCondition);
    return (dispatch) => {
        const url = `/api/assign-role/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhân sự bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: AssignRoleGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách nhân sự bị lỗi!', 'danger'));
    };
}

export function getAssignRoleAll(condition,done) {
    return dispatch => {
        const url = '/api/assign-role/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy nhân sự bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: AssignRoleGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy nhân sự bị lỗi', 'danger'));
    };
}

export function getAssignRole(_id, done) {
    return dispatch => ajaxGetAssignRole(_id, data => {
        if (data.error) {
            T.notify('Lấy nhân sự bị lỗi!', 'danger');
            console.error('GET: getAssignRole.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: AssignRoleGetItem, item: data.item });
        }
    });
}

export function createAssignRole(data, done) {
    return dispatch => {
        const url = '/api/assign-role';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nhân sự bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getAssignRolePage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo nhân sự bị lỗi!', 'danger'));
    };
}

export function updateAssignRole(_id, changes, done) {
    return dispatch => {
        const url = '/api/assign-role';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nhân sự bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: AssignRoleGetItem, item: data.item });
                dispatch(getAssignRolePage());
                T.notify('Cập nhật nhân sự thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật nhân sự bị lỗi!', 'danger'));
    };
}

export function deleteAssignRole(_id,done) {
    return dispatch => {
        const url = '/api/assign-role';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa nhân sự bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                done && done();
                T.notify('Xoá nhân sự thành công!', 'success');
                dispatch(getAssignRolePage());
            }
        }, error => console.error(error) || T.notify('Xóa nhân sự bị lỗi!', 'danger'));
    };
}

export function ajaxGetAssignRole(_id, done) {
    const url = '/api/assign-role';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy nhân sự bị lỗi!', 'danger'));
}