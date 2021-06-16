import React from 'react';
import { connect } from 'react-redux';
import { getForumPage, createForum, updateForum, deleteForum } from './redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import Dropdown from 'view/component/Dropdown';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
const backUrl = '/user/forum-category';

class ForumModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = () => {
        this.itemTitle.value('');
    }

    onSubmit = () => {
        const data = {
            user: this.props.currentUser && this.props.currentUser._id,
            title: this.itemTitle.value(),
            categories: this.props.categories,
        };
        if (data.title == '') {
            T.notify('Tên forum bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Forum mới',
             body: <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên forum' readOnly={readOnly} />
         </>,
        });
    }
}

const stateMapper = {
    approved: { text: 'Đã duyệt', style: { color: '#28A745' } },
    waiting: { text: 'Đang chờ duyệt', style: { color: '#1488DB' } },
    reject: { text: 'Từ chối', style: { color: '#DC3545' } },
};
const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));
class ForumPage extends AdminPage {
    state = { categories: null };

    componentDidMount() {
        T.ready('/user/forum-category', () => {
            T.showSearchBox();
            const route = T.routeMatcher('/user/forum-category/:_id'),
            categories = route.parse(window.location.pathname)._id;
            this.setState({ categories });
            if (categories) {
                this.props.getForumPage(undefined, undefined, {}, categories);
            } else {
                this.props.history.push(backUrl);
            }
        });
        T.onSearch = (searchText) => this.props.getForumPage(1, undefined, searchText);
    }
    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa forum', 'Bạn có chắc bạn muốn xóa forum này?', true, isConfirm =>
        isConfirm && this.props.deleteForum(item._id, this.state.categories));

    updateState = (item, state) => this.props.updateForum(item._id, this.state.categories, { state });

    getPage = (pageNumber, pageSize) => {
        this.props.getForumPage(pageNumber, pageSize, {}, this.state.categories);

    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null;
        const permission = this.getUserPermission('forum');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.forum && this.props.forum.page ?
            this.props.forum.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => this.props.forum && this.props.forum.page && this.props.forum.page.list,
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
                        <TableCell type='link' content={item.title} url={'/user/forum-category/' + this.state && this.state.categories + '/forum/' +item._id} />
                        <TableCell type='text' content={item.user && (item.user.lastname + ' ' + item.user.firstname)} />
                        <TableCell type='text' content={item.messages && item.messages.length} style={{textAlign: 'center'}}/>
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell content={new Date(item.modifiedDate).getText()} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                    

                        <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/forum-category/' + this.state && this.state.categories + '/forum/' +item._id}  onDelete={this.delete} />
                    </tr>
                );
            },
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Danh mục forum: ' ,
            breadcrumb: [<Link key={0} to='/user/forum-category'>Danh mục forum</Link>, 'Danh sách'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageForum' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.getPage} />
                <ForumModal ref={e => this.modal = e} categories={this.state && this.state.categories} currentUser={currentUser} readOnly={!permission.write}
                    create={this.props.createForum} update={this.props.updateForum} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, forum: state.communication.forum });
const mapActionsToProps = { getForumPage, createForum, updateForum, deleteForum };
export default connect(mapStateToProps, mapActionsToProps)(ForumPage);