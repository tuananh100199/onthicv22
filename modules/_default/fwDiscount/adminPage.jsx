import React from 'react';
import { connect } from 'react-redux';
import { getDiscountPage, createDiscount, updateDiscount, updateDiscountDefault, deleteDiscount } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormRichTextBox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class DiscountModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { _id, name, fee, description } = item || { _id: null, name: '', fee: 0, description: '' };
        this.itemName.value(name);
        this.itemFee.value(fee);
        this.itemDescription.value(description);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value().trim(),
            fee: this.itemFee.value(),
            description: this.itemDescription.value(),
        };

        if (data.name == '') {
            T.notify('Tên gói học phí bị trống!', 'danger');
            this.itemTitle.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
        }
    }
    render = () => this.renderModal({
        title: 'Giảm giá',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên giảm giá' />
            <FormTextBox ref={e => this.itemFee = e} type='number' label='Số tiền giảm' />
            <FormRichTextBox ref={e => this.itemDescription = e} rows={2} label='Mô tả' readOnly={this.props.readOnly} />
        </>
    });
}

class DiscountPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getDiscountPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Gói học phí', 'Bạn có chắc bạn muốn xóa gói học phí này?', true, isConfirm =>
        isConfirm && this.props.deleteDiscount(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    changeDefault = (item, active) => {
        if (active) {
            this.props.updateDiscountDefault(item);
        }
    }

    render() {
        const permission = this.getUserPermission('discount'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.discount && this.props.discount.page ?
                this.props.discount.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Gói mặc định</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền giảm (VNĐ)</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.name} />
                        <TableCell type='checkbox' content={item.isDefault} permission={permission} onChanged={active => this.changeDefault(item, active)} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Giảm giá',
            breadcrumb: ['Giảm giá'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <DiscountModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDiscount} update={this.props.updateDiscount} />
                <Pagination name='pageDiscount' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDiscountPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, discount: state.accountant.discount });
const mapActionsToProps = { getDiscountPage, createDiscount, updateDiscount, updateDiscountDefault, deleteDiscount };
export default connect(mapStateToProps, mapActionsToProps)(DiscountPage);
