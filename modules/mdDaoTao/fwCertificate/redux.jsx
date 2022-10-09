import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const Certificate = 'Certificate';
const CertificateGetAll = 'CertificateGetAll';
const CertificateGetPage = 'CertificateGetPage';
const CertificationGetPage = 'CertificatitonGetPage';
const LicenseGetPage = 'LicenseGetPage';

export default function certificateReducer(state = {}, data) {
    switch (data.type) {
        case CertificateGetAll:
            return Object.assign({}, state, { list: data.list });

        case Certificate: {
            return Object.assign({}, state, { item: data.item });
        }

        case CertificateGetPage:
            return Object.assign({}, state, { page: data.page });
        
        case CertificationGetPage:
            return Object.assign({}, state, { certificationPage: data.page });
        
        case LicenseGetPage:
            return Object.assign({}, state, { licensePage: data.page });

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
                // dispatch(getCertificatePage());
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật chứng chỉ bị lỗi!', 'danger'));
    };
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageCertification');
export function getCertificationPage(pageNumber, pageSize, condition, done) {
    const page = T.updatePage('pageCertification', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/certificate/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (condition) data.page.pageCondition = condition;
                done && done(data.page);
                dispatch({ type: CertificationGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger'));
    };
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageLicense');
export function getLicensePage(pageNumber, pageSize, pageCondition,filter,sort, done) {
    console.log({filter,sort});
    
    if(typeof sort=='function'){
        done = sort;
        sort = undefined;
    }else if(typeof filter == 'function'){
        done = filter;
        filter=undefined;
    }
    const page = T.updatePage('pageLicense', pageNumber, pageSize,pageCondition,filter,sort);
    return dispatch => {
        const url = `/api/license/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition:page.pageCondition,filter:page.filter,sort:page.sort }, data => {
            if (data.error) {
                T.notify('Lấy danh sách giấy phép lái xe bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                // if (condition) data.page.pageCondition = condition;
                done && done(data.page);
                dispatch({ type: LicenseGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách giấy phép lái xe bị lỗi!', 'danger'));
    };
}

export function exportFinalLicense(listStudents, done) {
    return () => {
        const url = '/api/certificate/license/export';
        T.get(url,{listStudents}, data => {
            if (data.error) {
                T.notify('Xuất file word bị lỗi!', 'danger');
                console.error(`GET: ${url}.`, data.error);
            } else {
                if (done) done(data);
                T.notify('Xuất file word thành công!', 'success');
            }
        }, error => console.error(error) || T.notify('Xuất file word bị lỗi!', 'danger'));
    };
}

export const ajaxSelectStudentPassLicense = T.createAjaxAdapter(
    '/api/license/page/1/20',
    params => ({condition: {searchText: params.term,isLicense:true}}),
    response => response && response.page && response.page.list ?
        response.page.list.map(student => ({ id: student._id, text: `${student.lastname} ${student.firstname}${student.identityCard?' ('+student.identityCard+')':''}` })) : [],
);