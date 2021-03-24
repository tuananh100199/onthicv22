import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const UserGetAll = 'UserGetAll';
const UserGetOne = 'UserGetOne';
const UserGetOneByEmail = 'UserGetOneByEmail';
const UserGetPage = 'UserGetPage';
const UserUpdate = 'UserUpdate';
const GET_STAFFS = 'User:GetStaffs';
const GET_STAFF_IN_PAGE = 'User:GetStaffPage';


export default function userReducer(state = null, data) {
    switch (data.type) {
        case UserGetAll:
            return Object.assign({}, state, { items: data.items });
        case UserGetOne:
            return Object.assign({}, state, { item: data.item });
        case UserGetOneByEmail:
            return Object.assign({}, state, { user: data.user });
        case GET_STAFFS:
            return Object.assign({}, state, { staffs: data.items });
        case UserGetPage:
            return Object.assign({}, state, { page: data.page });
        case GET_STAFF_IN_PAGE:
            return Object.assign({}, state, { staffPage: data.page });

        case UserUpdate:
            if (state) {
                let updatedItems = Object.assign({}, state.items),
                    updatedStaffs = Object.assign({}, state.staffs),
                    updatedPage = Object.assign({}, state.page),
                    updatedStaffPage = Object.assign({}, state.staffPage),
                    updatedItem = data.item;
                if (updatedItems) {
                    for (let i = 0, n = updatedItems.length; i < n; i++) {
                        if (updatedItems[i]._id == updatedItem._id) {
                            updatedItems.splice(i, 1, updatedItem);
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
                return Object.assign({}, state, { items: updatedItems, staffs: updatedStaffs, page: updatedPage, staffPage: updatedStaffPage });
            } else {
                return null;
            }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllUsers(done) {
    return dispatch => {
        const url = '/api/user/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách người dùng bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: UserGetAll, items: data.items });
            }
        }, error => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    }
}
export function getAllStaffs(done) {
    return dispatch => {
        const url = '/api/staff/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhân viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: GET_STAFFS, items: data.items });
            }
        }, error => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    }
}

const getPageUrl = (pageNumber, pageSize) => `/api/user/page/${pageNumber}/${pageSize}`;
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
        }, error => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
    }
}

export const ajaxSelectUser = {
    ajax: true,
    url: getPageUrl(1, 20),
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.lastname} ${item.firstname} (${item.email})` })) : []
    })
}

export function getUser(userId, done) {
    return dispatch => {
        ajaxGetUser(userId, data => {
            done && done(data);
            dispatch({ type: UserGetOne, item: data.user });
        });
    }
}

export function ajaxGetUser(userId, done) {
    const url = '/api/user/' + userId;
    T.get(url, data => {
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

export function ajaxGetUserByEmail(email, done) {
    const url = '/api/user-email/' + email;
    T.get(url, data => {
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

export function userGetByEmail(email, done) {
    return dispatch => {
        const url = '/api/user-search/' + email;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin người dùng bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.user);
                dispatch({ type: UserGetOneByEmail, item: data.user });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
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
        }, error => T.notify('Tạo người dùng bị lỗi!', 'danger'));
    }
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
        }, error => T.notify('Cập nhật thông tin người dùng bị lỗi!', 'danger'));
    }
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
        }, error => T.notify('Xóa người dùng bị lỗi!', 'danger'));
    }
}

export function changeUser(user) {
    return { type: UserUpdate, item: user };
}


export function userGetStaff(firstPartOfEmail, done) {
    return dispatch => {
        const url = '/api/user/personnel/item/' + firstPartOfEmail;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nhân viên bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                // dispatch({ type: GET_USERS, items: data.items });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}

export function userUpdateProfile(changes, done) {
    return dispatch => {
        const url = '/api/user/profile';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Error when update profile!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Update profile successfully!', 'info');
            }
            done && done(data);
        }, error => T.notify('Error when update profile!', 'danger'));
    }
}

export function switchUser(userId) {
    return dispatch => {
        const url = `/api/debug/switch-user`;
        T.post(url, { userId }, data => {
            if (data.error) {
                T.notify(data.error.message, 'danger');
            } else {
                T.cookie('userId', userId);
                location.reload();
            }
        }, () => T.notify('Switch user has some errors!', 'danger'));
    }
}