import T from '../../../view/js/common';
T.initCookiePage('pageDangKyTuVan');

// Reducer ------------------------------------------------------------------------------------------------------------
const DangKyTuVanGetAll = 'DangKyTuVan:GetAll';
const DangKyTuVanUpdate = 'DangKyTuVan:Update';
const DangKyTuVanGetDangKyTuVanInPage = 'DangKyTuVan:GetDangKyTuVanInPage';
const DangKyTuVanGetDangKyTuVan = 'DangKyTuVan:GetDangKyTuVan';


export default function DangKyTuVanReducer(state = null, data) {
    switch (data.type) {
        case DangKyTuVanGetAll:
            return data.items;

        
        case DangKyTuVanUpdate:
            state = state.slice();
            for (let i = 0; i < state.length; i++) {
                if (state[i]._id == data.item._id) {
                    state[i] = data.item;
                    break;
                }
            }
            return state;
        case DangKyTuVanGetDangKyTuVanInPage:
            return Object.assign({}, state, { page: data.page });
        case DangKyTuVanGetDangKyTuVan:
            return Object.assign({}, state, { DangKyTuVan: data.item});

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDangKyTuVanInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDangKyTuVan', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/dang-ky-tu-van/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DangKyTuVanGetDangKyTuVanInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger'));
    }
}
export function getAllDangKyTuVan(done) {
    return dispatch => {
        const url = `/api/dang-ky-tu-van/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: DangKyTuVanGetAll, items: data.items ? data.items : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}



export function createDangKyTuVan(done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van/default';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo đăng ký tư vấn bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getDangKyTuVanInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function updateDangKyTuVan(_id, changes, done) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin đăng ký tư vấn bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin đăng ký tư vấn thành công!', 'info');
                dispatch(getDangKyTuVanInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin đăng ký tư vấn bị lỗi!', 'danger'));
    }
}


export function deleteDangKyTuVan(_id) {
    return dispatch => {
        const url = '/api/dang-ky-tu-van';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa đăng ký tư vấn bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('đăng ký tư vấn được xóa thành công!', 'error', false, 800);
                dispatch(getDangKyTuVanInPage());
            }
        }, error => T.notify('Xóa đăng ký tư vấn bị lỗi!', 'danger'));
    }
}

export function getDangKyTuVan(_id, done) {
    return (dispatch, getState) => {
        const url = '/dang-ky-tu-van/item/' + _id;
        const state = getState();
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy đăng ký tư vấn bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: DangKyTuVanGetDangKyTuVan, item: data.item});
            }
        }, error => done({ error }));
    }
}


// Actions (user) -----------------------------------------------------------------------------------------------------

export function getDangKyTuVanByUser(id, done) {
    return dispatch => {
        const url = '/dang-ky-tu-van/item/' + id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách nội dung bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DangKyTuVanUpdate, item: data.item });
                if (done) done({ item: data.item });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}
