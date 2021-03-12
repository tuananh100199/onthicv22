import React from 'react';
import { connect } from 'react-redux';
import { updateBaiHoc, getBaiHoc } from './redux/redux.jsx'
import { createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo } from './redux/reduxLessonVideo.jsx'
import { getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion } from './redux/reduxQuestion.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';
import Select from 'react-select';

class VideoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#videoTitle').focus());
        }, 250));
    }

    show = (video) => {
        let { _id, title, link, image } = video ? video : { _id: null, title: '', link: '', image: '' };

        $(this.btnSave.current).data('id', _id);
        $('#videoTitle').val(title);
        $('#videoLink').val(link);
        this.imageBox.current.setData('lesson-video:' + (_id ? _id : 'new'));
        this.setState({ image });
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const _id = $(this.btnSave.current).data('id'),
            changes = {
                title: $('#videoTitle').val().trim(),
                link: $('#videoLink').val().trim(),
            };
        if (changes.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            $('#videoTitle').focus();
        } else if (changes.link == '') {
            T.notify('Link video bị trống!', 'danger');
            $('#videoLink').focus();
        } else {
            if (_id) {
                this.props.updateLessonVideo(_id, changes, this.props.baihocId, () => {
                    T.notify('Cập nhật video bài giảng thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else { // Create
                this.props.createLessonVideo(this.props.baihocId, changes, () => {
                    T.notify('Thêm video bài giảng thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            }
        }
        event.preventDefault();
    }

    render() {
        const readOnly = this.props.readOnly;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={e => this.save(e)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin video</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='tab-pane fade show active'>
                                <div className='form-group'>
                                    <label htmlFor='videoTitle'>Tiêu đề</label>
                                    <input className='form-control' id='videoTitle' type='text' placeholder='Tiêu đề video' readOnly={readOnly} />
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-8'>
                                    <div className='form-group'>
                                        <label htmlFor='videoLink'>Đường dẫn</label>
                                        <input className='form-control' id='videoLink' type='text' placeholder='Link' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='col-4'>
                                    <div className='form-group'>
                                        <label>Hình đại diện</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='LessonVideoImage' image={this.state.image} readOnly={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class QuestionModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemID: null,
            value: [],
            active: false,
        };

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = React.createRef();
        this.dataType = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#questionTitle').focus()), 250);
        });
    }


    show = (item) => {
        let { title, defaultAnswer, content, typeValue, active } = item ?
            item : { title: '', defaultAnswer: '', content: '', typeValue: [], active: false, };
        $(this.btnSave.current).data('isNewMember', item == null);
        $('#questionTitle').val(title);
        $('#questionDefault').val(defaultAnswer);
        $('#questionAnswer').val(typeValue.join('\n'));
        this.editor.current.html(content ? content : '');
        $(this.modal.current).modal('show');
    };

    hide = () => {
        $(this.modal.current).modal('hide');
    };

    changeActive = (event) => {
        this.setState({ active: event.target.checked });
    };

    onSelectType = (selectedItem) => {
        this.setState({ selectedItem });
    };

    save = (event) => {
        const itemId = this.state.itemId, btnSave = $(this.btnSave.current), isNewMember = btnSave.data('isNewMember');
        const answerString = $('#questionAnswer').val();
        let ret = (answerString ? answerString : '').split('\n');
        for (let i = 0; i < ret.length; i++) {
            if (ret[i] == '') ret.splice(i, 1);
        }

        const changes = {
            title: $('#questionTitle').val().trim(),
            defaultAnswer: $('#questionDefault').val() ? $('#questionDefault').val().trim() : '',
            content: this.editor.current.html(),
            active: this.state.active,
            typeValue: ret,
        };

        if (changes.title == '') {
            T.notify('Tên câu hỏi bị trống', 'danger');
            $('#questionTitle').focus();
        } else {
            if (isNewMember) {
                this.props.add(changes);
                this.hide();
            } else {
                const updateChanges = changes;
                if (updateChanges.typeValue.length == 0 || updateChanges.typeValue[0] == '') updateChanges.typeValue = 'empty';
                this.props.update(itemId, updateChanges);
                this.hide();
            }

        }
        event.preventDefault();
    };

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document'
                    onSubmit={e => this.save(e, this.state.itemId, true)}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin câu hỏi</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor='questionTitle'>Tên câu hỏi</label>
                                    <input type='text' className='form-control' id='questionTitle' />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-4'>
                                    <label>Kích hoạt</label>
                                    <div className='col-12 col-sm-12 toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.active} onChange={this.changeActive} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor=''>Nội dung câu hỏi</label>
                                    <Editor ref={this.editor} />
                                </div>
                            </div>

                            <div className='form-group row'>
                                <div key={0} className='col-12'>
                                    <label>Danh sách câu trả lời</label>
                                    <textarea defaultValue='' className='form-control' id='questionAnswer' style={{ width: '100%', minHeight: '100px', padding: '0 3px' }} />
                                </div>
                            </div>
                            <div className='form-group row'>
                                <div className='col-12'>
                                    <label htmlFor='questionDefault'>Đáp án</label>
                                    <input type='text' className='form-control' id='questionDefault' />
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class adminEditBaiHoc extends React.Component {
    state = { item: null };
    editor = React.createRef();
    create = (e) => {
        this.videoModal.current.show(null);
        e.preventDefault();
    }

    edit = (e, item) => {
        this.props.getLessonVideo(item._id, video => {
            this.videoModal.current.show(video);
        });
        e.preventDefault();
    }
    removeLessonVideo = (e, item, index, baihocId) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa video <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let lessonVideoList = this.props.baihoc && this.props.baihoc.listLessonVideo ? this.props.baihoc.listLessonVideo.lessonVideo : [];
                lessonVideoList.splice(index, 1);
                if (lessonVideoList.length == 0) lessonVideoList = 'empty';
                changes.lessonVideo = lessonVideoList;
                this.props.deleteLessonVideo(item._id, changes, baihocId, () => {
                    T.alert('Xoá video thành công!', 'success', false, 1000);
                })
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
        e.preventDefault();
    };
    componentDidMount() {
        this.videoModal = React.createRef();
        this.questionModal = React.createRef();
        // this.props.createLessonVideo('60477298b01ec13de4752295', { title: 'hello', link: 'hi' }, () => {
        //     T.notify('Thêm câu hỏi thành công!', 'info');
        //     $(this.modal.current).modal('hide');
        // });
        T.ready('/user/dao-tao/bai-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:baihocId').parse(url);
            this.props.getLessonVideoList(params.baihocId);
            this.props.getQuestionsList(params.baihocId);
            this.props.getBaiHoc(params.baihocId, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#title').val(item.title);
                    $('#shortDescription').val(item.shortDescription);
                    this.editor.current.html(item.detailDescription);
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                }
            });
        });
    }
    save = () => {
        const changes = {
            title: $('#title').val().trim(),
            shortDescription: $('#shortDescription').val().trim(),
            detailDescription: this.editor.current.html(),
        };
        this.props.updateBaiHoc(this.state.item._id, changes)
    };
    swap = (e, index, baihocId, isMoveUp) => {
        let lessonVideoList = this.props.baihoc && this.props.baihoc.listLessonVideo && this.props.baihoc.listLessonVideo.lessonVideo ? this.props.baihoc.listLessonVideo.lessonVideo : [];
        if (lessonVideoList.length == 1) {
            T.notify('Thay đổi thứ tự bài học thành công', 'success');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonVideoList[index - 1], changes = {};

                    lessonVideoList[index - 1] = lessonVideoList[index];
                    lessonVideoList[index] = temp;

                    changes.lessonVideo = lessonVideoList;
                    this.props.swapLessonVideo(baihocId, changes, () => {
                        T.notify('Thay đổi thứ tự môn học thành công', 'success');
                    });
                }
            } else {
                if (index == lessonVideoList.length - 1) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonVideoList[index + 1], changes = {};

                    lessonVideoList[index + 1] = lessonVideoList[index];
                    lessonVideoList[index] = temp;

                    changes.lessonVideo = lessonVideoList;
                    this.props.swapLessonVideo(baihocId, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
                    });
                }
            }
        }
        e.preventDefault();
    };
    addQuestion = (data) => {
        this.props.createQuestion(this.state.item._id, data, () => {
            T.notify('Thêm câu hỏi thành công!', 'success');
        });
    };
    showQuestionModal = (e, item) => {
        this.questionModal.current.show(item);
        e.preventDefault();
    };
    swapQ = (e, index, isMoveUp) => {
        let questionList = this.props.question && this.props.question.questions ? this.props.question.questions.lessonQuestion : [];
        if (questionList.length == 1) {
            T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                } else {
                    const temp = questionList[index - 1], changes = {};
                    questionList[index - 1] = questionList[index];
                    questionList[index] = temp;
                    changes.lessonQuestion = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            } else {
                if (index == questionList.length - 1) {
                    T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                } else {
                    const temp = questionList[index + 1], changes = {};

                    questionList[index + 1] = questionList[index];
                    questionList[index] = temp;

                    changes.questions = questionList;
                    this.props.swapQuestion(this.state.item._id, changes, () => {
                        T.notify('Thay đổi thứ tự câu hỏi thành công', 'success');
                    });
                }
            }
        }
        e.preventDefault();
    };
    updateQuestion = (_id, changes) => {
        this.props.updateQuestion(_id, changes, this.state.item._id, () => {
            T.notify('Cập nhật câu hỏi thành công!', 'success');
        })
    };
    removeQuestion = (e, item, index) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa câu hỏi <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let questionList = this.props.question && this.props.question.questions ? this.props.question.questions.lessonQuestion : [];
                questionList.splice(index, 1);
                if (questionList.length == 0) questionList = 'empty';
                changes.questions = questionList;
                this.props.deleteQuestion(item._id, changes, this.state.item._id, () => {
                    T.alert('Xoá câu hỏi thành công!', 'success', false, 1000);
                })
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
        e.preventDefault();
    };

    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:baihocId').parse(url);
        const baihocId = params.baihocId;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('lesson:write');
        const item = this.state.item ? this.state.item : {
            title: ''
        };
        let table = 'Chưa có bài học!';
        if (this.props.baihoc && this.props.baihoc.listLessonVideo && this.props.baihoc.listLessonVideo.lessonVideo && this.props.baihoc.listLessonVideo.lessonVideo.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên bài học</th>
                            <th style={{ width: 'auto' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.baihoc.listLessonVideo.lessonVideo.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'#'}>{item.title}</Link></td>
                                <td><Link to={'#'}>{item.link}</Link></td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, index, baihocId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, index, baihocId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.removeLessonVideo(e, item, index, baihocId)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        let table_question = 'Chưa có câu hỏi!';
        if (this.props.question && this.props.question.questions && this.props.question.questions.lessonQuestion && this.props.question.questions.lessonQuestion.length > 0) {
            table_question = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên câu hỏi</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.question.questions.lessonQuestion.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'#'}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <a key={0} className='btn btn-success' href='#' onClick={e => this.swapQ(e, index, baihocId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swapQ(e, index, baihocId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <a className='btn btn-primary' href='#' onClick={e => this.showQuestionModal(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.removeQuestion(e, item, index, baihocId)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Bài học: {item.title || ''}</h1>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/dao-tao/bai-hoc/list'>Bài học</Link>&nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Tên bài học</label>
                                    <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Mô tả ngắn gọn</label>
                                    <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly} rows={2} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Mô tả chi tiết </label>
                                    <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                                </div>
                            </div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button type='button' className='btn btn-primary' onClick={this.save}>
                                    <i className='fa fa-lg fa-save' /> Lưu
                                </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Bài giảng video</h3>
                            <div className='tile-body'>{table}</div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button type='button' className='btn btn-success' onClick={this.create}>
                                    <i className='fa fa-lg fa-plus' /> Thêm
                                    </button>
                            </div>
                        </div>

                        <div className='tile'>
                            <h3 className='tile-title'>Câu hỏi</h3>
                            <div className='tile-body'>{table_question}</div>
                            <div className='tile-footer' style={{ textAlign: 'right' }}>
                                <button type='button' className='btn btn-success' onClick={e => this.showQuestionModal(e, null)}>
                                    <i className='fa fa-lg fa-plus' /> Thêm
                                    </button>
                            </div>
                        </div>
                    </div>
                    <VideoModal baihocId={baihocId} createLessonVideo={this.props.createLessonVideo} updateLessonVideo={this.props.updateLessonVideo} ref={this.videoModal} readOnly={readOnly} />
                    <QuestionModal key={1} add={this.addQuestion} update={this.updateQuestion} ref={this.questionModal} />
                </div>
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>

            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, baihoc: state.baihoc, question: state.question });
const mapActionsToProps = { updateBaiHoc, getBaiHoc, createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo, getQuestionsList, createQuestion, updateQuestion, swapQuestion, deleteQuestion };
export default connect(mapStateToProps, mapActionsToProps)(adminEditBaiHoc);
