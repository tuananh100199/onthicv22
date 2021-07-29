import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StaffGroupGetAll = 'StaffGroup:GetAll';
const StaffGroupGet = 'StaffGroupGet';
const StaffGroupChange = 'StaffGroupChange';

export default function staffGroupReducer(state = {}, data) {
    switch (data.type) {
        case StaffGroupGetAll:
            return Object.assign({}, state, { list: data.list });

        case StaffGroupGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case StaffGroupChange: {
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.staffGroupId) {
                for (let i = 0, items = state.selectedItem.items, n = items.length; i < n; i++) {
                    if (items[i]._id == updatedItem._id) {
                        state.selectedItem.items.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return state;
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
// Staff Group
export function getStaffGroupAll(done) {
    return dispatch => {
        const url = '/api/staff-group/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: getStaffGroupAll. ${data.error}`);
            } else {
                done && done(data.list);
                dispatch({ type: StaffGroupGetAll, list: data.list || [] });
            }
        }, error => console.error(`GET: getStaffGroupAll. ${error}`));
    };
}

export function getStaffGroup(_id, done) {
    return dispatch => ajaxGetStaffGroup(_id, data => {
        if (data.error || !data.item) {
            T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
            console.error(`GET: getStaffGroup. ${data.error}`);
        } else {
            // dispatch(getStaffGroupAll());
            // dispatch({ type: StaffGroupUpdate, item: data.item });
            dispatch({ type: StaffGroupGet, item: data.item });
            done && done(data);
        }
    });
}

export function createStaffGroup(data, done) {
    return dispatch => {
        const url = '/api/staff-group';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nhóm nhân viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getStaffGroupAll());
                done && done(data);
            }
        }, error => console.error(`POST: ${url}. ${error}`));
    };
}

export function updateStaffGroup(_id, changes, done) {
    return dispatch => {
        const url = '/api/staff-group';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin nhóm nhân viên bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin nhóm nhân viên thành công!', 'info');
                dispatch(getStaffGroupAll());
                // dispatch({ type: StaffGroupUpdate, item: data.item });
                done && done();
            }
        }, error => console.error(`PUT: ${url}. ${error}`));
    };
}

export function deleteStaffGroup(_id) {
    return dispatch => {
        const url = '/api/staff-group';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa nhóm nhân viên bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa nhóm nhân viên thành công!', 'error', false, 800);
                dispatch(getStaffGroupAll());
            }
        }, error => console.error(`DELETE: ${url}. ${error}`));
    };
}
//Staff

export function createStaff(data, done) {
    return dispatch => {
        const url = '/api/staff';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nhân viên bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getStaffGroup(data.item.staffGroupId));
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo nhân viên bị lỗi!', 'danger'));
    };
}

export function updateStaff(_id, changes, done) {
    return dispatch => {
        const url = '/api/staff';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nhân viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật nhân viên thành công!', 'info');
                dispatch(getStaffGroup(data.item.staffGroupId));
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật nhân viên bị lỗi!', 'danger'));
    };
}

export function swapStaff(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/staff/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự nhân viên bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else if (data.item1) {
                T.notify('Thay đổi thứ tự nhân viên thành công!', 'info');
                dispatch(getStaffGroup(data.item1.staffGroupId));
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự nhân viên bị lỗi!', 'danger'));
    };
}

export function deleteStaff(_id) {
    return dispatch => {
        const url = '/api/staff';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá nhân viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('nhân viên được xóa thành công!', 'error', false, 800);
                dispatch(getStaffGroup(data.staffGroupId));
            }
        }, error => console.error(error) || T.notify('Xoá nhân viên bị lỗi!', 'danger'));
    };
}

export function deleteStaffImage(_id, done) {
    return dispatch => {
        const url = '/api/staff/image';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa hình bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa hình thành công!', 'error', false, 800);
                dispatch(getStaffGroup(data.item.staffGroupId));
                done && done();
            }
        }, error => console.error(error) || T.notify('Xóa hình bị lỗi!', 'danger'));
    };
}

export function changeStaff(item) {
    return { type: StaffGroupChange, item };
}

//Home

export function homeGetStaffGroup(_id, done) {
    return () => {
        const url = '/home/staff-group/';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
            }
        }, error => console.error(`GET: ${url}. ${error}`));
    };
}

export const ajaxSelectStaffGroup = T.createAjaxAdapter(
    '/api/staff-group/all',
    response => response && response.list ? response.list.filter(item => item.active).map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetStaffGroup(_id, done) {
    const url = '/api/staff-group';
    T.get(url, { _id }, done, () => T.notify('Lấy  nhóm nhân viên bị lỗi!', 'danger'));
}