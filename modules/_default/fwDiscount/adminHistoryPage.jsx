import React from 'react';
import { connect } from 'react-redux';
import { getDiscountHistoryPage, createDiscountHistory, updateDiscountHistory, deleteDiscountHistory } from './redux';
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
        this.props.getDiscountHistoryPage();
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lịch sử giảm giá', 'Bạn có chắc bạn muốn xóa lịch sử giảm giá này?', true, isConfirm =>
        isConfirm && this.props.deleteDiscountHistory(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const permission = this.getUserPermission('discountHistory'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.discountHistory && this.props.discountHistory.page ?
                this.props.discountHistory.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên khuyến mãi/ Mã code</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Ngày áp dụng</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Người sử dụng</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Loại khuyến mãi</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền giảm (VNĐ)</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.name} />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap'}} content={item.user ? item.user.lastname + ' ' + item.user.firstname : ''} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap'}} content={item.type == 'goi' ? 'Khuyến mãi theo gói' : (item.type == 'codeCaNhan' ? 'Code khuyến mãi cá nhân' : 'Code khuyến mãi chung')} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                    </tr>),
            });
        console.log(this.props);
        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Lịch sử giảm giá',
            breadcrumb: ['Lịch sử giảm giá'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <DiscountModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createDiscountHistory} update={this.props.updateDiscountHistory} />
                <Pagination name='pageDiscountHistory' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDiscountHistoryPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, discountHistory: state.accountant.discountHistory });
const mapActionsToProps = { getDiscountHistoryPage, createDiscountHistory, updateDiscountHistory, deleteDiscountHistory };
export default connect(mapStateToProps, mapActionsToProps)(DiscountPage);
