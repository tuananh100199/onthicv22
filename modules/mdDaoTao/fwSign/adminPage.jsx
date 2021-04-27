import React from 'react';
import { connect } from 'react-redux';
import { getCategoryAll } from 'modules/_default/fwCategory/redux';
import { getSignPage, createSign, updateSign, swapSign, deleteSign, deleteSignImage, changeSign } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, FormRichTextBox, FormImageBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';

class SignModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemCode.focus()));
    }

    onShow = (item) => {
        let { _id, code, title, description, active, image, categories } = item || { code: '', title: '', description: '', active: true, categories: [] };
        this.itemCode.value(code);
        this.itemTitle.value(title);
        this.itemDescription.value(description);
        this.itemImage.setData(`sign:${_id || 'new'}`);
        this.itemCategories.value(categories);
        this.itemIsActive.value(active);

        this.setState({ _id, image });
    }

    onSubmit = () => {
        const data = {
            code: this.itemCode.value(),
            title: this.itemTitle.value(),
            description: this.itemDescription.value(),
            categories: this.itemCategories.value(),
            active: this.itemIsActive.value(),
            image: this.state.image,
        };
        if (data.code == '') {
            T.notify('Mã biển báo bị trống!', 'danger');
            this.itemCode.focus();
        } else if (data.title == '') {
            T.notify('Tên biển báo bị trống!', 'danger');
            this.itemTitle.focus();
        } else if (data.categories == null) {
            T.notify('Loại biển báo bị trống!', 'danger');
            this.itemCategories.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    deleteImage = () => T.confirm('Xoá hình minh họa', 'Bạn có chắc bạn muốn xoá hình minh họa này?', true, isConfirm =>
        isConfirm && this.props.deleteImage(this.state._id, () => this.setState({ image: null })));

    onUploadSuccess = ({ error, item, image }) => {
        if (error) {
            T.notify('Upload hình ảnh thất bại!', 'danger');
        } else {
            image && this.setState({ image });
            item && this.props.change(item);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Biển báo mới',
            size: 'large',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemCode = e} className='col-md-12' label='Mã biển báo' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemTitle = e} className='col-md-8' label='Tên biển báo' rows='5' readOnly={readOnly} />
                <FormImageBox ref={e => this.itemImage = e} className='col-md-4' label='Hình minh họa' uploadType='SignImage' image={this.state.image}
                    onDelete={this.deleteImage} onSuccess={this.onUploadSuccess} readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemDescription = e} className='col-md-12' label='Mô tả' rows='5' readOnly={readOnly} />
                <FormSelect ref={e => this.itemCategories = e} className='col-md-12' data={this.props.signTypes} label='Loại biển báo' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemIsActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminQuestionPage extends AdminPage {
    state = { signTypes: [] };
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        this.props.getCategoryAll('sign', null, (items) =>
            this.setState({ signTypes: (items || []).map(item => ({ id: item._id, text: item.title })) }));
        this.props.getSignPage(1);
        T.onSearch = (searchText) => this.props.getSignPage(1, undefined, searchText);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapSign(item._id, isMoveUp);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa biển báo', 'Bạn có chắc bạn muốn xóa biển báo này?', true, isConfirm =>
        isConfirm && this.props.deleteSign(item._id));

    render() {
        const permission = this.getUserPermission('sign');
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.sign && this.props.sign.page ?
            this.props.sign.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => this.props.sign && this.props.sign.page && this.props.sign.page.list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tên biển báo</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='image' content={item.image} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateSign(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-universal-access',
            title: 'Biển báo',
            breadcrumb: ['Biển báo'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageSign' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSignPage} />
                <SignModal ref={e => this.modal = e} signTypes={this.state.signTypes} readOnly={!permission.write}
                    create={this.props.createSign} update={this.props.updateSign} change={this.props.changeSign} deleteImage={this.props.deleteSignImage} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, sign: state.sign, category: state.category });
const mapActionsToProps = { getCategoryAll, getSignPage, createSign, updateSign, swapSign, deleteSign, deleteSignImage, changeSign };
export default connect(mapStateToProps, mapActionsToProps)(AdminQuestionPage);