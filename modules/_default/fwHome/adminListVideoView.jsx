import React from 'react';
import { connect } from 'react-redux';
import { getAllListVideo, createListVideo, deleteListVideo } from './redux/reduxListVideo';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable, AdminPage } from 'view/component/AdminPage';

class ListVideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value().trim(),
        };
        if (data.title == '') {
            T.notify('Tên danh sách video bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.createListVideo(data, this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Tập hình ảnh',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên danh sách video' />
        </>,
    });
}

class ListVideoPage extends AdminPage {
    componentDidMount() {
        this.props.getAllListVideo();
    }

    showListVideoModal = (e, video) => e.preventDefault() || this.modal.show(video);

    deleteListVideo = (e, item) => {
        T.confirm('Xóa danh sách video', 'Bạn có chắc bạn muốn xóa danh sách video này?', true, isConfirm => isConfirm && this.props.deleteListVideo(item._id));
        e.preventDefault();
    }

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.listVideo && this.props.component.listVideo.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên danh sách</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/list-video/edit/' + item._id} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/list-video/edit/' + item._id} onDelete={this.deleteListVideo} />
                </tr>),
        });

        return <>
            {table}
            <ListVideoModal ref={e => this.modal = e} createListVideo={this.props.createListVideo} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={e => this.modal.show()} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getAllListVideo, createListVideo, deleteListVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoPage);