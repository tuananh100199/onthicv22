import React from 'react';
import { connect } from 'react-redux';
import { getListContentAll, createListContent, deleteListContent } from './redux/reduxListContent';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class ListContentModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên danh sách bài viết bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create({ title }, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/list-content/' + data.item._id);
                }
            })
        }
    }
    render = () => this.renderModal({
        title: 'Danh sách bài viết',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên danh sách bài viết' />
    });
}

class ListContentView extends React.Component {
    componentDidMount() {
        this.props.getListContentAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa danh sách bài viết', 'Bạn có chắc bạn muốn xóa danh sách bài viết này?', true, isConfirm =>
        isConfirm && this.props.deleteListContent(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.listContent && this.props.component.listContent.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên danh sách</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh nền</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/list-content/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/list-content/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <ListContentModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createListContent} history={this.props.history} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getListContentAll, createListContent, deleteListContent };
export default connect(mapStateToProps, mapActionsToProps)(ListContentView);