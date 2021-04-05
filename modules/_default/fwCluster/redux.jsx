import T from 'view/js/common';

const ClusterGetAll = 'ClusterGetAll';
const SystemImageGetAll = 'SystemImageGetAll';

export default function clusterReducer(state = null, data) {
    switch (data.type) {
        case ClusterGetAll:
            return Object.assign({}, state, { clusters: data.items });

        case SystemImageGetAll:
            return Object.assign({}, state, { images: data.items });

        default:
            return state;
    }
}

// Actions ------------------------------------------------------------------------------------------------------------
export function getClusterAll() {
    return dispatch => {
        const url = `/api/cluster/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy cluster bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: ClusterGetAll, items: data.items });
            }
        }, error => T.notify('Lấy cluster bị lỗi!', 'danger'));
    }
}

export function getCluster(clusterId, done) {
    return dispatch => {
        const url = `/api/cluster/item/${clusterId}`;
        T.get(url, data => done(data), error => done({ error }));
    }
}

export function createCluster(done) {
    return dispatch => {
        const url = `/api/cluster`;
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo cluster bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                dispatch(getClusterAll());
                if (done) done(data);
            }
        }, error => T.notify('Tạo cluster bị lỗi!', 'danger'));
    }
}

export function resetCluster(id, done) {
    return dispatch => {
        if (id) {
            if (typeof id == 'function') {
                done = id;
                id = null;
            }
        }

        const url = `/api/cluster`;
        T.put(url, { id }, data => {
            if (data.error) {
                T.notify('Cập nhật cluster bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Cập nhật cluster thành công!', 'success');
                dispatch(getClusterAll());
                done && done();
            }
        }, error => T.notify('Cập nhật cluster bị lỗi!', 'danger'));
    }
}

export function deleteCluster(id) {
    return dispatch => {
        const url = `/api/cluster`;
        T.delete(url, { id }, data => {
            if (data.error) {
                T.notify('Xóa cluster bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa cluster thành công!', 'error', false, 800);
                dispatch(getClusterAll());
            }
        }, error => T.notify('Xóa cluster bị lỗi!', 'danger'));
    }
}

export function getSystemImageAll() {
    return dispatch => {
        const url = `/api/cluster/image/all`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy image bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: SystemImageGetAll, items: data.items });
            }
        }, error => T.notify('Lấy image bị lỗi!', 'danger'));
    }
}

export function applySystemImage(filename, done) {
    return dispatch => {
        const url = `/api/cluster/image`;
        T.put(url, { filename }, data => {
            if (data.error) {
                T.notify('Triển khai image bị lỗi!', 'danger');
                console.error(`PUT: ${url}. ${data.error}`);
                done && done(data.error);
            } else {
                T.notify('Triển khai image thành công!', 'success');
                done && done();
            }
        }, error => T.notify('Triển khai image bị lỗi!', 'danger'));
    }
}

export function deleteSystemImage(filename) {
    return dispatch => {
        const url = `/api/cluster/image`;
        T.delete(url, { filename }, data => {
            if (data.error) {
                T.notify('Xóa image bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa image thành công!', 'error', false, 800);
                dispatch(getSystemImageAll());
            }
        }, error => T.notify('Xóa image bị lỗi!', 'danger'));
    }
}