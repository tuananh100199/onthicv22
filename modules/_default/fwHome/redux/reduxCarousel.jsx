import T from 'view/js/common';
T.pushComponentTypes('carousel');

// Reducer ------------------------------------------------------------------------------------------------------------
const CarouselGetAll = 'Carousel:GetAll';
const CarouselGetPage = 'Carousel:GetPage';
const CarouselGet = 'Carousel:Get';
const CarouselUpdate = 'Carousel:Update';

export default function carouselReducer(state = null, data) {
    switch (data.type) {
        case CarouselGetAll:
            return Object.assign({}, state, { items: data.items });

        case CarouselGetPage:
            return Object.assign({}, state, { page: data.page });

        case CarouselGet:
            return Object.assign({}, state, { selectedItem: data.item });

        case CarouselUpdate:
            state = Object.assign({}, state);
            const updatedItem = data.item;
            if (state && state.selectedItem && state.selectedItem._id == updatedItem.carouselId) {
                for (let i = 0, items = state.selectedItem.items, n = items.length; i < n; i++) {
                    if (items[i]._id == updatedItem._id) {
                        state.selectedItem.items.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return state;

        default:
            return state;
    }
}

// Action --------------------------------------------------------------------------------------------------------------
export function getAllCarousels(done) {
    return dispatch => {
        const url = '/api/carousel/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Get carousel list failed!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: CarouselGetAll, items: data.items ? data.items : [] });
            }
        }, error => T.notify('Get carousel list failed!', 'danger'));
    }
}

T.initCookiePage('adminCarousel');
export function getCarouselInPage(pageNumber, pageSize, done) {
    const page = T.updatePage('adminCarousel', pageNumber, pageSize);
    return dispatch => {
        const url = '/api/carousel/page/' + page.pageNumber + '/' + page.pageSize;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách tập hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.page.pageNumber, data.page.pageSize, data.page.pageTotal, data.page.totalItem);
                dispatch({ type: CarouselGetPage, page: data.page });
            }
        }, error => T.notify('Lấy danh sách tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function getCarousel(_id, done) {
    return dispatch => {
        const url = '/api/carousel/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy tập hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
                dispatch({ type: CarouselGet, item: data.item });
            }
        }, error => T.notify('Lấy tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function createCarousel(data, done) {
    return dispatch => {
        const url = '/api/carousel';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo tập hình ảnh thành công!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarouselInPage());
                if (done) done(data);
            }
        }, error => T.notify('Tạo tập hình ảnh thành công!', 'danger'));
    }
}

export function updateCarousel(_id, changes, done) {
    return dispatch => {
        const url = '/api/carousel';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật tập hình ảnh bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật tập hình ảnh thành công!', 'info');
                dispatch(getCarouselInPage());
                done && done();
            }
        }, error => T.notify('Cập nhật tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function deleteCarousel(id) {
    return dispatch => {
        const url = '/api/carousel';
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xoá tập hình ảnh bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xoá tập hình ảnh thành công!', 'error', false, 800);
                dispatch(getCarouselInPage());
            }
        }, error => T.notify('Xoá tập hình ảnh bị lỗi!', 'danger'));
    }
}

export function createCarouselItem(data, done) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo hình ảnh bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarousel(data.item.carouselId));
                if (done) done(data);
            }
        }, error => T.notify('Tạo hình ảnh bị lỗi!', 'danger'));
    }
}

export function updateCarouselItem(_id, changes, done) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật hình ảnh bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                T.notify('Cập nhật hình ảnh thành công!', 'info');
                dispatch(getCarousel(data.item.carouselId));
                if (done) done();
            }
        }, error => T.notify('Cập nhật hình ảnh bị lỗi!', 'danger'));
    }
}

export function swapCarouselItem(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/carousel/item/swap/';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự hình ảnh bị lỗi!', 'danger')
                console.error('PUT: ' + url + '. ' + data.error);
            } else {
                dispatch(getCarousel(data.item1.carouselId));
            }
        }, error => T.notify('Thay đổi thứ tự hình ảnh bị lỗi!', 'danger'));
    }
}

export function deleteCarouselItem(_id) {
    return dispatch => {
        const url = '/api/carousel/item';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xoá hình ảnh bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Hình ảnh được xóa thành công!', 'error', false, 800);
                dispatch(getCarousel(data.carouselId));
            }
        }, error => T.notify('Xoá hình ảnh bị lỗi!', 'danger'));
    }
}

export function changeCarouselItem(item) {
    return { type: CarouselUpdate, item };
}

// Home -------------------------------------------------------------------------------------------
export function homeGetCarousel(_id, done) {
    return dispatch => {
        const url = '/home/carousel/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách hình ảnh bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '. ' + error);
        });
    }
}
