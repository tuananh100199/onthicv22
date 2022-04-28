import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const PaymentGetPage = 'PaymentGetPage';

export default function paymentReducer(state = {}, data) {
    switch (data.type) {
        case PaymentGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Payment Actions ----------------------------------------------------------------------------------------------------
T.initCookiePage('adminPayment');
export function getPaymentPage(pageNumber, pageSize, pageCondition, filter, sort, done) {
    if(typeof sort=='function'){
        done=sort;
        sort=undefined;
    }
    else if(typeof filter=='function'){
        done=filter;
        filter=undefined;
    }
    const page = T.updatePage('adminPayment', pageNumber, pageSize,pageCondition,filter,sort);
    return dispatch => {
        const url = `/api/payment/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách thu công nợ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: PaymentGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách thu công nợ bị lỗi!', 'danger'));
    };
}

export function importPayment(payments, done) {
    return dispatch => {
        const url = '/api/payment/import';
        T.post(url, { payments }, data => {
            if (data.error) {
                T.notify('Import doanh thu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Import doanh thu thành công!', 'success');
                dispatch(getPaymentPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Import doanh thu bị lỗi!', 'danger'));
    };
}

export function exportBankBaoCao(dataStart, dateEnd) {
    const page = T.updatePage('adminPayment');
    const url = `/api/payment/export/${page.pageNumber}/${page.pageSize}/${JSON.stringify(page.filter)}/${JSON.stringify(page.sort)}/${dataStart}/${dateEnd}`;
    T.download(T.url(url));
}