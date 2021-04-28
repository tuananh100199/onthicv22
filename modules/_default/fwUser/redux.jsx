import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const UserGetPage = 'UserGetPage';
const UserUpdate = 'UserUpdate';
const StaffGetAll = 'StaffGetAll';
const StaffGetPage = 'StaffGetPage';

export default function userReducer(state = null, data) {
    switch (data.type) {
        case UserGetPage:
            return Object.assign({}, state, { page: data.page });
        case StaffGetAll:
            return Object.assign({}, state, { staffs: data.list });
        case StaffGetPage:
            return Object.assign({}, state, { staffPage: data.page });

        case UserUpdate:
            if (state) {
                let updatedList = Object.assign({}, state.list),
                    updatedStaffs = Object.assign({}, state.staffs),
                    updatedPage = Object.assign({}, state.page),
                    updatedStaffPage = Object.assign({}, state.staffPage),
                    updatedItem = data.item;
                if (updatedList) {
                    for (let i = 0, n = updatedList.length; i < n; i++) {
                        if (updatedList[i]._id == updatedItem._id) {
                            updatedList.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                if (updatedStaffs) {
                    for (let i = 0, n = updatedStaffs.length; i < n; i++) {
                        if (updatedStaffs[i]._id == updatedItem._id) {
                            updatedStaffs.splice(i, 1, updatedItem);
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
                if (updatedStaffPage.list) {
                    for (let i = 0, n = updatedStaffPage.list.length; i < n; i++) {
                        if (updatedStaffPage.list[i]._id == updatedItem._id) {
                            updatedStaffPage.list.splice(i, 1, updatedItem);
                            break;
                        }
                    }
                }
                return Object.assign({}, state, { list: updatedList, staffs: updatedStaffs, page: updatedPage, staffPage: updatedStaffPage });
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllStaffs(done) {
    return dispatch => {
        const url = '/api/staff/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhân viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: StaffGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    };
}

T.initCookiePage('adminUser', true);
export function getUserPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminUser', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/user/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition: pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách người dùng bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: UserGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    };
}

export function getUser(_id, done) {
    return () => ajaxGetUser(_id, data => {
        done && done(data);
        // dispatch({ type: UserGetItem, item: data.user });
    });
}

export function createUser(user, done) {
    return dispatch => {
        const url = '/api/user';
        T.post(url, { user }, data => {
            if (data.error) {
                T.notify('Tạo người dùng bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo người dùng thành công!', 'success');
                dispatch(getUserPage());
                done && done(data.user);
            }
        }, error => console.error(error) || T.notify('Tạo người dùng bị lỗi!', 'danger'));
    };
}

export function updateUser(_id, changes, done) {
    return dispatch => {
        const url = '/api/user';
        T.put(url, { _id, changes }, data => {
            if (data.error || data.user == null) {
                T.notify('Cập nhật thông tin người dùng bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin người dùng thành công!', 'success');
                dispatch(changeUser(data.user));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin người dùng bị lỗi!', 'danger'));
    };
}

export function deleteUser(_id, done) {
    return dispatch => {
        const url = '/api/user';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa người dùng bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Người dùng được xóa thành công!', 'error', false, 800);
                dispatch(getUserPage());
            }
            done && done();
        }, error => console.error(error) || T.notify('Xóa người dùng bị lỗi!', 'danger'));
    };
}

export function changeUser(user) {
    return { type: UserUpdate, item: user };
}

export function userUpdateProfile(changes, done) {
    return () => {
        const url = '/api/user/profile';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Error when update profile!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Update profile successfully!', 'info');
            }
            done && done(data);
        }, error => console.error(error) || T.notify('Error when update profile!', 'danger'));
    };
}

export function switchUser(_id) {
    return () => {
        const url = '/api/debug/switch-user';
        T.post(url, { _id }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
            } else {
                T.cookie('userId', _id);
                location.reload();
            }
        }, () => T.notify('Switch user has some errors!', 'danger'));
    };
}

// export const ajaxSelectUser = {
//     ajax: true,
//     url: `/api/user/page/1/20`,
//     data: params => ({ condition: params.term }),
//     processResults: response => ({
//         results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.lastname} ${item.firstname} (${item.email})` })) : [],
//     })
// };

export const ajaxSelectUser = T.createAjaxAdapter(
    '/api/user/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.lastname} ${item.firstname} (${item.email})` })) : [],
);

export const ajaxSelectUserType = (type) => T.createAjaxAdapter(
    '/api/user/page/1/20',
    params => ({ condition: params.term ? { searchText: params.term } : { type } }),
    response => response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.lastname} ${item.firstname} (${item.email})` })) : [],
);

export function ajaxGetUser(_id, done) {
    const url = '/api/user/';
    T.get(url, { _id }, data => {
        if (data.error) {
            T.notify('Lấy thông tin người dùng bị lỗi!', 'danger');
            console.error('GET: ' + url + '. ' + data.error);
        } else {
            done && done(data);
        }
    }, error => {
        console.error('GET: ' + url + '. ' + error);
    });
}