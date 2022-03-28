import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------------------------------------
const IntroVideoGetAll = 'IntroVideoGetAll';
const IntroVideoChange = 'IntroVideoChange';
const IntroVideoGet = 'IntroVideoGet';


export default function introVideoReducer(state = {}, data) {
    switch (data.type) {
        case IntroVideoGetAll:
            return Object.assign({}, state, { list: data.list });

        case IntroVideoGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case IntroVideoChange:
            state = Object.assign({}, state);
            for (let i = 0; i < state.list.length; i++) {
                if (state.list[i]._id == data.item._id) {
                    state.list[i] = data.item;
                    break;
                }
            }
            state.list.sort((a, b) => a.title.localeCompare(b.title));
            return state;

        default:
            return state;
    }
}

// ADMIN --------------------------------------------------------------------------------------------------------------------------------------------
export function getIntroVideoAll(condition, done) {
    return dispatch => {
        const url = '/api/intro-video/all';
        T.get(url, { condition }, data => {
            console.log('data in intro video',data);
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.list);
                dispatch({ type: IntroVideoGetAll, list: data.list || [] });
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    };
}

export function getIntroVideo(_id, done) {
    return dispatch => ajaxGetIntroVideo(_id, data => {
        if (data.error || data.item == null) {
            T.notify('Lấy video bị lỗi!', 'danger');
            console.error(`GET: getVideo. ${data.error}`);
        } else {
            dispatch({ type: IntroVideoGet, item: data.item });
            done && done(data);
        }
    });
}
export function createIntroVideo(data, done) {
    return dispatch => {
        const url = '/api/intro-video';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo video bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getIntroVideoAll());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo video bị lỗi!', 'danger'));
    };
}

export function updateIntroVideo(_id, changes) {
    return dispatch => {
        const url = '/api/intro-video';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin video bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật thông tin video thành công!', 'success');
                dispatch({ type: IntroVideoChange, item: data.item });
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin video bị lỗi!', 'danger'));
    };
}
export function changeIntroVideo(video) {
    return { type: IntroVideoChange, item: video };
}

export function deleteIntroVideo(_id) {
    return dispatch => {
        const url = '/api/intro-video';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa video bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Video được xóa thành công!', 'error', false, 800);
                dispatch(getIntroVideoAll());
            }
        }, error => console.error(error) || T.notify('Xóa video bị lỗi!', 'danger'));
    };
}

// Home ---------------------------------------------------------------------------------------------------------------
export function getIntroVideoAllByUser(condition, done) {
    return () => {
        const url = '/home/intro-video/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách video bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && done(data.items);
            }
        }, error => console.error(error) || T.notify('Lấy danh sách video bị lỗi!', 'danger'));
    };
}
export function homeGetIntroVideo(_id, done) {
    return dispatch => {
        const url = '/home/intro-video';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy video giới thiệu bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                dispatch({ type: IntroVideoGet, item: data.item });
                done && done({ item: data.item });
            }
        }, error => console.error('GET: ' + url + '. ' + error));
    };
}

export const ajaxSelectIntroVideo = T.createAjaxAdapter(
    '/api/intro-video/all',
    response => response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : [],
);

export function ajaxGetIntroVideo(_id, done) {
    const url = '/api/intro-video';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy nội dung bị lỗi!', 'danger'));
}
