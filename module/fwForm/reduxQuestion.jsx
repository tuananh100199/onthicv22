import T from '../../view/js/common';

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
export function getQuestionsList(formId, done) {
     return dispatch => {
          const url = `/api/questions/${formId}`;
          T.get(url, data => {
               if (data.error) {
                    T.notify('Lấy danh sách câu hỏi bị lỗi!', 'danger');
                    console.error('GET: ' + url + '.', data.error);
               } else {
                    dispatch({ type: GET_QUESTIONS_LIST, questions: data.item.questions });
                    done && done(data.item);
               }
          }, error => {
               console.error('GET: ' + url + '.', error);
          });
     }
}

export function createQuestion(_id, data, done) {
     return dispatch => {
          const url = `/api/question/${_id}`;
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

export function updateQuestion(_id, data, formId, done) {
     return dispatch => {
          const url = '/api/question';
          T.put(url, { _id, data }, data => {
               if (data.error) {
                    T.notify('Cập nhật câu hỏi bị lỗi!', 'danger');
                    console.error('PUT: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('PUT: ' + url + '.', error));
     }
}

export function swapQuestion(formId, data, done) {
     return dispatch => {
          const url = `/api/question/swap`;
          T.put(url, { formId, data }, data => {
               if (data.error) {
                    T.notify('Thay đổi thứ tự câu hỏi bị lỗi!', 'danger');
                    console.error('PUT: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('PUT: ' + url + '.', error));
     }
}

export function deleteQuestion(_id, data, formId, done) {
     return dispatch => {
          const url = `/api/question`;
          T.delete(url, { data, formId, _id }, data => {
               if (data.error) {
                    T.notify('Xóa câu hỏi bị lỗi!', 'danger');
                    console.error('DELETE: ' + url + '.', data.error);
               } else {
                    dispatch(getQuestionsList(formId));
                    done && done();
               }
          }, error => console.error('DELETE: ' + url + '.', error));
     }
}
