import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll, createCategory, swapCategory, updateCategory, deleteCategory } from './redux';
import { AdminPage, AdminModal, FormTextBox, FormRichTextBox, CirclePageButton, FormImageBox, TableCell, renderTable } from 'view/component/AdminPage';

class CategoryModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, description, image } = item || { _id: '', title: '', description: '', image: '/img/avatar.png' };
        this.itemTitle.value(title);
        this.itemDescription.value(description);
        this.imageBox.setData(`${this.props.uploadType}:${_id || 'new'}`);
        this.setState({ _id, image });
    }

    onSubmit = () => {
        const changes = { title: this.itemTitle.value().trim(), description: this.itemDescription.value().trim() };
        if (this.state._id) { // Update
            this.props.update(this.state._id, changes, () => this.hide());
        } else { // Create
            changes.type = this.props.type;
            changes.active = true;
            this.props.create(changes, () => this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Danh mục',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Tên danh mục' readOnly={this.props.readOnly} />
            <FormRichTextBox ref={e => this.itemDescription = e} label='Mô tả (nếu có)' readOnly={this.props.readOnly} />
            <FormImageBox ref={e => this.imageBox = e} className='form-group' label='Hình đại diện' uploadType='CategoryImage' image={this.state.image} readOnly={this.props.readOnly} />
        </>,
    });
}

class CategorySection extends AdminPage {
    componentDidMount() {
        this.props.getCategoryAll(this.props.type);
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getCategoryAll(this.props.type, searchText);
    }

    create = (e) => e.preventDefault() || this.modal.show();

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapCategory(item._id, isMoveUp, this.props.type);

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá danh mục', 'Bạn có chắc bạn muốn xoá danh mục này?', true, isConfirm =>
        isConfirm && this.props.deleteCategory(item._id));

    render() {
        const permission = this.getUserPermission('category');
        const table = renderTable({
            getDataSource: () => this.props.category,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên danh mục</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='image' style={{ width: '20%' }} content={item.image || '/img/avatar.png'} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCategory(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return <>
            <div className='tile'>{table}</div>
            {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            <CategoryModal ref={e => this.modal = e} readOnly={!permission.write} uploadType={this.props.uploadType} type={this.props.type}
                create={this.props.createCategory} update={this.props.updateCategory} />
        </>;
    }
}

const mapStateToProps = state => ({ system: state.system, category: state.category })
const mapActionsToProps = { getCategoryAll, createCategory, swapCategory, updateCategory, deleteCategory };
export default connect(mapStateToProps, mapActionsToProps)(CategorySection);