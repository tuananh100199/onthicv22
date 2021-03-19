import React from 'react';
import { connect } from 'react-redux';
import { updateLesson, getLesson, createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo } from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { AdminModal, FormTextBox, BackButton } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    modal = React.createRef();
    imageBox = React.createRef();
    state = React.createRef();

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image } = video ? video : { _id: null, title: '', link: '', image: '' };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.current.setData('lesson-video:' + (_id ? _id : 'new'));
        this.setState({ image });
        $(this.modal.current).data('_id', _id).modal('show');
    }

    onSubmit = () => {
        const _id = $(this.modal.current).data('_id');
        let newData = {
            title: this.itemTitle.value(),
            link: this.itemLink.value(),
        };
        if (newData.title == '') {
            T.notify('Tên video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (newData.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            !_id ?
                this.props.createLessonVideo(this.props._id, newData, () => {
                    T.notify('Thêm video bài giảng thành công!', 'success');
                    this.hide();
                })
                : this.props.updateLessonVideo(_id, newData, this.props._id, () => {
                    T.notify('Cập nhật video bài giảng thành công!', 'success');
                    this.hide();
                })
        }
    }

    render = () => this.renderModal({
        title: 'Video mới',
        size: 'large',
        body:
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên video' />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' />
                </div>
                <div className='col-md-4'>
                    <label>Hình đại diện</label>
                    <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='LessonVideoImage' image={this.state.image} />
                </div>
            </div>
    });
}

class adminEditLessonVideo extends React.Component {
    state = { item: null };
    modal = React.createRef();

    componentDidMount() {
        this.videoModal = React.createRef();
        T.ready('/user/dao-tao/bai-hoc', () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            this.props.getLessonVideoList(params._id);
            this.props.getLesson(params._id, data => {
                if (data.error) {
                    T.notify('Lấy bài học bị lỗi!', 'danger');
                    this.props.history.push('/user/dao-tao/bai-hoc');
                } else if (data.item) {
                    this.setState(data);

                } else {
                    this.props.history.push('/user/dao-tao/bai-hoc');
                }
            });
        });
    }

    create = (e) => {
        this.modal.current.show(null);
        e.preventDefault();
    }

    edit = (e, item) => {
        this.props.getLessonVideo(item._id, video => this.modal.current.show(video));
        e.preventDefault();
    }

    removeLessonVideo = (e, item, index, _id) => {
        e.preventDefault();
        T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa video <strong>${item.title}</strong>?`, true, isConfirm => {
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
    }

    swap = (e, index, _id, isMoveUp) => {
        e.preventDefault();
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
                        T.notify('Thay đổi thứ tự bài học thành công', 'success');
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
    };

    render() {
        let url = window.location.pathname,
            params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
        const _id = params._id;
        const lessonVideo = this.props.lesson && this.props.lesson.listLessonVideo && this.props.lesson.listLessonVideo.lessonVideo ?
            this.props.lesson.listLessonVideo.lessonVideo : []
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = 'Chưa có bài học!';
        if (lessonVideo && lessonVideo.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên bài học</th>
                            <th style={{ width: 'auto' }}>Link</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessonVideo.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><Link to={'#'}>{item.title}</Link></td>
                                <td><Link to={'#'}>{item.link}</Link></td>
                                <td style={{ textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, _id, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, _id, false)}>
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
        return <>
            <div className='tile-body'>
                {table}
                <div style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-success' onClick={this.create}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                    </button>
                </div>
            </div>
            <VideoModal _id={_id} ref={this.modal} createLessonVideo={this.props.createLessonVideo} updateLessonVideo={this.props.updateLessonVideo} />
            <BackButton to='/user/dao-tao/bai-hoc' />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = { updateLesson, getLesson, createLessonVideo, getLessonVideoList, swapLessonVideo, deleteLessonVideo, getLessonVideo, updateLessonVideo };
export default connect(mapStateToProps, mapActionsToProps)(adminEditLessonVideo);
