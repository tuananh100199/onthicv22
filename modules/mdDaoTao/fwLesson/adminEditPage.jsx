import React from 'react';
import { connect } from 'react-redux';
import { getLesson, updateLesson, createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo, changeLessonQuestions } from './redux';
import { Link } from 'react-router-dom';
import { QuestionView } from 'modules/_default/fwQuestion/index';
import { getRateLessonByAdminPage } from 'modules/_default/fwRate/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTabs, FormTextBox, FormRichTextBox, FormEditor, FormCheckbox, FormImageBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';
import CommentSection from 'modules/_default/fwComment/CommentSection';
class VideoModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image, active } = video || { _id: null, title: '', link: '', active: true };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.setData(`lessonVideoImage:${_id || 'new'}`);
        this.itemActive.value(active);

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            link: this.itemLink.value(),
            active: this.itemActive.value(),
            image: this.state.image,
        };
        if (data.title == '') {
            T.notify('Tên video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            this.state._id ?
                this.props.update(this.props.lessonId, this.state._id, data, this.hide) :
                this.props.create(this.props.lessonId, data, this.hide);
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    render = () => this.renderModal({
        title: 'Video mới',
        size: 'large',
        body: (
            <div className='row'>
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tên video' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' readOnly={this.props.readOnly} />
                    <FormCheckbox ref={e => this.itemActive = e} label='Kích hoạt' readOnly={this.props.readOnly} />
                </div>
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='lessonVideoImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
            </div>),
    });
}

const adminPageLink = '/user/dao-tao/bai-hoc';
class adminEditPage extends AdminPage {
    state = {};
    pageSize = 20;
    state = { pageNumber: 1, pageTotal: -1 };
    componentDidMount() {
        T.ready(adminPageLink, () => {
            const params = T.routeMatcher('/user/dao-tao/bai-hoc/:_id').parse(window.location.pathname);
            if (params._id) {
                this.props.getLesson(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy bài học bị lỗi!', 'danger');
                        this.props.history.push(adminPageLink);
                    } else if (data.item) {
                        const { _id, title, shortDescription, detailDescription, taiLieuThamKhao, numQuestion } = data.item;
                        this.itemTitle.value(title);
                        this.itemDescription.value(shortDescription);
                        this.itemEditor.html(detailDescription);
                        this.itemTaiLieuThamKhao.html(taiLieuThamKhao);
                        this.itemNumQuestion.value(numQuestion);
                        this.setState({ _id, title });
                        this.itemTitle.focus();
                        this.props.getRateLessonByAdminPage(1, 20, { _refId: params._id, type: 'lesson' });
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
        this.props.updateLesson(this.state._id, {
            title: this.itemTitle.value(),
            shortDescription: this.itemDescription.value(),
            detailDescription: this.itemEditor.html(),
            taiLieuThamKhao: this.itemTaiLieuThamKhao.text().trim() == '' ? '' : this.itemTaiLieuThamKhao.html(),
            numQuestion: this.itemNumQuestion.value(),
        });
    };

    showVideoModal = (e, video) => e.preventDefault() || this.modalVideo.show(video);
    deleteVideo = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteLessonVideo(this.state._id, video._id));
    swapVideo = (e, video, isMoveUp) => e.preventDefault() || this.props.swapLessonVideo(this.state._id, video._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('lesson');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.rate && this.props.rate.page ?
            this.props.rate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const tableVideo = renderTable({
            getDataSource: () => this.props.lesson && this.props.lesson.item && this.props.lesson.item.videos,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên bài học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Link</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showVideoModal(e, item)} />
                    <TableCell type='link' content={item.link} url={item.link} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateLessonVideo(this.state._id, item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.showVideoModal} onSwap={this.swapVideo} onDelete={this.deleteVideo} />
                </tr>),
        });

        const tableRate = renderTable({
            getDataSource: () => this.props.rate && this.props.rate.page && this.props.rate.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tên học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Đánh giá</th>
                    <th style={{ width: '100%', textAlign: 'center' }} >Nhận xét</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                    <TableCell type='text' content={item.user && item.user.identityCard} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.user && item.user.phoneNumber} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.value} />
                    <TableCell type='text' content={item.note} />
                </tr>),
        });

        const componentInfo = (
            <div className='tile-body'>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên bài học' value={this.state.title} onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả ngắn gọn' rows='3' readOnly={!permission.write} />
                <FormTextBox ref={e => this.itemNumQuestion = e} type='number' label='Số lượng câu hỏi ôn tập' value={this.state.numQuestion} readOnly={!permission.write}></FormTextBox>
                <FormEditor ref={e => this.itemEditor = e} label='Mô tả chi tiết' uploadUrl='/user/upload?category=lesson' readOnly={!permission.write} />
                <FormEditor ref={e => this.itemTaiLieuThamKhao = e} label='Tài liệu tham khảo' uploadUrl='/user/upload?category=lesson' readOnly={!permission.write} />
                {permission.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </div>);

        const componentVideo = (
            <div className='tile-body'>
                {tableVideo}
                {permission.write ? <CirclePageButton type='create' onClick={this.showVideoModal} /> : null}
                <VideoModal lessonId={this.state._id} ref={e => this.modalVideo = e} readOnly={!permission.write}
                    create={this.props.createLessonVideo} update={this.props.updateLessonVideo} change={() => this.props.getLesson(this.state._id)} />
            </div>);

        const componentRate = (
            <div className='tile-body'>
                {tableRate}
            </div>);

        const questions = this.props.lesson && this.props.lesson.item && this.props.lesson.item.questions,
            componentQuestion = <QuestionView type='lesson' parentId={this.state._id} className='tile-body' permission={permission} questions={questions} changeQuestions={this.props.changeLessonQuestions} />;

        const componentComment = <CommentSection view='admin' refId={this.state._id} permission={permission} />;

        const tabs = [
            { title: 'Thông tin chung', component: componentInfo },
            { title: 'Video', component: componentVideo },
            { title: 'Câu hỏi', component: componentQuestion },
            { title: 'Đánh giá', component: componentRate },
            { title: 'Bình luận của học viên', component: componentComment },
        ];
        return this.renderPage({
            icon: 'fa fa-book',
            title: 'Bài học: ' + (this.state.title || '...'),
            breadcrumb: [<Link key={0} to={adminPageLink}>Bài học</Link>, 'Chỉnh sửa'],
            content: <>
                <FormTabs id='componentPageTab' contentClassName='tile' tabs={tabs} />
                <Pagination name='pageLesson' style={{ left: 320 }} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.props.getRateLessonByAdminPage(pageNumber, pageSize, { _refId: this.state._id, type: 'lesson' })} />
            </>,
            backRoute: adminPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, lesson: state.trainning.lesson, rate: state.framework.rate });
const mapActionsToProps = { getLesson, updateLesson, createLessonVideo, swapLessonVideo, deleteLessonVideo, updateLessonVideo, changeLessonQuestions, getRateLessonByAdminPage };
export default connect(mapStateToProps, mapActionsToProps)(adminEditPage);