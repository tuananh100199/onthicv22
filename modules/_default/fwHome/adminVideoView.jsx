import React from 'react';
import { connect } from 'react-redux';
import { createVideo, updateVideo, deleteVideo, getAllVideos } from './redux/reduxVideo';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable, FormEditor, FormImageBox, AdminPage } from 'view/component/AdminPage';

class VideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (video) => {
        let { _id, title, link, image, content } = video ? video : { _id: null, title: '', link: '', image: '', content: '' };
        this.itemTitle.value(title);
        this.itemLink.value(link);
        this.itemEditor.html(content);
        this.imageBox.setData('video:' + (_id ? _id : 'new'));
        this.setState({ _id: _id, image: image });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
            link: this.itemLink.value().trim(),
            content: this.itemEditor.html(),
        };
        if (data.title == '') {
            T.notify('Tiêu đề video bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.link == '') {
            T.notify('Link video bị trống!', 'danger');
            this.itemLink.focus();
        } else if (data.content == '') {
            T.notify('Nội dung video bị trống!', 'danger');
            this.itemEditor.focus();
        } else {
            this.state._id ? this.props.updateVideo(this.state._id, data) : this.props.createVideo(data);
            this.hide();
        }
    }

    render = () => this.renderModal({
        title: 'Thông tin video',
        size: 'large',
        body: (<>
            <FormTextBox ref={e => this.itemTitle = e} label='Tiêu đề' />
            <FormEditor ref={e => this.itemEditor = e} label='Nội dung video' />
            <div className='row'>
                <FormTextBox ref={e => this.itemLink = e} className='col-md-8' label='Đường dẫn' />
                <FormImageBox ref={e => this.imageBox = e} className='col-md-4' label='Hình đại diện' uploadType='VideoImage' image={this.state.image} />
            </div>
        </>),
    });
}

class VideoPage extends AdminPage {
    componentDidMount() {
        this.props.getAllVideos();
    }
    showVideoModal = (e, video) => e.preventDefault() || this.modal.show(video);

    deleteVideo = (e, video) => e.preventDefault() || T.confirm('Xóa video', `Bạn có chắc bạn muốn xóa video <strong>${video.title}</strong>?`, true, isConfirm =>
        isConfirm && this.props.deleteVideo(video._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.video && this.props.component.video.list,
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
                    <TableCell type='link' content={item.title} url={'/user/content/edit/' + item._id} />
                    <TableCell type='link' content={item.link} url={item.link} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} />
                    <TableCell content={(
                        <div className='btn-group'>
                            {permission.write ?
                                <a className='btn btn-primary' href='#' onClick={e => this.showVideoModal(e, item)}>
                                    <i className='fa fa-lg fa-edit' />
                                </a> : null}
                            {permission.delete ?
                                <a className='btn btn-danger' href='#' onClick={e => this.deleteVideo(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a> : null}
                        </div>)} />
                </tr>),
        });
        return <>
            {table}
            <VideoModal ref={e => this.modal = e} updateVideo={this.props.updateVideo} createVideo={this.props.createVideo} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={e => this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { createVideo, updateVideo, deleteVideo, getAllVideos };
export default connect(mapStateToProps, mapActionsToProps)(VideoPage);