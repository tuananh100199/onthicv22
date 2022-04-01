import React from 'react';
import { connect } from 'react-redux';
import { createIntroVideo, updateIntroVideo, deleteIntroVideo, getIntroVideoAll, changeIntroVideo } from './redux/reduxIntroVideo';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable, FormImageBox, AdminPage } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        const { _id, title, link, image } = video || { _id: null, title: '', link: '', image: '' };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.imageBox.setData(`introVideo:${_id || 'new'}`);
        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            link: this.itemLink.value().trim(),
        };
        if (data.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data) : this.props.create({ ...data, image: this.state.image });
            this.hide();
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
        title: 'Video',
        size: 'large',
        body: <>
            <div className='row' >
                <div className='col-md-8'>
                    <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' readOnly={this.props.readOnly} />
                    <FormTextBox ref={e => this.itemLink = e} label='Đường dẫn' readOnly={this.props.readOnly} />
                </div>
                <FormImageBox className='col-md-4' ref={e => this.imageBox = e} label='Poster video' uploadType='IntroVideoImage' image={this.state.image} readOnly={this.props.readOnly}
                    onSuccess={this.onUploadSuccess} />
            </div>
        </>,
    });
}

class VideoPage extends AdminPage {
    componentDidMount() {
        this.props.getIntroVideoAll();
    }
    showVideoModal = (e, video) => e.preventDefault() || this.modal.show(video);

    deleteIntroVideo = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteIntroVideo(video._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.introVideo && this.props.component.introVideo.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Tiêu đề</th>
                    <th style={{ width: '60%' }}>Link</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.showVideoModal(e, item)} />
                    <TableCell type='link' content={item.link} onClick={e => this.showVideoModal(e, item)} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={e => this.showVideoModal(e, item)} onDelete={e => this.deleteIntroVideo(e, item)} />
                </tr>),
        });
        return <>
            {table}
            <VideoModal ref={e => this.modal = e} update={this.props.updateIntroVideo} create={this.props.createIntroVideo} change={this.props.changeIntroVideo} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={e => e.preventDefault() || this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { createIntroVideo, updateIntroVideo, deleteIntroVideo, getIntroVideoAll, changeIntroVideo };
export default connect(mapStateToProps, mapActionsToProps)(VideoPage);