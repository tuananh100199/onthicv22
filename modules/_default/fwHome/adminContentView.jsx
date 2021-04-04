import React from 'react';
import { connect } from 'react-redux';
import { getContentAll, createContent, updateContent, deleteContent } from './redux/reduxContent';
import { AdminModal, FormTextBox, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

class ContentModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => this.itemTitle.value('');

    onSubmit = () => {
        const title = this.itemTitle.value().trim();
        if (title == '') {
            T.notify('Tên bài viết bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create({ title }, data => {
                if (data.item) {
                    this.hide();
                    this.props.history.push('/user/content/' + data.item._id);
                }
            })
        }
    }
    render = () => this.renderModal({
        title: 'Bài viết',
        body: <FormTextBox ref={e => this.itemTitle = e} label='Tên bài viết' />
    });
}

class ContentView extends React.Component {
    componentDidMount() {
        this.props.getContentAll();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nội dung', 'Bạn có chắc bạn muốn xóa nội dung này?', true, isConfirm =>
        isConfirm && this.props.deleteContent(item._id));

    render() {
        const permission = this.props.permission;
        const table = renderTable({
            getDataSource: () => this.props.component.content && this.props.component.content.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/content/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/content/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return <>
            {table}
            <ContentModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createContent} history={this.props.history} />
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { getContentAll, createContent, updateContent, deleteContent };
export default connect(mapStateToProps, mapActionsToProps)(ContentView);
