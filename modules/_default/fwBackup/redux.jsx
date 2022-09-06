import T from 'view/js/common';

const BackupDatabaseGetAll = 'BackupDatabaseGetAll';
const BackupFileGetAll = 'BackupFileGetAll';
export default function clusterReducer(state = null, data) {
    switch (data.type) {
        case BackupDatabaseGetAll:
            return Object.assign({}, state, { dbs: data.items });
        case BackupFileGetAll:
            return Object.assign({}, state, { files: data.items });
        default:
            return state;
    }
}

// Actions backup dbs------------------------------------------------------------------------------------------------------------
export function getBackupDatabaseAll() {
    return dispatch => {
        const url = '/api/backup/database/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy backup bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: BackupDatabaseGetAll, items: data.items });
            }
        }, error => console.error(error) || T.notify('Lấy backup bị lỗi!', 'danger'));
    };
}

export function createBackupDatabase(done) {
    return dispatch => {
        const url = '/api/backup/database';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo backup bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo backup thành công!', 'success');
                dispatch(getBackupDatabaseAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Tạo backup bị lỗi!', 'danger'));
    };
}

export function deleteBackupDatabase(filename) {
    return dispatch => {
        const url = '/api/backup/database';
        T.delete(url, { filename }, data => {
            if (data.error) {
                T.notify('Xóa backup bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa backup thành công!', 'error', false, 800);
                dispatch(getBackupDatabaseAll());
            }
        }, error => console.error(error) || T.notify('Xóa backup bị lỗi!', 'danger'));
    };
}

export function downloadBackupDatabase(fileName) {
    return () => {
        T.get(`/api/backup/database/download/${fileName}`, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tải file đính kèm lỗi!', 'danger');
            } else {
                let link = document.createElement('a');
                link.target = '_blank';
                link.download = fileName;
                link.href = '/api/backup/database/download/' + fileName;
                link.click();
            }
        }, () => T.notify('Tải file đính kèm bị lỗi!', 'danger'));
    };
}

export function restoreBackupDatabase(fileName,done) {

    return dispatch => {
        const url = '/api/backup/database/restore';
        T.post(url,{fileName}, data => {
            if (data.error) {
                T.notify('Restore dữ liệu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Restore dữ liệu thành công!', 'success');
                dispatch(getBackupDatabaseAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Restore dữ liệu bị lỗi!', 'danger'));
    };
}

// Actions backup File------------------------------------------------------------------------------------------------------------
export function getBackupFileAll() {
    return dispatch => {
        const url = '/api/backup/file/all';
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy backup bị lỗi!', 'danger');
                console.error(`GET: ${url}. ${data.error}`);
            } else {
                dispatch({ type: BackupFileGetAll, items: data.items });
            }
        }, error => console.error(error) || T.notify('Lấy backup bị lỗi!', 'danger'));
    };
}

export function createBackupFile(done) {
    return dispatch => {
        const url = '/api/backup/file';
        T.post(url, data => {
            if (data.error) {
                T.notify('Tạo backup bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Tạo backup thành công!', 'success');
                dispatch(getBackupFileAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Tạo backup bị lỗi!', 'danger'));
    };
}

export function deleteBackupFile(filename) {
    return dispatch => {
        const url = '/api/backup/file';
        T.delete(url, { filename }, data => {
            if (data.error) {
                T.notify('Xóa backup bị lỗi!', 'danger');
                console.error(`DELETE: ${url}. ${data.error}`);
            } else {
                T.alert('Xóa backup thành công!', 'error', false, 800);
                dispatch(getBackupFileAll());
            }
        }, error => console.error(error) || T.notify('Xóa backup bị lỗi!', 'danger'));
    };
}

export function downloadBackupFile(fileName) {
    return () => {
        T.get(`/api/backup/file/download/${fileName}`, data => {
            if (data.error) {
                T.notify(data.error.message ? data.error.message : 'Tải file đính kèm lỗi!', 'danger');
            } else {
                let link = document.createElement('a');
                link.target = '_blank';
                link.download = fileName;
                link.href = '/api/backup/file/download/' + fileName;
                link.click();
            }
        }, () => T.notify('Tải file đính kèm bị lỗi!', 'danger'));
    };
}

export function restoreBackupFile(fileName,done) {

    return dispatch => {
        const url = '/api/backup/file/restore';
        T.post(url,{fileName}, data => {
            if (data.error) {
                T.notify('Restore dữ liệu bị lỗi!', 'danger');
                console.error(`POST: ${url}. ${data.error}`);
            } else {
                T.notify('Restore dữ liệu thành công!', 'success');
                dispatch(getBackupFileAll());
                done && done();
            }
        }, error => console.error(error) || T.notify('Restore dữ liệu bị lỗi!', 'danger'));
    };
}