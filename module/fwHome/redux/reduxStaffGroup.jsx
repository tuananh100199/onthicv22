import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StaffGroupGetAll = 'StaffGroup:GetAll';
const StaffGroupUpdate = 'StaffGroup:Update';
const StaffGroupAddItem = 'StaffGroup:AddItem';
const StaffGroupUpdateItem = 'StaffGroup:UpdateItem';
const StaffGroupRemoveItem = 'StaffGroup:RemoveItem';
const StaffGroupSwapItems = 'StaffGroup:SwapItems';

export default function staffGroupReducer(state = null, data) {
    switch (data.type) {
        case StaffGroupGetAll:
            return Object.assign({}, state, { list: data.items });

        case StaffGroupAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.staff.push({
                    user: data.user,
                    content: data.content
                });
            }
            return state;

        case StaffGroupUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (data.index < state.item.staff.length) {
                    state.item.staff.splice(data.index, 1, {
                        user: data.user,
                        content: data.content
                    });
                }
            }
            return state;

        case StaffGroupRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                for (let i = 0, n = state.item.staff.length; i < n; i++) {
                    if (state.item.staff[i]._id == data.userId) {
                        state.item.staff.splice(i, 1);
                        break;
                    }
                }
            }
            return state;

        case StaffGroupUpdate:
            return Object.assign({}, state, { item: data.item });

        case StaffGroupSwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                for (let i = 0, n = state.item.staff.length; i < n; i++) {
                    let staff = state.item.staff[i];
                    if (staff._id == data.userId) {
                        if (data.isMoveUp && i > 0) {
                            state.item.staff.splice(i, 1);
                            state.item.staff.splice(i - 1, 0, staff);
                        } else if (!data.isMoveUp && i < n - 1) {
                            state.item.staff.splice(i, 1);
                            state.item.staff.splice(i + 1, 0, staff);
                        }
                        break;
                    }
                }
            }
            return state;

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllStaffGroups(done) {
    return dispatch => {
        const url = `/api/staff-group/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done(data.items);
                dispatch({ type: StaffGroupGetAll, items: data.items });
            }
        }, error => T.notify('Lấy danh sách nhóm nhân viên bị lỗi!', 'danger'));
    }
}

export function createStaffGroup(title, done) {
    return dispatch => {
        const url = `/api/staff-group`;
        T.post(url, { title }, data => {
            if (data.error) {
                T.notify('Tạo nhóm nhân viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getAllStaffGroups());
                if (done) done(data);
            }
        }, error => T.notify('Tạo nhóm nhân viên bị lỗi!', 'danger'));
    }
}

export function updateStaffGroup(_id, changes, done) {
    return dispatch => {
        const url = `/api/staff-group`;
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nhóm nhân viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nhóm nhân viên thành công!', 'info');
                dispatch(getAllStaffGroups());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin nhóm nhân viên bị lỗi!', 'danger'));
    }
}

export function deleteStaffGroup(_id) {
    return dispatch => {
        const url = `/api/staff-group`;
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa nhóm nhân viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('nhân viên được xóa thành công!', 'error', false, 800);
                dispatch(getAllStaffGroups());
            }
        }, error => T.notify('Xóa nhóm nhân viên bị lỗi!', 'danger'));
    }
}



export function getStaffGroupItem(staffGroupId, done) {
    return dispatch => {
        const url = `/api/staff-group/item/${staffGroupId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: StaffGroupUpdate, item: data.item });
            }
        }, error => T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger'));
    }
}

export function addStaffIntoGroup(userId, content, done) {
    return dispatch => {
        const url = `/api/staff/${userId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy thông tin nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done();
                dispatch({ type: StaffGroupAddItem, user: data.item, content });
            }
        }, () => T.notify('Lấy thông tin nhân viên bị lỗi!', 'danger'));
    }
}

export function updateStaffInGroup(index, userId, content, done) {
    return dispatch => {
        const url = `/api/staff/${userId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done();
                dispatch({ type: StaffGroupUpdateItem, index, user: data.item, content });
            }
        }, error => T.notify('Cập nhật thông tin nhân viên bị lỗi!', 'danger'));
    }
}

export function removeStaffFromGroup(userId) {
    return { type: StaffGroupRemoveItem, userId };
}

export function swapStaffInGroup(userId, isMoveUp) {
    return { type: StaffGroupSwapItems, userId, isMoveUp };
}

export function getStaffGroupItemByUser(staffGroupId, done) {
    return dispatch => {
        const url = `/home/staff-group/${staffGroupId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done({ item: data.item });
            }
        }, error => T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger'));
    }
}
