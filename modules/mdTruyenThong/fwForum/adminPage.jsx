import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { AdminPage, AdminModal, FormTextBox, TableCell, FormSelect, renderTable } from 'view/component/AdminPage';

class ForumModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
        this.itemCategories.value(null);
    }

    onSubmit = () => {
        const data = {
            user: this.props.currentUser && this.props.currentUser._id,
            title: this.itemTitle.value(),
            categories: this.itemCategories.value(),
        };
        if (data.title == '') {
            T.notify('Tên forum bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (!data.categories) {
            T.notify('Loại forum bị trống!', 'danger');
            this.itemCategories.focus();
        } else {
            this.props.create(data, data => {
                this.hide();
                data.item && this.props.history.push('/user/forum/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Forum mới',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên forum' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemCategories = e} data={this.props.forumTypes} label='Loại forum' readOnly={this.props.readOnly} />
        </>,
    });
}

const stateMapper = {
    approved: { text: 'Đã duyệt', style: { color: '#28A745' } },
    waiting: { text: 'Đang chờ duyệt', style: { color: '#1488DB' } },
    reject: { text: 'Từ chối', style: { color: '#DC3545' } },
};
const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));

class ForumPage extends AdminPage {
    state = { forumTypes: [] };

    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCategoryAll('forum', null, (items) =>
            this.setState({ forumTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        this.props.getForumPage(1);
        T.onSearch = (searchText) => this.props.getForumPage(1, 50, searchText);
    }

    create = (e) => e.preventDefault() || this.modal.show();

    updateState = (item, state) => this.props.updateForum(item._id, { state });

    delete = (e, item) => e.preventDefault() || T.confirm('Forum', 'Bạn có chắc bạn muốn xóa forum này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id));

    render() {
        const currentUser = this.props.system ? this.props.system.user : null;
        const permission = this.getUserPermission('forum');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.forum && this.props.forum.page ?
            this.props.forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%' }}>Tên forum</th>
                    <th style={{ width: '20%' }} nowrap='true'>Người tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lượng bài viết</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày cập nhật cuối</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.state],
                    dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.id)} textStyle={selectedState ? selectedState.style : null} />;
                return (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} url={'/user/forum/' + item._id} />
                        <TableCell type='text' content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                        <TableCell type='text' content={item.messages && item.messages.length} style={{ textAlign: 'center' }} />
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={new Date(item.modifiedDate).getText()} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/forum/' + item._id} onDelete={this.delete} />
                    </tr>
                );
            },
        });

        return this.renderPage({
            icon: 'fa fa-comments',
            title: 'Forum',
            breadcrumb: ['Forum'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageForum' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getForumPage} />
                <ForumModal create={this.props.createForum} ref={e => this.modal = e} currentUser={currentUser} forumTypes={this.state.forumTypes} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getCategoryAll, getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);