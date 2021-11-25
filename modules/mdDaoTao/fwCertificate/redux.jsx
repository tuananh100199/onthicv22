import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const Certificate = 'Certificate';
const CertificateGetAll = 'CertificateGetAll';
const CertificateGetPage = 'CertificateGetPage';

export default function certificateReducer(state = {}, data) {
    switch (data.type) {
        case CertificateGetAll:
            return Object.assign({}, state, { list: data.list });

        case Certificate: {
            return Object.assign({}, state, { item: data.item });
        }

        case CertificateGetPage:
            return Object.assign({}, state, { page: data.page });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getCertificatePage(pageNumber, pageSize, condition, done) {
    return dispatch => {
        const url = `/api/certificate/page/${pageNumber}/${pageSize}`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (condition) data.page.pageCondition = condition;
                done && done(data.page);
                dispatch({ type: CertificateGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger'));
    };
}

export function getCertificateGetAll(searchText, done) {
    return dispatch => {
        const url = '/api/certificate/all';
        if (typeof searchText == 'function') {
            done = searchText;
            searchText = '';
        }
        T.get(url, { searchText }, data => {
            if (data.error) {
                T.notify('Lấy tất cả chứng chỉ bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: CertificateGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy tất cả chứng chỉ bị lỗi!', 'danger'));
    };
}

export function updateCertificate(_id, changes, done) {
    return dispatch => {
        const url = '/api/certificate';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                dispatch({ type: Certificate, item: data.item });
                T.notify('Cập nhật chứng chỉ thành công!', 'success');
                dispatch(getCertificatePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}