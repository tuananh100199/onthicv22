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
export function getPaymentPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminPayment', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/payment/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
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

export function exportBankBaoCao(dataStart, dateEnd) {
    T.download(T.url(`/api/payment/export/${dataStart}/${dateEnd}`));
}