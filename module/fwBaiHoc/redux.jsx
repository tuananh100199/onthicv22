import T from '../../view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const BaiHocGetBaiHocInPage = 'BaiHoc:GetBaiHocInPage';
const BaiHocGetBaiHoc = 'BaiHoc:GetBaiHoc';

export default function BaiHocReducer(state = null, data) {
    switch (data.type) {
        case BaiHocGetBaiHocInPage:
            return Object.assign({}, state, { page: data.page });

        case BaiHocGetBaiHoc:
            return Object.assign({}, state, { BaiHoc: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageBaiHoc');
export function getBaiHocInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('pageBaiHoc', pageNumber, pageSize);
    return (dispatch) => {
        const url = '/api/bai-hoc/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách loại bài học bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: BaiHocGetBaiHocInPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách bài học bị lỗi!', 'danger'));
    }
}

export function getBaiHoc(_id, done) {
    return dispatch => {
        const url = '/api/bai-hoc/edit/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy loại khóa học bị lỗi1!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                if (done) done(data);
                dispatch({ type: BaiHocGetBaiHoc, item: data.item });
            }
        }, error => T.notify('Lấy loại khóa học bị lỗi!', 'danger'));
    }
}

export function createBaiHoc(done) {
    return dispatch => {
        const url = '/api/bai-hoc';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo loại khóa học bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getBaiHocInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo loại khóa học bị lỗi!', 'danger'));
    }
}

export function updateBaiHoc(_id, changes, done) {
    return dispatch => {
        const url = '/api/bai-hoc';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin môn học thành công!', 'info');
                dispatch(getBaiHocInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin môn học bị lỗi!', 'danger'));
    }
}

export function deleteBaiHoc(_id) {
    return dispatch => {
        const url = '/api/bai-hoc';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa khóa học bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.alert('Khóa học được xóa thành công!', 'error', false, 800);
                dispatch(getBaiHocInPage());
            }
        }, error => T.notify('Xóa khóa học bị lỗi!', 'danger'));
    }
}
