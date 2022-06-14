import T from 'view/js/common';

// Reducer ------------------------------------------------------------------------------------------------------------
const SimulatorGetAll = 'SimulatorGetAll';
const SimulatorGetPage = 'SimulatorGetPage';
const SimulatorGetItem = 'SimulatorGetItem';

export default function simulatorReducer(state = {}, data) {
    switch (data.type) {
        case SimulatorGetAll:
            return Object.assign({}, state, { list: data.list });
        case SimulatorGetPage:
            return Object.assign({}, state, { page: data.page });

        case SimulatorGetItem:
            return Object.assign({}, state, { item: data.item });
        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
T.initCookiePage('pageSimulator');
export function getSimulatorPage(pageNumber, pageSize, pageCondition, done) {
    const page = T.updatePage('pageSimulator', pageNumber, pageSize);
    return (dispatch) => {
        const url = `/api/simulator/page/${page.pageNumber}/${page.pageSize}`;
        T.get(url,{ pageCondition }, data => {
            if (data.error) {
                T.notify('Lấy danh sách mô phỏng  bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                done && done(data.page);
                dispatch({ type: SimulatorGetPage, page: data.page });
            }
        }, error => console.error(error) || T.notify('Lấy danh sách mô phỏng  bị lỗi!', 'danger'));
    };
}

export function getSimulatorAll(condition,done) {
    return dispatch => {
        const url = '/api/simulator/all';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy mô phỏng  bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: SimulatorGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy mô phỏng  bị lỗi', 'danger'));
    };
}

export function getSimulatorRandom(condition,done) {
    return dispatch => {
        const url = '/api/simulator/random';
        T.get(url,{condition}, data => {
            if (data.error) {
                T.notify('Lấy mô phỏng  bị lỗi', 'danger');
                console.error('GET: ' + url + '. ' + data.error);
            } else {
                done && data && done(data.list);
                dispatch({ type: SimulatorGetAll, list: data.list });
            }
        }, error => console.error(error) || T.notify('Lấy mô phỏng  bị lỗi', 'danger'));
    };
}

export function getSimulator(_id, done) {
    return dispatch => ajaxGetSimulator(_id, data => {
        if (data.error) {
            T.notify('Lấy mô phỏng  bị lỗi!', 'danger');
            console.error('GET: getCourseType.', data.error);
        } else {
            done && done(data.item);
            dispatch({ type: SimulatorGetItem, item: data.item });
        }
    });
}

export function createSimulator(data, done) {
    return dispatch => {
        const url = '/api/simulator';
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo mô phỏng  bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getSimulatorPage());
                done && done(data);
            }
        }, error => console.error(error) || T.notify('Tạo mô phỏng  bị lỗi!', 'danger'));
    };
}

export function updateSimulator(_id, changes, done) {
    return dispatch => {
        const url = '/api/simulator';
        T.put(url, { _id, changes }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin mô phỏng  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: SimulatorGetItem, item: data.item });
                dispatch(getSimulatorPage());
                T.notify('Cập nhật mô phỏng  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật mô phỏng  bị lỗi!', 'danger'));
    };
}

export function swapSimulator(_id, isMoveUp) {
    return dispatch => {
        const url = '/api/simulator/swap';
        T.put(url, { _id, isMoveUp }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự bài mô phỏng bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                T.notify('Thay đổi thứ tự bài mô phỏng thành công!', 'info');
                dispatch(getSimulatorPage());
            }
        }, error => console.error(error) || T.notify('Thay đổi thứ tự bài mô phỏng bị lỗi!', 'danger'));
    };
}

export function addStudentSimulator(_id, student, courseId, subjectId, done) {
    return dispatch => {
        const url = '/api/simulator/student';
        T.put(url, { _id, student }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin mô phỏng  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: SimulatorGetItem, item: data.item });
                dispatch(getSimulatorPage(1,20, {courseType: courseId, subject: subjectId}));
                T.notify('Cập nhật mô phỏng  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật mô phỏng  bị lỗi!', 'danger'));
    };
}

export function deleteStudentSimulator(_id, _studentId, done) {
    return dispatch => {
        const url = '/api/simulator/student';
        T.delete(url, { _id, _studentId }, data => {
            if (data.error) {
                T.notify('Xóa học viên bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch({ type: SimulatorGetItem, item: data.item});
                done && done();
            }
        }, error => console.error('POST: ' + url + '.', error));
    };
}



export function updateSimulatorDefault(diploma, done) {
    return dispatch => {
        const url = '/api/simulator/default';
        T.put(url, { diploma }, data => {
            if (data.error) {
                T.notify('Cập nhật thông tin mô phỏng  bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
                done && done(data.error);
            } else {
                dispatch({ type: SimulatorGetItem, item: data.item });
                dispatch(getSimulatorPage());
                T.notify('Cập nhật mô phỏng  thành công!', 'success');
                done && done();
            }
        }, error => console.error(error) || T.notify('Cập nhật mô phỏng  bị lỗi!', 'danger'));
    };
}

export function deleteSimulator(_id) {
    return dispatch => {
        const url = '/api/simulator';
        T.delete(url, { _id }, data => {
            if (data.error) {
                T.notify('Xóa mô phỏng  bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                T.notify('Xoá mô phỏng  thành công!', 'success');
                dispatch(getSimulatorPage());
            }
        }, error => console.error(error) || T.notify('Xóa mô phỏng  bị lỗi!', 'danger'));
    };
}


export const ajaxSelectSimulator = {
    ajax: true,
    url: '/api/simulator/all',
    data: {},
    processResults: response => ({
        results: response && response.list ? response.list.map(item => ({ id: item._id, text: item.title })) : []
    }),
    fetchOne: (_id, done) => getSimulator(_id, ({ item }) => done && done({ id: item._id, text: item.title }))
};

export function ajaxGetSimulator(_id, done) {
    const url = '/api/simulator';
    T.get(url, { _id }, done, error => console.error(error) || T.notify('Lấy mô phỏng  bị lỗi!', 'danger'));
}