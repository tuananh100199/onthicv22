import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DivisionGet = 'DivisionGet';
const DivisionGetAll = 'DivisionGetAll';

export default function addressReducer(state = {}, data) {
    switch (data.type) {
        case DivisionGetAll:
            return Object.assign({}, state, { list: data.list });

        case DivisionGet: {
            return Object.assign({}, state, { item: data.item });
        }
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getDivisionAll(searchText, done) {
    return dispatch => {
        const url = '/api/division/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: DivisionGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả cơ sở bị lỗi!', 'danger'));
    };
}

export function getDivisionItem(_id, done) {
    return dispatch => ajaxGetDivision(_id, data => {
        if (data.error) {
            T.notify('Lấy cơ sở bị lỗi', 'danger');
            console.error('GET: getDivisionItem.', data.error);
        } else {
            dispatch({ type: DivisionGet, item: data.item });
        }
        done && done(data);
    });
}

export function createDivision(data, done) {
    return dispatch => {
        const url = '/api/division';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo cơ sở bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                if (done) done(data);
                dispatch(getDivisionAll());
            }
        }, error => console.error(error) || T.notify('Tạo cơ sở bị lỗi!', 'danger'));
    };
}

export function updateDivision(_id, changes, done) {
    return dispatch => {
        const url = '/api/division';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật cơ sở bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DivisionGet, item: data.item });
                dispatch(getDivisionAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật cơ sở bị lỗi!', 'danger'));
    };
}

export function deleteDivision(_id) {
    return dispatch => {
        const url = '/api/division';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa cơ sở bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa cơ sở thành công!', 'error', false, 800);
                dispatch(getDivisionAll());
            }
        }, error => console.error(error) || T.notify('Xóa cơ sở bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getAllDivisionByUser(done) {
    return dispatch => {
        const url = '/home/division/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách cơ sở bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: DivisionGetAll, list: data.list });
            }
            if (done) done(data);

        }, error => console.error(error) || T.notify('Lấy danh sách cơ sở bị lỗi', 'danger'));
    };
}

// AJAX ---------------------------------------------------------------------------------------------------------------
export const ajaxSelectDivision = T.createAjaxAdapter(
    '/api/division/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title + (item.isOutside ? ' (cơ sở ngoài)' : '') })) : []
);

export function ajaxGetDivision(_id, done) {
    const url = '/api/division';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy cơ sở đào tạo bị lỗi!', 'danger'));
}