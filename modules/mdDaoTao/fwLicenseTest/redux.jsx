import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const LicenseTestGetAll = 'LicenseTestGetAll';
const LicenseTestGetPage = 'LicenseTestGetPage';
const LicenseTestGetItem = 'LicenseTestGetItem';

export default function licenseTestReducer(state = {}, data) {
    switch (data.type) {
        case LicenseTestGetAll:
            return Object.assign({}, state, { list: data.list });
        case LicenseTestGetPage:
            return Object.assign({}, state, { page: data.page });

        case LicenseTestGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageLicenseTest');
export function getLicenseTestPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageLicenseTest', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/teacher-diploma/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: LicenseTestGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách chứng chỉ bị lỗi!', 'danger'));
    };
}

export function getLicenseTestAll(condition,done) {
    return dispatch => {
        const url = '/api/teacher-diploma/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy kỳ sát hạch bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: LicenseTestGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy kỳ sát hạch bị lỗi', 'danger'));
    };
}

export function getLicenseTest(_id, done) {
    return dispatch => ajaxGetLicenseTest(_id, data => {
        if (data.error) {
            T.notify('Lấy kỳ sát hạch bị lỗi!', 'danger');
            console.error('GET: getLicenseTest.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: LicenseTestGetItem, item: data.item });
        }
    });
}

export function createLicenseTest(data, done) {
    return dispatch => {
        const url = '/api/teacher-diploma';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo kỳ sát hạch bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getLicenseTestPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo kỳ sát hạch bị lỗi!', 'danger'));
    };
}

export function updateLicenseTest(_id, changes, done) {
    return dispatch => {
        const url = '/api/teacher-diploma';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật kỳ sát hạch bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: LicenseTestGetItem, item: data.item });
                dispatch(getLicenseTestPage());
                T.notify('Cập nhật kỳ sát hạch thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật kỳ sát hạch bị lỗi!', 'danger'));
    };
}

export function deleteLicenseTest(_id) {
    return dispatch => {
        const url = '/api/license-test';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa kỳ sát hạch bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá kỳ sát hạch thành công!', 'success');
                dispatch(getLicenseTestPage());
            }
        }, error => console.error(error) || T.notify('Xóa kỳ sát hạch bị lỗi!', 'danger'));
    };
}


export const ajaxLicenseTest = {
    ajax: true,
    url: '/api/license-test/page/1/20',
    data: params=>({searchText:params.term}),
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getLicenseTest(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetLicenseTest(_id, done) {
    const url = '/api/license-test';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy kỳ sát hạch bị lỗi!', 'danger'));
}