import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const BankGetAll = 'Bank:GetAll';
const BankGetItem = 'Bank:GetItem';
const BankUpdate = 'Bank:Update';

export default function bankReducer(state = null, data) {
    switch (data.type) {
        case BankGetAll:
            return Object.assign({}, state, { list: data.list });

        case BankGetItem:
            return Object.assign({}, state, { item: data.item });

        case BankUpdate: {
            let updatedList = Object.assign({}, state.list),
                updatedPage = Object.assign({}, state.page),
                updatedItem = data.item;
            if (updatedList) {
                for (let i = 0, n = updatedList.length; i < n; i++) {
                    if (updatedList[i]._id == updatedItem._id) {
                        updatedList.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            if (updatedPage.list) {
                for (let i = 0, n = updatedPage.list.length; i < n; i++) {
                    if (updatedPage.list[i]._id == updatedItem._id) {
                        updatedPage.list.splice(i, 1, updatedItem);
                        break;
                    }
                }
            }
            return Object.assign({}, state, { list: updatedList, page: updatedPage });
        }

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getBankAll(done) {
    return dispatch => {
        const url = '/api/bank/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done();
                dispatch({ type: BankGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách ngân hàng bị lỗi!', 'danger'));
    };
}

export function createBank(bank, done) {
    return () => {
        const url = '/api/bank';
        T.post(url, { bank }, data => {
            if (data.error) {
                T.notify('Tạo ngân hàng bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                // dispatch(getBankPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo ngân hàng bị lỗi!', 'danger'));
    };
}

export function updateBank(_id, changes, done) {
    return () => {
        const url = '/api/bank';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin ngân hàng bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin ngân hàng thành công!', 'info');
                done && done(data.item);
                // dispatch(getBankAll());
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin ngân hàng bị lỗi!', 'danger'));
    };
}

export function deleteBank(_id) {
    return dispatch => {
        const url = '/api/bank';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa ngân hàng bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Ngân hàng được xóa thành công!', 'error', false, 800);
                dispatch(getBankAll());
            }
        }, error => console.error(error) || T.notify('Xóa ngân hàng bị lỗi!', 'danger'));
    };
}

export function getBank(_id, done) {
    return (dispatch) => {
        const url = '/api/bank';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch({ type: BankGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin ngân hàng bị lỗi', 'danger'));
    };
}

export function getBankByStudent(condition, done) {
    return (dispatch) => {
        const url = '/api/bank/student';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy thông tin ngân hàng bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch({ type: BankGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin ngân hàng bị lỗi', 'danger'));
    };
}