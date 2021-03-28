import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------------------------------------
const VideoGetAll = 'VideoGetAll';
const VideoChange = 'VideoChange';

export default function videoReducer(state = {}, data) {
    switch (data.type) {
        case VideoGetAll:
            return Object.assign({}, state, { list: data.list });

        case VideoChange:
            state = Object.assign({}, state);
            for (let i = 0; i < state.list.length; i++) {
                if (state.list[i]._id == data.item._id) {
                    state.list[i] = data.item;
                    break;
                }
            }
            return state;

        default:
            return state;
    }
}

// ADMIN --------------------------------------------------------------------------------------------------------------------------------------------
export function getVideoAll(condition, done) {
    return dispatch => {
        const url = '/api/video/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.list);
                dispatch({ type: VideoGetAll, list: data.list ? data.list : [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}

export function createVideo(data, done) {
    return dispatch => {
        const url = '/api/video';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo video bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getVideoAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo video bị lỗi!', 'danger'));
    }
}

export function updateVideo(_id, changes) {
    return dispatch => {
        const url = '/api/video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin video bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin video thành công!', 'success');
                dispatch(getVideoAll());
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
                dispatch(getVideoAll());
            }
        }, error => T.notify('Xóa video bị lỗi!', 'danger'));
    }
}

export function swapVideo(_id, isMoveUp, done) {
    return dispatch => {
        const url = '/api/video/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Swap video item failed!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            }
            done && done()
        }, error => T.notify('Swap video item failed!', 'danger'));
    }
}


export function changeVideo(video) {
    return { type: VideoChange, item: video };
}

export function getVideo(_id, done) {
    return dispatch => ajaxGetVideo(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy video bị lỗi!', 'danger');
            console.error(`GET: ${url}. ${data.error}`);
        } else {
            dispatch({ type: VideoChange, item: data.item });
            done && done(data);
        }
    });
}

export function getVideoAllByUser(condition, done) {
    return dispatch => {
        const url = '/home/video/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
            }
        }, error => T.notify('Lấy danh sách video bị lỗi!', 'danger'));
    }
}

// Home ---------------------------------------------------------------------------------------------------------------
export function homeGetVideo(_id, done) {
    return dispatch => {
        const url = '/home/video';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: VideoChange, item: data.item });
                if (done) done({ item: data.item });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}

export const ajaxSelectVideo = T.createAjaxAdapter(
    '/api/video/page/1/20',
    response => response && response.page && response.page.list ? response.page.list.filter(item => item.active === true).map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetVideo(_id, done) {
    const url = '/api/video';
    T.get(url, { _id }, done, error => T.notify('Lấy nội dung bị lỗi!', 'danger'));
};
