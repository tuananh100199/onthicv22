import T from 'view/js/common';
T.pushComponentTypes('testimony');

// Reducer ------------------------------------------------------------------------------------------------------------
const TestimonyGetAll = 'Testimony:GetAll';
const TestimonyUpdate = 'Testimony:Update';
const TestimonyAddItem = 'Testimony:AddItem';
const TestimonyUpdateItem = 'Testimony:UpdateItem';
const TestimonyRemoveItem = 'Testimony:RemoveItem';
const TestimonySwapItems = 'Testimony:SwapItems';

export default function testimonyReducer(state = null, data) {
    switch (data.type) {
        case TestimonyGetAll:
            return Object.assign({}, state, { list: data.items });

        case TestimonyAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    fullname: data.fullname,
                    jobPosition: data.jobPosition,
                    image: data.image,
                    content: data.content
                });
            }
            return state;

        case TestimonyUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1, {
                        fullname: data.fullname,
                        jobPosition: data.jobPosition,
                        image: data.image,
                        content: data.content
                    });
                }
            }
            return state;

        case TestimonyRemoveItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;

        case TestimonySwapItems:
            if (state && state.item) {
                state = Object.assign({}, state);
                const testimony = state.item.items[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index - 1, 0, testimony);
                } else if (!data.isMoveUp && data.index < state.item.items.length - 1) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index + 1, 0, testimony);
                }
            }
            return state;

        case TestimonyUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllTestimonys(done) {
    return dispatch => {
        const url = '/api/testimony/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách testimony bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: TestimonyGetAll, items: data.items });
            }
        }, error => T.notify('Lấy danh sách testimony bị lỗi!', 'danger'));
    }
}

export function createTestimony(title, done) {
    return dispatch => {
        const url = '/api/testimony';
        T.post(url, { title }, data => {
            if (data.error) {
                T.notify('Tạo testimony bị lỗi!', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllTestimonys());
                if (done) done(data);
            }
        }, error => T.notify('Tạo testimony bị lỗi!', 'danger'));
    }
}

export function updateTestimony(_id, changes, done) {
    return dispatch => {
        const url = '/api/testimony';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin testimony bị lỗi!', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật thông tin testimony thành công!', 'info');
                dispatch(getAllTestimonys());
                done && done();
            }
        }, error => T.notify('Cập nhật thông tin testimony bị lỗi!', 'danger'));
    }
}

export function deleteTestimony(_id) {
    return dispatch => {
        const url = '/api/testimony';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa testimony bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('nhân viên được xóa thành công!', 'error', false, 800);
                dispatch(getAllTestimonys());
            }
        }, error => T.notify('Xóa testimony bị lỗi!', 'danger'));
    }
}



export function getTestimonyItem(_id, done) {
    return dispatch => {
        const url = '/api/testimony/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy testimony bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: TestimonyUpdate, item: data.item });
            }
        }, error => T.notify('Lấy testimony bị lỗi!', 'danger'));
    }
}

export function addTestimonyIntoGroup(fullname, jobPosition, image, content) {
    return { type: TestimonyAddItem, fullname, jobPosition, image, content };
}

export function updateTestimonyInGroup(index, fullname, jobPosition, image, content) {
    return { type: TestimonyUpdateItem, index, fullname, jobPosition, image, content };
}

export function removeTestimonyFromGroup(index) {
    return { type: TestimonyRemoveItem, index };
}

export function swapTestimonyInGroup(index, isMoveUp) {
    return { type: TestimonySwapItems, index, isMoveUp };
}


export function getTestimonyByUser(_id, done) {
    return dispatch => {
        const url = '/home/testimony/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy testimony bị lỗi!', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify('Lấy testimony bị lỗi!', 'danger'));
    }
}