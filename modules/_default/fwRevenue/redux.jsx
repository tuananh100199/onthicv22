import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const RevenueGetAll = 'Revenue:GetAll';
const RevenueGetItem = 'Revenue:GetItem';
const RevenueUpdate = 'Revenue:Update';
const RevenueGetPage = 'RevenueGetPage';

export default function revenueReducer(state = null, data) {
    switch (data.type) {
        case RevenueGetAll:
            return Object.assign({}, state, { list: data.list });

        case RevenueGetItem:
            return Object.assign({}, state, { item: data.item });
        
        case RevenueGetPage:
            return Object.assign({}, state, { page: data.page });

        case RevenueUpdate: {
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
T.initCookiePage('adminRevenue');
export function getRevenuePage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('adminRevenue', pageNumber, pageSize);
    return dispatch => {
        const url = `/api/revenue/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url, { pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh thu học phí bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                if (pageCondition) data.page.pageCondition = pageCondition;
                done && done(data.page);
                dispatch({ type: RevenueGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách doanh thu học phí bị lỗi!', 'danger'));
    };
}
export function getRevenueAll(condition, done) {
    return dispatch => {
        const url = '/api/revenue/all';
        T.get(url, { condition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done();
                dispatch({ type: RevenueGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger'));
    };
}

export function getRevenueByMonth(dateStart, dateEnd, done) {
    return dispatch => {
        const url = '/api/revenue/month';
        T.get(url, { dateStart, dateEnd }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: RevenueGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger'));
    };
}

export function getRevenueByDate(dateStart, dateEnd, done) {
    return dispatch => {
        const url = '/api/revenue/date';
        T.get(url, { dateStart, dateEnd }, data => {
            if (data.error) {
                T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data);
                dispatch({ type: RevenueGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách doanh thu bị lỗi!', 'danger'));
    };
}

export function getStatisticRevenue(done) {
    return dispatch => {
        const url = '/api/revenue/statistic';
        T.get(url, data => {
            data && dispatch({ type: RevenueGetItem, item: data.item });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Lấy thông tin thống kê doanh thu lỗi!', 'danger');
            done && done();
        });
    };
}

export function deleteStatisticRevenue(done) {
    return dispatch => {
        const url = '/api/revenue/statistic';
        T.delete(url, data => {
            data && dispatch({ type: RevenueGetItem, item: data.item });
            done && done(data);
        }, error => {
            console.error(error);
            T.notify('Xoá thông tin thống kê doanh thu lỗi!', 'danger');
            done && done();
        });
    };
}

export function createRevenue(revenue, done) {
    return () => {
        const url = '/api/revenue';
        T.post(url, { revenue }, data => {
            if (data.error) {
                T.notify('Tạo doanh thu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                // dispatch(getBankPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo doanh thu bị lỗi!', 'danger'));
    };
}

export function updateRevenue(_id, changes, done) {
    return () => {
        const url = '/api/revenue';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin doanh thu bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
            } else {
                T.notify('Cập nhật thông tin doanh thu thành công!', 'info');
                done && done(data.item);
                // dispatch(getBankAll());
            }
        }, error => console.error(error) || T.notify('Cập nhật thông tin doanh thu bị lỗi!', 'danger'));
    };
}

export function deleteRevenue(_id) {
    return dispatch => {
        const url = '/api/revenue';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa doanh thu bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Doanh thu được xóa thành công!', 'success', false, 800);
                dispatch(getRevenuePage());
            }
        }, error => console.error(error) || T.notify('Xóa doanh thu bị lỗi!', 'danger'));
    };
}

export function getRevenue(_id, done) {
    return (dispatch) => {
        const url = '/api/revenue';
        T.get(url, { _id }, data => {
            if (data.error) {
                T.notify('Lấy thông tin doanh thu bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                done && done(data.item);
                dispatch({ type: RevenueGetItem, item: data.item });
            }
        }, error => console.error(error) || T.notify('Lấy thông tin doanh thu bị lỗi', 'danger'));
    };
}