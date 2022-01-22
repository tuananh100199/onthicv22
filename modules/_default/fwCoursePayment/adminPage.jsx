import React from 'react';
import { connect } from 'react-redux';
import { getCoursePaymentPage,createCoursePayment,updateCoursePayment,deleteCoursePayment } from './redux';
import { AdminPage, AdminModal,FormSelect, FormRichTextBox, FormTextBox, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

const numPaymentData = [// hiện tại chỉ có 2 loại là đóng hp 1 lần và 2 lần
    {id:1,text:'1 lần',},
    {id:2,text:'2 lần',},
];
class FeeTypeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        let { _id=null, title='', description='',numOfPayments=null } = item || {};
        this.itemName.value(title);
        this.itemNumOfPayments.value(numOfPayments||2);// số lần thanh toán mặc định là 2
        this.itemDescription.value(description);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            title: this.itemName.value(),
            numOfPayments:parseInt(this.itemNumOfPayments.value()),
            description:this.itemDescription.value(),
        };
        if (data.title == '') {
            T.notify('Tên bị trống!', 'danger');
            this.itemName.focus();
        }else if (data.numOfPayments == '') {
            T.notify('Số lần thanh toán bị trống!', 'danger');
            this.itemNumOfPayments.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, data, this.hide) : this.props.create(data, this.hide);
        }
    }

    render = () => {
        const readOnly = this.props.readOnly;
        return this.renderModal({
            title: 'Số lần thanh toán',
            size: 'medium',
            body: <div className='row'>
                <FormTextBox ref={e => this.itemName = e} className='col-md-12' label='Tên' readOnly={readOnly} />
                <FormSelect ref={e => this.itemNumOfPayments = e} className='col-md-12' data={numPaymentData} label='Số lần thanh toán' readOnly={readOnly} />
                <FormRichTextBox ref={e => this.itemDescription = e} className='col-md-12' label='Mô tả' readOnly={readOnly} />
            </div>
        });
    }
}

class AdminFeeTypePage extends AdminPage {
    state = { };
    componentDidMount() {
        T.ready(() => {
            this.props.getCoursePaymentPage(1);
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);
    delete = (e, item) => e.preventDefault() || T.confirm('Xóa số lần thanh toán', 'Bạn có chắc bạn muốn xóa số lần thanh toán này?', true, isConfirm =>
        isConfirm && this.props.deleteCoursePayment(item._id));

    render() {
        const permission = this.getUserPermission('coursePayment');
        const { pageNumber, pageSize, pageTotal, totalItem,list } = this.props.coursePayment && this.props.coursePayment.page ?
        this.props.coursePayment.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0,list:null };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lần thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Mặc định</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize+ index + 1} />
                    <TableCell type='link' content={item.title} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.numOfPayments?`${item.numOfPayments} lần`:''} />
                    <TableCell type='checkbox' content={item.default} permission={permission} onChanged={ value => this.props.updateCoursePayment(item._id, { default:value })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-list',
            title: 'Số lần thanh toán',
            breadcrumb: ['Số lần thanh toán'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageFeeType' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getCoursePaymentPage} />
                <FeeTypeModal ref={e => this.modal = e} readOnly={!permission.write}
                    create={this.props.createCoursePayment} update={this.props.updateCoursePayment} />
            </>,
            onCreate: permission.write ? this.edit : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, coursePayment: state.accountant.coursePayment });
const mapActionsToProps = { getCoursePaymentPage,createCoursePayment,updateCoursePayment,deleteCoursePayment };
export default connect(mapStateToProps, mapActionsToProps)(AdminFeeTypePage);