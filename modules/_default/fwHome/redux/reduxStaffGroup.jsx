import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const StaffGroupGetAll = 'StaffGroup:GetAll';
const StaffGroupUpdate = 'StaffGroup:Update';

export default function staffGroupReducer(state = {}, data) {
    switch (data.type) {
        case StaffGroupGetAll:
            return Object.assign({}, state, { list: data.list });

        case StaffGroupUpdate:
            state = state && state.list ? state.list.slice() : { list: [] };
            for (let i = 0; i < state.length; i++) {
                if (state[i]._id == data.item._id) {
                    state[i] = data.item;
                    break;
                }
            }
            return state;

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getStaffGroupAll(done) {
    return dispatch => {
        const url = `/api/staff-group/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done(data.list);
                dispatch({ type: StaffGroupGetAll, list: data.list || [] });
            }
        }, error => console.error(`GET: ${url}. ${error}`))
    }
}

export function getStaffGroup(_id, done) {
    return dispatch => ajaxGetStaffGroup(_id, data => {
        if (data.error || !data.item) {
            T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
            console.error(`GET: ${url}. ${data.error}`);
        } else {
            dispatch(getStaffGroupAll());
            dispatch({ type: StaffGroupUpdate, item: data.item });
            done && done(data);
        }
    });
}

export function createStaffGroup(data, done) {
    return dispatch => {
        const url = `/api/staff-group`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo nhóm nhân viên bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getStaffGroupAll());
                if (done) done(data);
            }
        }, error => console.error(`POST: ${url}. ${error}`))
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
                dispatch(getStaffGroupAll());
                dispatch({ type: StaffGroupUpdate, item: data.item });
                done && done();
            }
        }, error => console.error(`PUT: ${url}. ${error}`))
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
                T.alert('Xóa nhóm nhân viên thành công!', 'error', false, 800);
                dispatch(getStaffGroupAll());
            }
        }, error => console.error(`DELETE: ${url}. ${error}`))
    }
}
//Home
export function getStaffGroupByUser(_id, done) {
    return () => {
        const url = `/home/staff-group/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm nhân viên bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (done) done({ item: data.item });
            }
        }, error => console.error(`GET: ${url}. ${error}`))
    }
}
export function ajaxGetStaffGroup(_id, done) {
    const url = `/api/staff-group`;
    T.get(url, { _id }, done, error => T.notify('Lấy  nhóm nhân viên bị lỗi!', 'danger'));
}