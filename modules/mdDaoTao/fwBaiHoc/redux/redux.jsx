import T from 'view/js/common';
// Reducer ------------------------------------------------------------------------------------------------------------
const BaiHocGetBaiHocInPage = 'BaiHoc:GetBaiHocInPage';
const BaiHocGetBaiHoc = 'BaiHoc:GetBaiHoc';
const GET_LESSON_VIDEO_LIST = 'lessonVideo:getLessonVideoList';

export default function BaiHocReducer(state = null, data) {
    switch (data.type) {
        case BaiHocGetBaiHocInPage:
            return Object.assign({}, state, { page: data.page });

        case BaiHocGetBaiHoc:
            return Object.assign({}, state, { lesson: data.item });

        case GET_LESSON_VIDEO_LIST:
            return Object.assign({}, state, { listLessonVideo: data.lessonVideo });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
const getPageUrl = (pageNumber, pageSize) => `/api/bai-hoc/page/${pageNumber}/${pageSize}`;
T.initCookiePage('pageBaiHoc', true);
export function getBaiHocInPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageBaiHoc', pageNumber, pageSize, pageCondition);
    if (page.pageCondition && typeof page.pageCondition == 'object') {
        page.pageCondition = JSON.stringify(page.pageCondition);
    }
    return (dispatch) => {
        ajaxGetBaiHocInPage(page.pageNumber, page.pageSize, page.pageCondition ? JSON.parse(page.pageCondition) : {}, page => {
            done && done(page);
            dispatch({ type: BaiHocGetBaiHocInPage, page });
        });
    }
}
export function ajaxGetBaiHocInPage(pageNumber, pageSize, pageCondition, done) {
    const url = getPageUrl(pageNumber, pageSize);
    T.get(url, { condition: pageCondition }, data => {
        if (data.error) {
            T.notify('Lấy danh sách bài học bị lỗi!', 'danger');
            console.error('GET: ' + url + '. ' + data.error);
        } else {
            if (pageCondition) data.page.pageCondition = pageCondition;
            done && done(data.page);
        }
    }, error => T.notify('Lấy danh sách người dùng bị lỗi!', 'danger'));
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
                T.notify('Cập nhật thông tin môn học thành công!', 'success');
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

export const ajaxSelectLesson = {
    ajax: true,
    url: getPageUrl(1, 100),
    data: params => ({ condition: params.term }),
    processResults: response => ({
        results: response && response.page && response.page.list ? response.page.list.map(item => ({ id: item._id, text: `${item.title}` })) : []
    })
}
//