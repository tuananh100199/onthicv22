import React from 'react';
import { connect } from 'react-redux';
import { getDebtStudentPage, exportPhieuThu } from './redux';
import FileSaver from 'file-saver';
import { AdminPage,FormTextBox, FormCheckbox, renderTable, TableCell, AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getText } from 'number-to-text-vietnamese';

class InPhieuThuModal extends AdminModal {
    state = { billId: null };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { lastname, firstname, lichSuDongTien } = item || { lastname: '', firstname: '', lichSuDongTien: []};
        this.itemName.value(lastname + ' ' + firstname);
        this.setState({lichSuDongTien, userId: item._id});
    }

    change = (value, index) => {
        const { lichSuDongTien } = this.state;
        const feeText = value ? (lichSuDongTien[index] && lichSuDongTien[index].fee ? getText(lichSuDongTien[index].fee) : '') : '';
        for(let i = 0; i < lichSuDongTien.length; i++){
            if(i != index) this[i].value(false);
        }
        this.setState({ billId: value ? (lichSuDongTien[index] && lichSuDongTien[index]._id) : null, feeText });
    }

    exportPhieuThu = () => {
        const { billId, userId, feeText } = this.state;
        if(billId && userId){
            this.props.exportPhieuThu(userId, billId, feeText, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'PHIẾU THU.docx');
            });
        } else{
            T.notify('Chưa có đủ thông tin!', 'danger');
        }
    };

    render = () => {
        const { lichSuDongTien, billId } = this.state;
        const table = renderTable({
            getDataSource: () => lichSuDongTien, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời gian đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Chọn hoá đơn</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={'Thanh toán học phí lần ' + (index + 1)} />
                    <TableCell type='number' content={item.fee ? T.numberDisplay(item.fee) + ' đồng' : ''} />
                    <TableCell type='number' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='link' onClick={() => { }} style={{ textAlign: 'center' }} content={<FormCheckbox ref={e => this[index] = e} onChange={value => this.change(value, index)} />} />
                </tr>)
        });
        return this.renderModal({
            title: 'Chọn học phí cần in phiếu thu',
            size: 'large',
            body: (
                <div>
                   <FormTextBox ref={e => this.itemName = e} type='text' label='Tên học viên' readOnly={true} />
                    {table}
                </div>),
            buttons:
            <a className={'btn btn-success' + (billId ? ' visible' : ' invisible')} href='#' onClick={() => this.exportPhieuThu()} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-print' /> In
            </a>
        });
    }
}

class DebtTrackingPage extends AdminPage {
    state = { isSearching: false, searchText: '' };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' }));
            T.onSearch = (searchText) => this.onSearch({ searchText });
        });
        this.props.getDebtStudentPage();
    }

    onSearch = ({ pageNumber, pageSize, searchText }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getDebtStudentPage(pageNumber, pageSize, { searchText }, (page) => {
            this.setState({ searchText, isSearching: false });
            done && done(page);
        }));
    }

    renderLichSuDongTien = (lichSuDongTien, type) => {
        let text = '';
        if (lichSuDongTien.length) {
            lichSuDongTien.forEach((item, index) => {
                let i = index + 1;
                if (type == 'fee') text = text + 'Lần ' + i + ': ' + item.fee + '\n';
                else if (type == 'isOnline') text = text + 'Lần ' + i + ': ' + (item.isOnlinePayment ? 'Thanh toán online' : 'Thanh toán trực tiếp') + '\n';
                else if (type == 'sum') text = parseInt(text + item.fee);
            });
            return type == 'sum' ? <>{ T.numberDisplay(text)}</> : <pre>{text}</pre>;
        } else return text;
    }

    chechHocPhiConLai = (item) => {
        const lichSuDongTien = item && item.lichSuDongTien;
        let fee = item && item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : 0;
        let soTienDaDong = 0;
        lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.forEach(item => {
            soTienDaDong = parseInt(soTienDaDong + item.fee);
        }) : 0;
        return fee - soTienDaDong;
    }

    render() {
        const permission = this.getUserPermission('debt');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giảm giá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền phải đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lần thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình thức thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền đã đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền còn nợ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời hạn đóng</th>
                    {permission.write && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.courseFee ? item.courseFee.name : ''} />
                    <TableCell type='number' content={item.courseFee ? item.courseFee.fee : ''} />
                    <TableCell type='number' content={item.discount ? item.discount.fee : ''} />
                    <TableCell type='number' content={item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : ''} />
                    <TableCell type='number' content={item.coursePayment ? item.coursePayment.numOfPayments : ''} />
                    <TableCell type='text' style={{textAlign: 'center'}} content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'fee') : ''} />
                    <TableCell type='number' content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'isOnline') : ''} />
                    <TableCell type='number' content={''} />
                    <TableCell type='number' content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'sum') : ''} />
                    <TableCell type='number' content={this.chechHocPhiConLai(item) ? T.numberDisplay(this.chechHocPhiConLai(item)) : ''} />
                    <TableCell type='number' content={item.ngayHetHanNopHocPhi ? T.dateToText(item.ngayHetHanNopHocPhi, 'dd/mm/yyyy') : ''} />
                    {permission.write && 
                    <TableCell type='buttons' content={item} permission={true} onEdit={this.edit}>
                        <a className='btn btn-warning' href='#' onClick={() => this.modal.show(item)}>
                            <i className='fa fa-lg fa-print' />
                        </a>
                        <a className='btn btn-success' href={'/user/student/payment/' + item._id}>
                            <i className='fa fa-lg fa-money' />
                        </a>
                    </TableCell>}
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Theo dõi công nợ',
            breadcrumb: ['Theo dõi công nợ'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <InPhieuThuModal readOnly={false} ref={e => this.modal = e} exportPhieuThu={this.props.exportPhieuThu} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getDebtStudentPage, exportPhieuThu };
export default connect(mapStateToProps, mapActionsToProps)(DebtTrackingPage);
