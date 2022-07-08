import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DiscountCodeGetAll = 'DiscountCodeGetAll';
const DiscountCodeGetPage = 'DiscountCodeGetPage';
const DiscountCodeGetItem = 'DiscountCodeGetItem';

export default function courseTypeReducer(state = {}, data) {
    switch (data.type) {
        case DiscountCodeGetAll:
            return Object.assign({}, state, { list: data.list });
        case DiscountCodeGetPage:
            return Object.assign({}, state, { page: data.page });

        case DiscountCodeGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageDiscountCode');
export function getDiscountCodePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageDiscountCode', pageNumber, pageSize, pageCondition);
    return (dispatch) => {
        const url = `/api/discount-code/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url,{ pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảm giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DiscountCodeGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    };
}

export function getDiscountCodeAll(condition,done) {
    return dispatch => {
        const url = '/api/discount-code/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy giảm giá bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: DiscountCodeGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi', 'danger'));
    };
}

export function getDiscountCode(condition, done) {
    return dispatch => ajaxGetDiscountCode(condition, data => {
        if (data.error) {
            T.notify('Lấy giảm giá bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: DiscountCodeGetItem, item: data.item });
        }
    });
}

export function createDiscountCode(data, done) {
    return dispatch => {
        const url = '/api/discount-code';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo giảm giá bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getDiscountCodePage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo giảm giá bị lỗi!', 'danger'));
    };
}

export function updateDiscountCode(_id, changes, done) {
    return dispatch => {
        const url = '/api/discount-code';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin giảm giá bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DiscountCodeGetItem, item: data.item });
                dispatch(getDiscountCodePage());
                T.notify('Cập nhật giảm giá thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật giảm giá bị lỗi!', 'danger'));
    };
}

export function updateDiscountCodeDefault(discount, done) {
    return dispatch => {
        const url = '/api/discount-code/default';
        T.put(url, { discount }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin giảm giá bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DiscountCodeGetItem, item: data.item });
                dispatch(getDiscountCodePage());
                T.notify('Cập nhật giảm giá thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật giảm giá bị lỗi!', 'danger'));
    };
}

export function deleteDiscountCode(_id) {
    return dispatch => {
        const url = '/api/discount-code';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa giảm giá bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá giảm giá thành công!', 'success');
                dispatch(getDiscountCodePage());
            }
        }, error => console.error(error) || T.notify('Xóa giảm giá bị lỗi!', 'danger'));
    };
}

export function getDiscountCodeByUser(_id, done) {
    return dispatch => {
        const url = `/discount-code/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy giảm giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: DiscountCodeGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi!', 'danger'));
    };
}

export const ajaxSelectDiscountCode = {
    ajax: true,
    url: '/api/discount-code/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.name })) : []
    }),
    fetchOne: (_id, done) => getDiscountCode(_id, ({ item }) => done && done({ id: item._id, text: item.name }))
};

export function ajaxGetDiscountCode(condition, done) {
    const url = '/api/discount-code';
    T.get(url, { condition }, done, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi!', 'danger'));
}