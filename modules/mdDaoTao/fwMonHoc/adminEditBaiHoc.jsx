import React from 'react';
import { connect } from 'react-redux';
import { updateMonHoc, getMonHoc, getLessonList, addLesson, swapLesson, deleteLesson } from './redux';
import { Link } from 'react-router-dom';
import { Select } from 'view/component/Input';
import { ajaxSelectLesson } from '../fwBaiHoc/redux/redux';
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
            T.notify('Thêm bài học thành công!', 'success');
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

class AdminEditListBaiHoc extends React.Component {
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
                    this.setState(data);
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
            T.notify('Thay đổi thứ tự bài học thành công', 'success');
        } else {
            if (isMoveUp) {
                if (index == 0) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonList[index - 1], changes = {};

                    lessonList[index - 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapLesson(monHocId, changes, () => {
                        T.notify('Thay đổi thứ tự môn học thành công', 'success');
                    });
                }
            } else {
                if (index == lessonList.length - 1) {
                    T.notify('Thay đổi thứ tự bài học thành công', 'success');
                } else {
                    const temp = lessonList[index + 1], changes = {};

                    lessonList[index + 1] = lessonList[index];
                    lessonList[index] = temp;

                    changes.lesson = lessonList;
                    this.props.swapLesson(monHocId, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
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
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('lesson:write');
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

        return (
            <div>
                <div className='tile-body'>{table}</div>
                {readOnly ? null :
                    <div className='tile-footer' style={{ textAlign: 'right' }}>
                        <Tooltip placement='bottom' overlay='Thêm bài học mới'>
                            <button type='button' className='btn btn-success' onClick={this.showAddLessonModal}>
                                <i className='fa fa-lg fa-plus' /> Thêm
                                </button>
                        </Tooltip>
                    </div>
                }
                <Link to='/user/dao-tao/mon-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
                <AddLessonModal key={2} ref={this.addLessonModal} addLesson={this.props.addLesson} monhocId={monhocId} />
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { updateMonHoc, getMonHoc, getLessonList, addLesson, swapLesson, deleteLesson };
export default connect(mapStateToProps, mapActionsToProps)(AdminEditListBaiHoc);
