import T from '../../../view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------------------------------------
const VideoGetPage = 'Video:GetPage';
const VideoUpdate = 'Video:Update';
console.log("from ReduxVideo");


export default function videoReducer(state = null, data) {
    switch (data.type) {
        case VideoGetPage:
            return Object.assign({}, state, { page: data.page });

        case VideoUpdate:
            let updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                if (updatedPage.list[i]._id == updatedItem._id) {
                    updatedPage.list.splice(i, 1, updatedItem);
                    return Object.assign({}, state, { page: updatedPage });
                }
            }
            return state;

        default:
            return state;
    }
}

// ADMIN --------------------------------------------------------------------------------------------------------------------------------------------
T.initCookiePage('adminVideo');
export function getVideoInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('adminVideo', pageNumber, pageSize);

    return dispatch => {
        const url = '/api/video/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: VideoGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách video bị lỗi!', 'danger'));
    }
}

export function createVideo(video, done) {
    return dispatch => {
        const url = '/api/video';
        T.post(url, { data: video }, data => {
            if (data.error) {
                T.notify('Tạo video bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getVideoInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo video bị lỗi!', 'danger'));
    }
}

export function updateVideo(_id, changes, done) {
    return dispatch => {
        const url = '/api/video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin video bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin video thành công!', 'info');
                done && done();
                dispatch(getVideoInPage());
            }
        }, error => T.notify('Cập nhật thông tin video bị lỗi!', 'danger'));
    }
}

export function deleteVideo(_id) {
    return dispatch => {
        const url = '/api/video';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa video bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Video được xóa thành công!', 'error', false, 800);
                dispatch(getVideoInPage());
            }
        }, error => T.notify('Xóa video bị lỗi!', 'danger'));
    }
}

export function changeVideo(video) {
    return { type: VideoUpdate, item: video };
}


// USER ---------------------------------------------------------------------------------------------------------------------------------------------
export function getVideo(_id, done) {
    return dispatch => {
        const url = '/home/video/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done(data.item);
            }
        }, error => T.notify('Lấy video bị lỗi!', 'danger'));
    }
}