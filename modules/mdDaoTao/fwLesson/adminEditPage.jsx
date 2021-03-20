import React from 'react';
import { connect } from 'react-redux';
import {
    getLesson, updateLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo
} from './redux';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, BackButton } from 'view/component/AdminPage';
// import AdminEditLessonQuestion from './adminEditQuestionTab';

class VideoModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image } = video ? video : { _id: null, title: '', link: '', image: '' };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.setData('lesson-video:' + (_id ? _id : 'new'));

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const _id = this.state._id,
            data = {
                title: this.itemTitle.value(),
                link: this.itemLink.value(),
            };
        if (data.title == '') {
            T.notify('Tên video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            if (_id) {
                this.props.update(this.props.lessonId, _id, data, () => {
                    T.notify('Cập nhật video bài giảng thành công!', 'success');
                    this.hide();
                });
            } else {
                this.props.create(this.props.lessonId, data, () => {
                    T.notify('Thêm video bài giảng thành công!', 'success');
                    this.hide();
                });
            }
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
                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='LessonVideoImage' image={this.state.image} />
                </div>
            </div>
    });
}

const adminPageLink = '/user/dao-tao/bai-hoc';
class adminEditPage extends AdminPage {
    state = {};

    componentDidMount() {
        T.ready(adminPageLink, () => {
            let url = window.location.pathname,
                params = T.routeMatcher('/user/dao-tao/bai-hoc/edit/:_id').parse(url);
            if (params._id) {
                this.props.getLesson(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy bài học bị lỗi!', 'danger');
                        this.props.history.push(adminPageLink);
                    } else if (data.item) {
                        const { _id, title, shortDescription, detailDescription } = data.item;
                        this.itemTitle.value(title);
                        this.itemDescription.value(shortDescription);
                        this.itemEditor.html(detailDescription);

                        this.setState({ _id, title });
                        this.itemTitle.focus();
                    } else {
                        this.props.history.push(adminPageLink);
                    }
                });
            } else {
                this.props.history.push(adminPageLink);
            }
        });
    }

    saveInfo = () => {
        const changes = {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.html(),
        };
        this.props.updateLesson(this.state._id, changes);
    }

    createVideo = e => e.preventDefault() || this.modalVideo.show();
    editVideo = (e, video) => e.preventDefault() || this.modalVideo.show(video);
    deleteVideo = (e, video, lessonId) => e.preventDefault() || T.confirm('Xóa Câu hỏi', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonVideo(lessonId, video._id));
    swapVideos = (e, video, lessonId, isMoveUp) => {
        e.preventDefault() || this.props.swapLessonVideo(lessonId, video._id, isMoveUp);
        // let lessonVideoList = this.props.lesson && this.props.lesson.listLessonVideo && this.props.lesson.listLessonVideo.lessonVideo ? this.props.lesson.listLessonVideo.lessonVideo : [];
        // if (lessonVideoList.length == 1) {
        //     T.notify('Thay đổi thứ tự bài học thành công', 'success');
        // } else {
        //     if (isMoveUp) {
        //         if (index == 0) {
        //             T.notify('Thay đổi thứ tự bài học thành công', 'success');
        //         } else {
        //             const temp = lessonVideoList[index - 1], changes = {};

        //             lessonVideoList[index - 1] = lessonVideoList[index];
        //             lessonVideoList[index] = temp;

        //             changes.lessonVideo = lessonVideoList;
        //             this.props.swapLessonVideo(lessonId, changes, () => T.notify('Thay đổi thứ tự bài học thành công', 'success'));
        //         }
        //     } else {
        //         if (index == lessonVideoList.length - 1) {
        //             T.notify('Thay đổi thứ tự bài học thành công', 'success');
        //         } else {
        //             const temp = lessonVideoList[index + 1], changes = {};

        //             lessonVideoList[index + 1] = lessonVideoList[index];
        //             lessonVideoList[index] = temp;

        //             changes.lessonVideo = lessonVideoList;
        //             this.props.swapLessonVideo(lessonId, changes, () => T.notify('Thay đổi thứ tự bài học thành công', 'success'));
        //         }
        //     }
        // }
    };

    render() {
        const permission = this.getUserPermission('lesson'),
            readOnly = !permission.write;
        const { _id: _lessonId, lessonVideo } = this.props.lesson && this.props.lesson.item ? this.props.lesson.item : { lessonVideo: [] };

        let tableVideo = 'Chưa có video!';
        if (lessonVideo && lessonVideo.length > 0) {
            tableVideo = (
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
                                        <a className='btn btn-success' href='#' onClick={e => this.swapVideos(e, item, _lessonId, true)}>
                                            <i className='fa fa-lg fa-arrow-up' />
                                        </a>
                                        <a className='btn btn-success' href='#' onClick={e => this.swapVideos(e, item, _lessonId, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>

                                        <a className='btn btn-primary' href='#' onClick={e => this.editVideo(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {permission.write ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.deleteVideo(e, item, _lessonId)}>
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

        const componentInfo = <>
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='3' readOnly={readOnly} />
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' readOnly={readOnly} />
            </div>
            <div style={{ textAlign: 'right' }}>
                <button type='button' className='btn btn-primary' onClick={this.saveInfo}>
                    <i className='fa fa-lg fa-save' /> Lưu
                </button>
            </div>
        </>;

        const componentVideo = <>
            <div className='tile-body'>
                {tableVideo}
                <div style={{ textAlign: 'right' }}>
                    <button type='button' className='btn btn-success' onClick={this.createVideo}>
                        <i className='fa fa-lg fa-plus' /> Thêm
                    </button>
                </div>
            </div>
            <VideoModal lessonId={this.state._id} ref={e => this.modalVideo = e} create={this.props.createLessonVideo} update={this.props.updateLessonVideo} />
        </>;

        const tabs = [
            { title: 'Thông tin chung', component: componentInfo },
            { title: 'Video', component: componentVideo },
            // { title: 'Câu hỏi', component: <AdminEditLessonQuestion readOnly={readOnly} history={this.props.history} /> },
        ];

        const renderData = {
            icon: 'fa fa-book',
            title: 'Bài học: ' + this.state.title,
            breadcrumb: [<Link to={adminPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <>
                <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
                <BackButton to={adminPageLink} />
            </>,
        };
        return this.renderPage(renderData);
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.lesson });
const mapActionsToProps = {
    getLesson, updateLesson,
    createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo,
};
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);