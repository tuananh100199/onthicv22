import React from 'react';
import { connect } from 'react-redux';
import { getListVideoAll, createListVideo, deleteListVideo } from './redux/reduxListVideo';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class ListVideoModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên danh sách video bị trống!', 'danger');
            this.itemTitle.focus();
        } else this.props.create({ title }, data => {
            if (data.item) {
                this.hide();
                this.props.history.push('/user/list-video/' + data.item._id);
            }
        })
    }
    render = () => this.renderModal({
        title: 'Danh sách video',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên danh sách video' />
        </>
    })
}

class ListVideoPage extends React.Component {
    componentDidMount() {
        this.props.getListVideoAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa danh sách bài viết', 'Bạn có chắc bạn muốn xóa danh sách bài viết này?', true, isConfirm =>
        isConfirm && this.props.deleteListVideo(item._id));

    render() {
        const permission = this.props.permission;
        let table = renderTable({
            getDataSource: () => this.props.component.listVideo && this.props.component.listVideo.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên danh sách</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>
            ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/list-video/' + item._id} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/list-video/' + item._id} onDelete={this.delete} />
                </tr>
            )
        })

        return <>
            {table}
            <ListVideoModal ref={e => this.modal = e} create={this.props.createListVideo} readOnly={!permission.write} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getListVideoAll, createListVideo, deleteListVideo };
export default connect(mapStateToProps, mapActionsToProps)(ListVideoPage);
