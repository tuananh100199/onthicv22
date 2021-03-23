import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const LogoGetAll = 'Logo:GetAll';
const LogoUpdate = 'Logo:Update';
const LogoAddItem = 'Logo:AddItem';
const LogoUpdateItem = 'Logo:UpdateItem';
const LogoDeleteItem = 'Logo:DeleteItem';
const LogoSwapItem = 'Logo:SwapItems';

export default function logoReducer(state = null, data) {
    switch (data.type) {
        case LogoGetAll:
            return Object.assign({}, state, { list: data.items });

        case LogoAddItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                state.item.items.push({
                    name: data.name,
                    address: data.address,
                    link: data.link,
                    image: data.image
                });
            }
            return state;

        case LogoUpdateItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1, {
                        name: data.name,
                        address: data.address,
                        link: data.link,
                        image: data.image
                    });
                }
            }
            return state;

        case LogoDeleteItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                if (0 <= data.index && data.index < state.item.items.length) {
                    state.item.items.splice(data.index, 1);
                }
            }
            return state;

        case LogoSwapItem:
            if (state && state.item) {
                state = Object.assign({}, state);
                const logo = state.item.items[data.index];
                if (data.isMoveUp && data.index > 0) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index - 1, 0, logo);
                } else if (!data.isMoveUp && data.index < state.item.items.length - 1) {
                    state.item.items.splice(data.index, 1);
                    state.item.items.splice(data.index + 1, 0, logo);
                }
            }
            return state;

        case LogoUpdate:
            return Object.assign({}, state, { item: data.item });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getAllLogos(done) {
    return dispatch => {
        const url = '/api/logo/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách logo bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.items);
                dispatch({ type: LogoGetAll, items: data.items });
            }
        }, error => T.notify('Lấy danh sách logo bị lỗi', 'danger'));
    }
}

export function createLogo(newData, done) {
    return dispatch => {
        const url = '/api/logo';
        T.post(url, { newData }, data => {
            if (data.error) {
                T.notify('Tạo nhóm logo bị lỗi', 'danger');
                console.error('POST: ' + url + '. ' + data.error);
            } else {
                dispatch(getAllLogos());
                if (done) done(data);
            }
        }, error => T.notify('Tạo nhóm logo bị lỗi', 'danger'));
    }
}

export function updateLogo(_id, changes, done) {
    return dispatch => {
        const url = '/api/logo';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật nhóm logo bị lỗi', 'danger');
                console.error('PUT: ' + url + '. ' + data.error);
                done && done(data.error);
            } else {
                T.notify('Cập nhật nhóm logo thành công', 'info');
                dispatch(getAllLogos());
                done && done();
            }
        }, error => T.notify('Cập nhật nhóm logo bị lỗi', 'danger'));
    }
}

export function deleteLogo(_id) {
    return dispatch => {
        const url = '/api/logo';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa nhóm logo bị lỗi', 'danger');
                console.error('DELETE: ' + url + '. ' + data.error);
            } else {
                T.alert('Xóa nhóm logo thành công', 'error', false, 800);
                dispatch(getAllLogos());
            }
        }, error => T.notify('Xóa nhóm logo bị lỗi', 'danger'));
    }
}



export function getLogoItem(_id, done) {
    return dispatch => {
        const url = '/api/logo/item/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm logo bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done({ item: data.item });
                dispatch({ type: LogoUpdate, item: data.item });
            }
        }, error => T.notify('Lấy nhóm logo bị lỗi', 'danger'));
    }
}

export function addLogoIntoGroup(name, address, link, image) {
    return { type: LogoAddItem, name, address, link, image };
}

export function updateLogoInGroup(index, name, address, link, image) {
    return { type: LogoUpdateItem, index, name, address, link, image };
}

export function removeLogoFromGroup(index) {
    return { type: LogoDeleteItem, index };
}

export function swapLogoInGroup(index, isMoveUp) {
    return { type: LogoSwapItem, index, isMoveUp };
}


export function getLogoByUser(_id, done) {
    return dispatch => {
        const url = '/home/logo/' + _id;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy nhóm logo bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                if (done) done(data.item);
            }
        }, error => T.notify('Lấy nhóm logo bị lỗi', 'danger'));
    }
}