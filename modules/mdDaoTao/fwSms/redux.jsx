import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SmsGetPage = 'SmsGetPage';

export default function smsReducer(state = {}, data) {
    switch (data.type) {
        case SmsGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Sms Actions ----------------------------------------------------------------------------------------------------
T.initCookiePage('adminSms');
export function getSmsPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminSms', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/sms/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách SMS bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: SmsGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách SMS bị lỗi!', 'danger'));
    };
}
export function deleteSms(_id) {
    return dispatch => {
        const url = '/api/sms';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa SMS bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Sms được xóa thành công!', 'error', false, 800);
                dispatch(getSmsPage());
            }
        }, error => console.error(error) || T.notify('Xóa SMS bị lỗi!', 'danger'));
    };
}