import React from 'react';
import { connect } from 'react-redux';
import { updateMonHoc, getMonHoc, getLessonList, addLesson, swapLesson, deleteLesson } from './redux.jsx'
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import { Select } from '../../view/component/Input.jsx';
import { ajaxSelectLesson } from '../fwBaiHoc/redux/redux.jsx';
import Tooltip from 'rc-tooltip';


class AddLessonModal extends React.Component {
    modal = React.createRef();
    lessonSelect = React.createRef();

    show = () => {
        this.lessonSelect.current.val(null);
        $(this.modal.current).modal('show');
    }

    addLesson = () => {
        const lessonId = this.lessonSelect.current.val();
        this.props.addLesson(this.props.monhocId, lessonId, () => {
            T.notify('Thêm bài học thành công!', 'info');
            $(this.modal.current).modal('hide');
        });
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thêm bài học</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>

                        <div className='modal-body'>
                            <div className='form-group'>
                                <label>Chọn bài học</label>
                                <Select ref={this.lessonSelect} displayLabel={false} adapter={ajaxSelectLesson} label='Bài học' />
                            </div>
                        </div>

                        <div className='modal-footer'>
                            <button type='button' className='btn btn-success' onClick={this.addLesson}>Thêm</button>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class AdminEditMonHoc extends React.Component {
    state = { item: null };
    editor = React.createRef();
    constructor(props) {
        super(props);
        this.addLessonModal = React.createRef();
    }
    componentDidMount() {
        T.ready('/user/dao-tao/mon-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:monHocId').parse(url);
            this.props.getLessonList(params.monHocId);
            this.props.getMonHoc(params.monHocId, data => {
                if (data.error) {
                    T.notify('Lấy môn học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/mon-hoc/list');
                } else if (data.item) {
                    const item = data.item;
                    $('#title').val(item.title);
                    $('#shortDescription').val(item.shortDescription);
                    this.editor.current.html(item.detailDescription);
                    this.setState(data);
                    $('#title').focus();
                } else {
                    this.props.history.push('/user/dao-tao/mon-hoc/list');
                }
            });
        });
    }
    showAddLessonModal = e => {
        e.preventDefault();
        this.addLessonModal.current.show();
    }
    delete = (e, monhocId, lessonId, lessonTitle) => {
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa bài ' + lessonTitle + ' khỏi môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteLesson(monhocId, lessonId));
        e.preventDefault();
    }
    save = () => {
        const changes = {
            title: $('#title').val().trim(),
            shortDescription: $('#shortDescription').val().trim(),
            detailDescription: this.editor.current.html(),
        };
        this.props.updateMonHoc(this.state.item._id, changes)
    };
    swap = (e, index, monHocId, isMoveUp) => {
        let lessonList = this.props.subject && this.props.subject.listbaihoc && this.props.subject.listbaihoc.lesson ? this.props.subject.listbaihoc.lesson : [];
        if (lessonList.length == 1) {
            T.notify('Thay đổi thứ tự bài học thành công', 'info');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'info');
                } else {
                    const temp = lessonList[index - 1], changes = {};

                    lessonList[index - 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapLesson(monHocId, changes, () => {
                        T.notify('Thay đổi thứ tự môn học thành công', 'info');
                    });
                }
            } else {
                if (index == lessonList.length - 1) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'info');
                } else {
                    const temp = lessonList[index + 1], changes = {};

                    lessonList[index + 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapLesson(monHocId, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'info');
                    });
                }
            }
        }
        e.preventDefault();
    };
    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/mon-hoc/edit/:monHocId').parse(url);
        const monhocId = params.monHocId;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('lesson:write');
        const item = this.state.item ? this.state.item : {
            title: ''
        };
        let table = 'Chưa có bài học!';
        if (this.props.subject && this.props.subject.listbaihoc && this.props.subject.listbaihoc.lesson && this.props.subject.listbaihoc.lesson.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên bài học</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.subject.listbaihoc.lesson.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'/user/dao-tao/bai-hoc/view/' + item._id}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, index, monhocId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, index, monhocId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <Link to={'/user/dao-tao/bai-hoc/view/' + item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, monhocId, item._id, item.title)}>
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
        return [
            <main className='app-content' key={1}>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-file' /> Môn học: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: item.title != '' ? 'Tiêu đề: <b>' + item.title + '</b> ' : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/dao-tao/mon-hoc/list'>Danh sách môn học</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-12 col-md-12'>
                        <div className='tile'>
                            <div className='tile-body'>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Tên môn học</label>
                                        <input className='form-control' type='text' placeholder='Tên loại khóa học' id='title' readOnly={readOnly} />
                                    </div>
                                    {/* <div className='form-group col-sm-12 col-md-8 col-lg-6'>
                                        <label className='control-label'>Giá loại khóa học</label>
                                        <input className='form-control' type='number' placeholder='Giá loại khóa học' id='price' readOnly={readOnly} />
                                    </div> */}
                                </div>

                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả ngắn gọn</label>
                                        <textarea defaultValue='' className='form-control' id='shortDescription' placeholder='Mô tả ngắn gọn' readOnly={readOnly}
                                            rows={2} />
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='form-group col-sm-12'>
                                        <label className='control-label'>Mô tả chi tiết </label>
                                        <Editor ref={this.editor} height='400px' placeholder='Mô tả chi tiết' uploadUrl='/user/upload?category=courseType' readOnly={readOnly} />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-end' >
                                    <button type='button' className='btn btn-primary' onClick={this.save} >Lưu</button>
                                </div>
                            </div>
                            {/* <div className='tile-footer d-flex justify-content-end'>
                                <button type='button' className='btn btn-primary' onClick={this.save} >Lưu</button>
                            </div> */}
                        </div>
                        <div className='tile'>
                            <div className='tile-body'>
                                <label className='control-label'>Danh sách bài học </label>
                                <div>{table}</div>
                            </div>

                            {/* {!readOnly &&
                                <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.save}>
                                    <i className='fa fa-lg fa-save' />
                                </button>} */}
                        </div>

                    </div>
                </div>

                <Link to='/user/dao-tao/mon-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>

                <Tooltip placement='bottom' overlay='Thêm bài học mới'>
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.showAddLessonModal}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                </Tooltip>
            </main>,
            <AddLessonModal key={2} ref={this.addLessonModal} addLesson={this.props.addLesson} monhocId={monhocId} />
        ];
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { updateMonHoc, getMonHoc, getLessonList, addLesson, swapLesson, deleteLesson };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditMonHoc);
