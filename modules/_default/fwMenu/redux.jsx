import T from 'view/js/common';

const MenuGetAll = 'Menu:GetAll';
export default function menuReducer(state = null, data) {
    switch (data.type) {
        case MenuGetAll:
            return data.items;

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAll() {
    return dispatch => {
        const url = '/api/menu/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: MenuGetAll, items: data.items });
            }
        }, error => console.error(error) || T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}

export function createMenu(_id, done) {
    return dispatch => {
        const url = '/api/menu';
        T.post(url, { _id }, data => {
            if (data.error) {
                T.notify('Tạo menu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getAll());
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo menu bị lỗi!', 'danger'));
    };
}

export function updateMenu(_id, changes, done) {
    return dispatch => {
        const url = '/api/menu';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật menu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                dispatch(getAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật menu bị lỗi!', 'danger'));
    };
}

export function updateMenuPriorities(changes) {
    return dispatch => {
        const url = '/api/menu/priorities/';
        T.put(url, { changes }, data => {
            if (data.error) {
                T.notify('Thay đổi vị trí menus bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật menu thành công!', 'success');
                dispatch(getAll());
            }
        }, error => console.error(error) || T.notify('Thay đổi vị trí menus bị lỗi!', 'danger'));
    };
}

export function deleteMenu(_id) {
    return dispatch => {
        const url = '/api/menu';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa menu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa menu thành công!', 'error', false, 800);
                dispatch(getAll());
            }
        }, error => console.error(error) || T.notify('Xóa menu bị lỗi!', 'danger'));
    };
}


export function getMenu(_id, done) {
    return () => {
        const url = '/api/menu';
        T.get(url, { _id }, data => done(data), error => done({ error }));
    };
}

export function createComponent(parentId, component, done) {
    return () => {
        const url = '/api/menu/component';
        T.post(url, { parentId, component }, data => {
            if (data.error) {
                T.notify('Tạo thành phần trang bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Tạo thành phần trang bị lỗi!', 'danger'));
    };
}

export function updateComponent(_id, changes, done) {
    return () => {
        const url = '/api/menu/component';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thành phần trang bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Cập nhật thành phần trang bị lỗi!', 'danger'));
    };
}

export function swapComponent(_id, isMoveUp, done) {
    return () => {
        const url = '/api/menu/component/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự thành phần trang bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Thay đổi thứ tự thành phần trang thành công!', 'info');
                done();
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự thành phần trang bị lỗi!', 'danger'));
    };
}

export function deleteComponent(_id, done) {
    return () => {
        const url = '/api/menu/component';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa thành phần trang bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                if (done) done(data);
            }
        }, error => console.error(error) || T.notify('Xóa thành phần trang bị lỗi!', 'danger'));
    };
}

export function getComponentViews(type, done) {
    return () => {
        const url = `/api/menu/component/type/${type}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy menu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy menu bị lỗi!', 'danger'));
    };
}