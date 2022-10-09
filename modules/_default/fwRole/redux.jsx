import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const RoleGetAll = 'Role:GetAll';
const RoleGetPage = 'Role:GetPage';
const RoleUpdate = 'Role:Update';

export default function roleReducer(state = null, data) {
    switch (data.type) {
        case RoleGetPage:
            return Object.assign({}, state, { page: data.page });

        case RoleGetAll:
            return Object.assign({}, state, { list: data.list });

        case RoleUpdate: {
            let updatedList = Object.assign({}, state.list),
                updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            if (updatedList) {
                for (let i = 0, n = updatedList.length; i < n; i++) {
                    if (updatedList[i]._id == updatedItem._id) {
                        updatedList.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { list: updatedList, page: updatedPage });
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('adminRole');

export function changeRole(role) {
    return () => {
        const url = '/api/debug/change-role';
        T.post(url, { role: role._id }, data => {
            if (data.error) {
                T.notify('Change debug role error!', 'danger');
            } else {
                T.cookie('debugRole', role.name);
                window.location = '/user';
            }
        }, () => T.notify('Change debug role error!', 'danger'));
    };
}

export function getRoleAll(done) {
    return dispatch => {
        const url = '/api/role/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách vai trò bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done();
                dispatch({ type: RoleGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách vai trò bị lỗi!', 'danger'));
    };
}

export function getRolePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminRole', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/role/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách vai trò bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RoleGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách vai trò bị lỗi!', 'danger'));
    };
}

export function createRole(role, done) {
    return dispatch => {
        const url = '/api/role';
        T.post(url, { role }, data => {
            if (data.error) {
                T.notify('Tạo vai trò bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getRolePage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo vai trò bị lỗi!', 'danger'));
    };
}

export function updateRole(_id, changes, done) {
    return dispatch => {
        const url = '/api/role';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin vai trò bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin vai trò thành công!', 'info');
                dispatch(getRolePage());
            }
            done && done(data.error);
        }, error => console.error(error) || T.notify('Cập nhật thông tin vai trò bị lỗi!', 'danger'));
    };
}

export function deleteRole(_id) {
    return dispatch => {
        const url = '/api/role';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa vai trò bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Vai trò được xóa thành công!', 'error', false, 800);
                dispatch(getRolePage());
            }
        }, error => console.error(error) || T.notify('Xóa vai trò bị lỗi!', 'danger'));
    };
}

export function getRole(_id, done) {
    return () => {
        const url = '/api/role';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin vai trò bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                T.alert('Lấy thông tin vai trò thành công!', 'error', false, 800);
            }
        }, error => console.error(error) || T.notify('Lấy thông tin vai trò bị lỗi', 'danger'));
    };
}