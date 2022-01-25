import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const DiscountGetAll = 'DiscountGetAll';
const DiscountGetPage = 'DiscountGetPage';
const DiscountGetItem = 'DiscountGetItem';

export default function courseTypeReducer(state = {}, data) {
    switch (data.type) {
        case DiscountGetAll:
            return Object.assign({}, state, { list: data.list });
        case DiscountGetPage:
            return Object.assign({}, state, { page: data.page });

        case DiscountGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageDiscount');
export function getDiscountPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageDiscount', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/discount/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách giảm giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: DiscountGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách loại khóa học bị lỗi!', 'danger'));
    };
}

export function getDiscountAll(done) {
    return dispatch => {
        const url = '/api/discount/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy giảm giá bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: DiscountGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi', 'danger'));
    };
}

export function getDiscount(_id, done) {
    return dispatch => ajaxGetDiscount(_id, data => {
        if (data.error) {
            T.notify('Lấy giảm giá bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: DiscountGetItem, item: data.item });
        }
    });
}

export function createDiscount(data, done) {
    return dispatch => {
        const url = '/api/discount';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo giảm giá bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getDiscountPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo giảm giá bị lỗi!', 'danger'));
    };
}

export function updateDiscount(_id, changes, done) {
    return dispatch => {
        const url = '/api/discount';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin giảm giá bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DiscountGetItem, item: data.item });
                dispatch(getDiscountPage());
                T.notify('Cập nhật giảm giá thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật giảm giá bị lỗi!', 'danger'));
    };
}

export function updateDiscountDefault(discount, done) {
    return dispatch => {
        const url = '/api/discount/default';
        T.put(url, { discount }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin giảm giá bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: DiscountGetItem, item: data.item });
                dispatch(getDiscountPage());
                T.notify('Cập nhật giảm giá thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật giảm giá bị lỗi!', 'danger'));
    };
}

export function deleteDiscount(_id) {
    return dispatch => {
        const url = '/api/discount';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa giảm giá bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá giảm giá thành công!', 'success');
                dispatch(getDiscountPage());
            }
        }, error => console.error(error) || T.notify('Xóa giảm giá bị lỗi!', 'danger'));
    };
}

export function getDiscountByUser(_id, done) {
    return dispatch => {
        const url = `/discount/${_id}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy giảm giá bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data);
                dispatch({ type: DiscountGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi!', 'danger'));
    };
}

export const ajaxSelectDiscount = {
    ajax: true,
    url: '/api/discount/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.name })) : []
    }),
    fetchOne: (_id, done) => getDiscount(_id, ({ item }) => done && done({ id: item._id, text: item.name }))
};

export function ajaxGetDiscount(_id, done) {
    const url = '/api/discount';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy giảm giá bị lỗi!', 'danger'));
}