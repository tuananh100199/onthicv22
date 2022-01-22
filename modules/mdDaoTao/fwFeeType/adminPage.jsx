import React from 'react';
import { connect } from 'react-redux';
import { getFeeTypePage,createFeeType,updateFeeType,deleteFeeType } from './redux';
import { AdminPage, AdminModal, FormCheckbox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class FeeTypeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        let { _id=null, title='', active=true,official=false } = item || {};
        this.itemName.value(title);
        this.itemActive.value(active);
        this.itemOfficial.value(official);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemName.value(),
            active: this.itemActive.value(),
            official: this.itemOfficial.value(),
        };
        if (data.title == '') {
            T.notify('Tên loại gói học phí bị trống!', 'danger');
            this.itemName.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Phòng ban',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemName = e} className='col-md-12' label='Tên phòng ban' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={readOnly} />
                <FormCheckbox ref={e => this.itemOfficial = e} className='col-md-6' label='Chính thức' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminFeeTypePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            this.props.getFeeTypePage(1);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa phòng ban', 'Bạn có chắc bạn muốn xóa phòng ban này?', true, isConfirm =>
        isConfirm && this.props.deleteFeeType(item._id));

    render() {
        const permission = this.getUserPermission('fee-type');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.feeType && this.props.feeType.page ?
        this.props.feeType.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chính thức</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateFeeType(item._id, { active })} />
                    <TableCell type='checkbox' content={item.official} permission={permission} onChanged={official => this.props.updateFeeType(item._id, { official })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Loại gói học phí',
            breadcrumb: ['Loại gói học phí'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageFeeType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getFeeTypePage} />
                <FeeTypeModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createFeeType} update={this.props.updateFeeType} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, feeType: state.trainning.feeType });
const mapActionsToProps = { getFeeTypePage,createFeeType,updateFeeType,deleteFeeType };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeeTypePage);