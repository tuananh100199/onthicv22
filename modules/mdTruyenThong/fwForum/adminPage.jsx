import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { getForumPage, createForum, updateForum, swapForum, deleteForum, changeForum } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';

class ForumModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        let { _id, title, categories } = item || { id:'', title: '', categories: [] };
        this.itemTitle.value(title);
        this.itemCategories.value(categories);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemTitle.value(),
            categories: this.itemCategories.value(),
        };
        if (data.title == '') {
            T.notify('Tên forum bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.categories == null) {
            T.notify('Loại forum bị trống!', 'danger');
            this.itemCategories.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Forum mới',
             body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên forum' readOnly={readOnly} />
                {/* <FormSelect ref={e => this.itemCategories = e} label='Loại forum' data={this.props.forumTypes} label='Loại forum' readOnly={readOnly} /> */}
         </>,
        });
    }
}

class ForumPage extends AdminPage {
    state = { forumTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCategoryAll('forum', null, (items) =>
            this.setState({ forumTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        this.props.getForumPage(1);
        T.onSearch = (searchText) => this.props.getForumPage(1, undefined, searchText);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapForum(item._id, isMoveUp);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa biển báo', 'Bạn có chắc bạn muốn xóa biển báo này?', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id));

    render() {
        const permission = this.getUserPermission('forum');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.forum && this.props.forum.page ?
            this.props.forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => this.props.forum && this.props.forum.page && this.props.forum.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên forum</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Người tạo</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Số lượng tin nhắn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='image' content={item.image} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateForum(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-universal-access',
            title: 'Forum',
            breadcrumb: ['Forum'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageForum' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getForumPage} />
                <ForumModal ref={e => this.modal = e} forumTypes={this.state.forumTypes} readOnly={!permission.write}
                    create={this.props.createForum} update={this.props.updateForum} change={this.props.changeForum} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum, category: state.framework.category });
const mapActionsToProps = { getCategoryAll, getForumPage, createForum, updateForum, swapForum, deleteForum, changeForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);