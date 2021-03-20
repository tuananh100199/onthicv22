import React from 'react';
import { connect } from 'react-redux';
import { getAll, createCategory, swapCategory, updateCategory, deleteCategory } from './redux';
import ImageBox from 'view/component/ImageBox';
import { AdminModal, FormTextBox } from 'view/component/AdminPage';

class CategoryModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, image } = item ? item : { _id: '', title: '', image: '/img/avatar.png' };
        this.itemTitle.value(title);
        this.imageBox.setData(this.props.uploadType + ':' + (_id || 'new'));
        this.setState({ image });
        this.data('_id', _id);
    }

    onSubmit = () => {
        const _id = this.data('_id'),
            changes = { title: this.itemTitle.value().trim() };
        if (_id) { // Update
            this.props.updateCategory(_id, changes, () => this.hide());
        } else { // Create
            changes.type = this.props.type;
            changes.active = true;
            this.props.createCategory(changes, () => this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Danh mục',
        body: (
            <>
                <FormTextBox ref={e => this.itemTitle = e} label='Tên danh mục' readOnly={this.props.readOnly} />
                <div className='form-group' style={{ display: this.data('_id') ? 'block' : 'none' }}>
                    <label>Hình ảnh {this.data('_id')}</label>
                    <ImageBox ref={e => this.imageBox = e} postUrl='/user/upload' uploadType='CategoryImage' image={this.state.image} readOnly={this.props.readOnly} />
                </div>
            </>),
    });
}

class CategorySection extends React.Component {
    componentDidMount() {
        this.props.getAll(this.props.type);
        T.ready();
        T.showSearchBox();
        T.onSearch = (searchText) => this.props.getAll(this.props.type, searchText);
    }

    create = (e) => e.preventDefault() || this.modal.show();

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapCategory(item._id, isMoveUp, this.props.type);

    changeActive = (item) => this.props.updateCategory(item._id, { active: !item.active });

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá danh mục', 'Bạn có chắc bạn muốn xoá danh mục này?', true, isConfirm =>
        isConfirm && this.props.deleteCategory(item._id));

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.contains('category:write');
        let table = 'Không có danh mục!';
        if (this.props.category && this.props.category.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tên danh mục</th>
                            <th style={{ width: '20%', textAlign: 'center', whiteSpace: 'nowrap' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Kích hoạt</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.category.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td><a href='#' onClick={e => this.edit(e, item)}>{item.title}</a></td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image ? item.image : '/img/avatar.png'} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                <td className='toggle' style={{ textAlign: 'center' }} >
                                    <label>
                                        <input type='checkbox' checked={item.active} onChange={() => !readOnly && this.changeActive(item, index)} />
                                        <span className='button-indecator' />
                                    </label>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        {readOnly ? null : (
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, item, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>)}
                                        {readOnly ? null : (<a className='btn btn-success' href='#' onClick={e => this.swap(e, item, false)}>
                                            <i className='fa fa-lg fa-arrow-down' />
                                        </a>)}
                                        <a className='btn btn-primary' href='#' onClick={e => this.edit(e, item)}>
                                            <i className='fa fa-lg fa-edit' />
                                        </a>
                                        {readOnly ? null :
                                            < a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>);
        }

        return (
            <>
                <div className='tile'>{table}</div>
                {readOnly ? null :
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button>}
                <CategoryModal ref={e => this.modal = e} readOnly={readOnly} uploadType={this.props.uploadType} type={this.props.type}
                    createCategory={this.props.createCategory} updateCategory={this.props.updateCategory} />
            </>);
    }
}

const mapStateToProps = state => ({ system: state.system, category: state.category })
const mapActionsToProps = { getAll, createCategory, swapCategory, updateCategory, deleteCategory };
export default connect(mapStateToProps, mapActionsToProps)(CategorySection);