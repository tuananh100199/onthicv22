import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------------------------------------
const ViPhamGetAll = 'ViPhamGetAll';
const ViPhamChange = 'ViPhamChange';
const ViPhamGet = 'ViPhamGet';


export default function viPhamReducer(state = {}, data) {
    switch (data.type) {
        case ViPhamGetAll:
            return Object.assign({}, state, { list: data.list });

        case ViPhamGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case ViPhamChange:
            state = Object.assign({}, state);
            for (let i = 0; i < state.list.length; i++) {
                if (state.list[i]._id == data.item._id) {
                    state.list[i] = data.item;
                    break;
                }
            }
            state.list.sort((a, b) => a.title.localeCompare(b.title));
            return state;

        default:
            return state;
    }
}

// ADMIN --------------------------------------------------------------------------------------------------------------------------------------------
export function getViPhamAll(condition, done) {
    return dispatch => {
        const url = '/api/viPham/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách viPham bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: ViPhamGetAll, list: data.list || [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getViPham(_id, done) {
    return dispatch => ajaxGetViPham(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy ViPham bị lỗi!', 'danger');
            console.error(`GET: getviPham. ${data.error}`);
        } else {
            dispatch({ type: ViPhamGet, item: data.item });
            done && done(data);
        }
    });
}
export function createViPham(data, done) {
    return dispatch => {
        const url = '/api/viPham';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo viPham bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getViPhamAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo ViPham bị lỗi!', 'danger'));
    };
}

export function updateViPham(_id, changes) {
    return dispatch => {
        const url = '/api/viPham';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin viPham bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin viPham thành công!', 'success');
                dispatch({ type: ViPhamChange, item: data.item });
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin ViPham bị lỗi!', 'danger'));
    };
}
export function changeViPham(viPham) {
    return { type: ViPhamChange, item: viPham };
}

export function deleteViPham(_id) {
    return dispatch => {
        const url = '/api/viPham';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa viPham bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('ViPham được xóa thành công!', 'error', false, 800);
                dispatch(getViPhamAll());
            }
        }, error => console.error(error) || T.notify('Xóa ViPham bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getViPhamAllByUser(condition, done) {
    return () => {
        const url = '/home/viPham/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách viPham bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy danh sách ViPham bị lỗi!', 'danger'));
    };
}
export function homeGetViPham(_id, done) {
    return dispatch => {
        const url = '/home/viPham';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách viPham bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: ViPhamGet, item: data.item });
                done && done({ item: data.item });
            }
        }, error => console.error('GET: ' + url + '. ' + error));
    };
}

export const ajaxSelectViPham = T.createAjaxAdapter(
    '/api/viPham/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetViPham(_id, done) {
    const url = '/api/viPham';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy nội dung bị lỗi!', 'danger'));
}
