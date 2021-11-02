import React from 'react';
import { connect } from 'react-redux';
import { createNotificationTemplate, getNotificationTemplateAll, updateNotificationTemplate, deleteNotificationTemplate } from './redux';
import { AdminPage, FormTextBox, FormRichTextBox, AdminModal, CirclePageButton, TableCell, renderTable } from 'view/component/AdminPage';

const listParams = ['{ho_ten}', '{cmnd}', '{khoa}', '{ngay_thi_tot_nghiep}', '{ngay_thi_sat_hach}'];

class NotificationTemplateModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, name } = item || { _id: '', title: '', name: '', content: '' };
        this.itemTitle.value(title);
        this.itemName.value(name);
        this.itemContent.value(content);
        this.setState({ _id });
    }

    onSubmit = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
            content: this.itemContent.value().trim(),
            name: this.itemName.value().trim(),
        };
        if (this.state._id) {
            this.props.update(this.state._id, changes, () => this.hide());
        } else {
            this.props.create(changes, () => this.hide());
        }
    }



    render = () => this.renderModal({
        title: 'Thông báo',
        body: <>
            {/* <FormSelect ref={e => this.itemType = e} data={this.state.dataType} placeholder='Loại thông báo' style={{ width: '200px' }} /> */}
            <FormTextBox ref={e => this.itemName = e} label='Tên thông báo' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemTitle = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormRichTextBox ref={e => this.itemContent = e} listParams={listParams} label='Nội dung' readOnly={this.props.readOnly} />
        </>,
    });
}

class NotificationTemplatePage extends AdminPage {
    componentDidMount() {
        T.ready('/user/notification/template', () => {
            this.props.getNotificationTemplateAll();
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá template', 'Bạn có chắc bạn muốn xoá template thông báo này?', true, isConfirm =>
        isConfirm && this.props.deleteNotificationTemplate(item._id));


    render() {
        const permission = this.getUserPermission('notificationTemplate');
        const table = renderTable({
            getDataSource: () => this.props.notificationTemplate, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên thông báo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.name} onClick={e => this.edit(e, item)} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-bell-o',
            title: 'Cấu hình thông báo',
            breadcrumb: ['Cấu hình thông báo'],
            content:
                <div className='tile'>
                    {table}
                    {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
                    <NotificationTemplateModal ref={e => this.modal = e} create={this.props.createNotificationTemplate} update={this.props.updateNotificationTemplate} />
                </div>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, notificationTemplate: state.communication.notificationTemplate });
const mapActionsToProps = { createNotificationTemplate, getNotificationTemplateAll, updateNotificationTemplate, deleteNotificationTemplate };
export default connect(mapStateToProps, mapActionsToProps)(NotificationTemplatePage);