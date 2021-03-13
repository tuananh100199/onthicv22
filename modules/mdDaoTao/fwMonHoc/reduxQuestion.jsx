import T from 'view/js/common';

// Reducer -------------------------------------------------------------------------------------------------------------
const GET_QUESTIONS_LIST = 'question:getQuestionsList';

export default function questionReducer(state = {}, data) {
    switch (data.type) {
        case GET_QUESTIONS_LIST:
            return Object.assign({}, state, { questions: data.questions });

        default:
            return state;
    }
}

// Actions (admin) ----------------------------------------------------------------------------------------------------
export function getQuestionsList(subjectId, done) {
    return dispatch => {
        const url = `/api/feedback-question/${subjectId}`;
        T.get(url, data => {
            if (data.error) {
                T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                console.error('GET: ' + url + '.', data.error);
            } else {
                dispatch({ type: GET_QUESTIONS_LIST, questions: data.item });
                done && done(data.item);
            }
        }, error => {
            console.error('GET: ' + url + '.', error);
        });
    }
}

export function createQuestion(_id, data, done) {
    return dispatch => {
        const url = `/api/feedback-question/${_id}`;
        T.post(url, { data }, data => {
            if (data.error) {
                T.notify('Tạo câu hỏi bị lỗi!', 'danger');
                console.error('POST: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(_id));
                done && done(data.item);
            }
        }, error => console.error('POST: ' + url + '.', error));
    }
}

export function updateQuestion(_id, data, subjectId, done) {
    return dispatch => {
        const url = '/api/feedback-question';
        console.log(data)
        T.put(url, { _id, data }, data => {
            if (data.error) {
                T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function swapQuestion(subjectId, data, done) {
    return dispatch => {
        const url = `/api/feedback-question/swap`;
        T.put(url, { subjectId, data }, data => {
            if (data.error) {
                T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                console.error('PUT: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('PUT: ' + url + '.', error));
    }
}

export function deleteQuestion(_id, data, subjectId, done) {
    return dispatch => {
        const url = `/api/feedback-question`;
        T.delete(url, { data, subjectId, _id }, data => {
            if (data.error) {
                T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                console.error('DELETE: ' + url + '.', data.error);
            } else {
                dispatch(getQuestionsList(subjectId));
                done && done();
            }
        }, error => console.error('DELETE: ' + url + '.', error));
    }
}
