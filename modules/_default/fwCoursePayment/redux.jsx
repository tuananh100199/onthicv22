import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const CoursePaymentGetAll = 'CoursePaymentGetAll';
const CoursePaymentGetPage = 'CoursePaymentGetPage';
const CoursePaymentGetItem = 'CoursePaymentGetItem';

export default function coursePaymentReducer(state = {}, data) {
    switch (data.type) {
        case CoursePaymentGetAll:
            return Object.assign({}, state, { list: data.list });
        case CoursePaymentGetPage:
            return Object.assign({}, state, { page: data.page });
        case CoursePaymentGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCoursePayment');
export function getCoursePaymentPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageCoursePayment', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/course-payment/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách số lần thanh toán bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CoursePaymentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách số số lần thanh toán bị lỗi!', 'danger'));
    };
}

export function getCoursePaymentAll(condition,done) {
    return dispatch => {
        const url = '/api/course-payment/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy số lần thanh toán học phí bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: CoursePaymentGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy số lần thanh toán học phí bị lỗi', 'danger'));
    };
}

export function getCoursePayment(_id, done) {
    return dispatch => ajaxGetCoursePayment(_id, data => {
        if (data.error) {
            T.notify('Lấy số lần thanh toán học phí bị lỗi!', 'danger');
            console.error('GET: getCoursePayment.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: CoursePaymentGetItem, item: data.item });
        }
    });
}

export function createCoursePayment(data, done) {
    return dispatch => {
        const url = '/api/course-payment';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo số lần thanh toán học phí bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getCoursePaymentPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo số lần thanh toán học phí bị lỗi!', 'danger'));
    };
}

export function updateCoursePayment(_id, changes, done) {
    return dispatch => {
        const url = '/api/course-payment';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin số lần thanh toán học phí bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch(getCoursePaymentPage());
                T.notify('Cập nhật số lần thanh toán học phí thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật số lần thanh toán học phí bị lỗi!', 'danger'));
    };
}

export function deleteCoursePayment(_id) {
    return dispatch => {
        const url = '/api/course-payment';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa số lần thanh toán học phí bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá số lần thanh toán học phí thành công!', 'success');
                dispatch(getCoursePaymentPage());
            }
        }, error => console.error(error) || T.notify('Xóa số lần thanh toán học phí bị lỗi!', 'danger'));
    };
}

export function ajaxGetCoursePayment(_id, done) {
    const url = '/api/course-payment';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy số lần thanh toán học phí bị lỗi!', 'danger'));
}

export const ajaxSelectCoursePayment = {
    ajax: true,
    url: '/api/course-payment/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getCoursePayment(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};