import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson, createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo } from './redux/reduxLesson';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';


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
                this.props.updateLessonVideo(_id, changes, this.props._id, () => {
                    T.notify('Cập nhật video bài giảng thành công!', 'success');
                    $(this.modal.current).modal('hide');
                });
            } else { // Create
                this.props.createLessonVideo(this.props._id, changes, () => {
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
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class adminEditLessonVideo extends React.Component {
    state = { item: null };
    editor = React.createRef();

    componentDidMount() {
        this.videoModal = React.createRef();
        T.ready('/user/dao-tao/bai-hoc/list', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLessonVideoList(params._id);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                } else if (data.item) {
                    this.setState(data);

                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc/list');
                }
            });
        });
    }

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

    removeLessonVideo = (e, item, index, _id) => {
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa video <strong>${item.title.viText()}</strong>?`, true, isConfirm => {
            if (isConfirm) {
                const changes = {};
                let lessonVideoList = this.props.lesson && this.props.lesson.listLessonVideo ? this.props.lesson.listLessonVideo.lessonVideo : [];
                lessonVideoList.splice(index, 1);
                if (lessonVideoList.length == 0) lessonVideoList = 'empty';
                changes.lessonVideo = lessonVideoList;
                this.props.deleteLessonVideo(item._id, changes, _id, () => {
                    T.alert('Xoá video thành công!', 'success', false, 1000);
                })
            } else {
                T.alert('Cancelled!', 'error', false, 500);
            }
        });
        e.preventDefault();
    };

    swap = (e, index, _id, isMoveUp) => {
        let lessonVideoList = this.props.lesson && this.props.lesson.listLessonVideo && this.props.lesson.listLessonVideo.lessonVideo ? this.props.lesson.listLessonVideo.lessonVideo : [];
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
                    this.props.swapLessonVideo(_id, changes, () => {
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
                    this.props.swapLessonVideo(_id, changes, () => {
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
                    });
                }
            }
        }
        e.preventDefault();
    };

    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
        const _id = params._id;
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const readOnly = !currentPermissions.includes('lesson:write');
        let table = 'Chưa có bài học!';
        if (this.props.lesson && this.props.lesson.listLessonVideo && this.props.lesson.listLessonVideo.lessonVideo && this.props.lesson.listLessonVideo.lessonVideo.length > 0) {
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
                        {this.props.lesson.listLessonVideo.lessonVideo.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'#'}>{item.title}</Link></td>
                                <td><Link to={'#'}>{item.link}</Link></td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a key={0} className='btn btn-success' href='#' onClick={e => this.swap(e, index, _id, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>,
                                            <a key={1} className='btn btn-success' href='#' onClick={e => this.swap(e, index, _id, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {currentPermissions.contains('lesson:write') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.removeLessonVideo(e, item, index, _id)}>
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
                <div className='tile-footer' style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-success' onClick={this.create}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                                    </button>
                </div>

                <VideoModal _id={_id} createLessonVideo={this.props.createLessonVideo} updateLessonVideo={this.props.updateLessonVideo} ref={this.videoModal} readOnly={readOnly} />
                <Link to='/user/dao-tao/bai-hoc/list' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}><i className='fa fa-lg fa-reply' /></Link>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson, question: state.question });
const mapActionsToProps = { updateLesson, getLesson, createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo };
export default connect(mapStateToProps, mapActionsToProps)(adminEditLessonVideo);
