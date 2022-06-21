import React from 'react';
import { connect } from 'react-redux';
import { getAnnouncementPage, createAnnouncement, updateAnnouncement, deleteAnnouncement,swapAnnouncement } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class EditModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id = null, title = '', active = false } = item || {};
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            active: this.itemActive.value(),
        };
        if (data.title == '') {
            T.notify('Tiêu đề bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data,({item})=>{
                this.hide();
                this.props.history.push('/user/announcement/'+item._id);
            });
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Bài viết thông báo',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemTitle = e} className='col-md-12' label='Tiêu đề' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminAnnouncementPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready(() => {
            this.props.getAnnouncementPage(1);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa nhóm tin tức?', 'Bạn có chắc bạn muốn xóa nhóm tin tức này?', true, isConfirm =>
        isConfirm && this.props.deleteAnnouncement(item._id));
    
    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapAnnouncement(item._id, isMoveUp);

    render() {
        const permission = this.getUserPermission('announcement');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.announcement && this.props.announcement.page ?
            this.props.announcement.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: null };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tiêu đề</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/announcement/' + item._id} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateAnnouncement(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={() => this.props.history.push('/user/announcement/' + item._id)} onDelete={this.delete} onSwap={this.swap} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Bài viết thông báo',
            breadcrumb: ['Bài viết thông báo'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageFaq' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getAnnouncementPage} />
                <EditModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createAnnouncement} update={this.props.updateAnnouncement} history={this.props.history}/>
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, announcement: state.communication.announcement });
const mapActionsToProps = { getAnnouncementPage, createAnnouncement, updateAnnouncement, deleteAnnouncement,swapAnnouncement };
export default connect(mapStateToProps, mapActionsToProps)(AdminAnnouncementPage);