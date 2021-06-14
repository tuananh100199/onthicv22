import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll, createCategory, swapCategory, updateCategory, changeCategory, deleteCategory } from 'modules/_default/fwCategory/redux';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, CirclePageButton, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';

class CategoryModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, description, image } = item || { _id: '', title: '', description: '' };
        this.itemTitle.value(title);
        this.itemDescription.value(description);
        this.imageBox.setData(`forumCategoryImage:${_id || 'new'}`);
        this.setState({ _id, image });
    }

    onSubmit = () => {
        const changes = {
            title: this.itemTitle.value().trim(),
            description: this.itemDescription.value().trim(),
            image: this.state.image,
        };
        if (this.state._id) { // Update
            this.props.update(this.state._id, changes, () => this.hide());
        } else { // Create
            changes.type = 'forum';
            this.props.create(changes, () => this.hide());
        }
    }

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    render = () => this.renderModal({
        title: 'Loại forum',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên loại forum' readOnly={this.props.readOnly} />
            <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả (nếu có)' readOnly={this.props.readOnly} />
            <FormImageBox ref={e => this.imageBox = e} label='Hình đại diện' uploadType='CategoryImage' image={this.state.image} readOnly={this.props.readOnly}
                onSuccess={this.onUploadSuccess} />
        </>,
    });
}

class ForumCategoryPage extends AdminPage {
    componentDidMount() {
        this.props.getCategoryAll('forum');
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getCategoryAll('forum', searchText);
    }

    create = (e) => e.preventDefault() || this.modal.show();

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapCategory(item._id, isMoveUp, 'forum');

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá danh mục', 'Bạn có chắc bạn muốn xoá danh mục này?', true, isConfirm =>
        isConfirm && this.props.deleteCategory(item._id, 'forum'));

    render() {
        const permission = this.getUserPermission('category');  
        const table = renderTable({
            getDataSource: () => this.props.category, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên loại forum</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/forum-category/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.jpg'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCategory(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={'/user/forum-category/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Danh mục forum',
            breadcrumb: ['Danh mục forum'],
            content: <>
                <div className='tile'>{table}</div>
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
                <CategoryModal ref={e => this.modal = e} readOnly={!permission.write} type={'forum'}
                    create={this.props.createCategory} update={this.props.updateCategory} change={this.props.changeCategory} />
            </>
        });

    }
}

const mapStateToProps = state => ({ system: state.system, category: state.framework.category });
const mapActionsToProps = { getCategoryAll, createCategory, swapCategory, updateCategory, changeCategory, deleteCategory };
export default connect(mapStateToProps, mapActionsToProps)(ForumCategoryPage);