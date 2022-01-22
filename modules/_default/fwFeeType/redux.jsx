import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const FeeTypeGetAll = 'FeeTypeGetAll';
const FeeTypeGetPage = 'FeeTypeGetPage';

export default function feeTypeReducer(state = {}, data) {
    switch (data.type) {
        case FeeTypeGetAll:
            return Object.assign({}, state, { list: data.list });
            
        case FeeTypeGetPage:
            return Object.assign({}, state, { page: data.page });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageFeeType', true);
export function getFeeTypePage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageFeeType', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/fee-type/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại gói học phí bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.page);
                dispatch({ type: FeeTypeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách loại gói học phí bị lỗi!', 'danger'));
    };
}

export function getFeeTypeAll(done) {
    return dispatch => {
        const url = '/api/fee-type/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại gói học phí bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: FeeTypeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy loại gói học phí bị lỗi', 'danger'));
    };
}

export function createFeeType(data, done) {
    return dispatch => {
        const url = '/api/fee-type';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo loại gói học phí bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                T.notify('Tạo loại gói học phí thanh công!', 'success');
                done && done(data);
                dispatch(getFeeTypePage());
            }
        }, error => console.error(error) || T.notify('Tạo loại gói học phí bị lỗi!', 'danger'));
    };
}

export function updateFeeType(_id, changes, done) {
    return dispatch => {
        const url = '/api/fee-type';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật loại gói học phí bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật loại gói học phí thành công!', 'success');
                dispatch(getFeeTypePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật loại gói học phí bị lỗi!', 'danger'));
    };
}

export function deleteFeeType(_id) {
    return dispatch => {
        const url = '/api/fee-type';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa loại gói học phí bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa loại gói học phí thành công!', 'error', false, 800);
                dispatch(getFeeTypePage());
            }
        }, error => console.error(error) || T.notify('Xóa loại gói học phí bị lỗi!', 'danger'));
    };
}