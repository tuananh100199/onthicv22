import React from 'react';
import { connect } from 'react-redux';
import { getDebtStudentPage, exportPhieuThu, exportDebtStudentPage, addStudentPayment } from './redux';
import FileSaver from 'file-saver';
import axios from 'axios';
import { getUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { AdminPage,FormTextBox, FormCheckbox, CirclePageButton, FormRichTextBox, FormEditor, renderTable, TableCell, TableHeadCell,TableHead, AdminModal } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {ajaxSelectCoursePayment} from 'modules/_default/fwCoursePayment/redux';
import {ajaxSelectCourseFeeByCourseType} from 'modules/_default/fwCourseFee/redux';
import {ajaxSelectDiscount} from 'modules/_default/fwDiscount/redux';
import { ajaxSelectCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { getText } from 'number-to-text-vietnamese';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';

    const defaultTitleHoanTien = 'Thông báo về việc hoàn trả tiền học phí cho học viên!',
    defaultAbstractHoanTien = 'Thông báo về việc hoàn trả tiền học phí cho học viên khóa {khoa}',
    defaultContentHoanTien = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Bạn được hoàn lại số tiền {fee} đã đóng cho khóa {khoa}, bạn vui lòng đến trung tâm đào tạo lái xe Hiệp Phát để nhận lại. Khi đi vui lòng mang theo giấy tờ tuỳ thân để xác minh</p>';
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

class HoanTienModal extends AdminModal {
    state = { };
    componentDidMount() {
        T.ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = (item) => {
        const { lastname, firstname } = item || { lastname: '', firstname: ''};
        const hocPhiConLai = this.props.chechHocPhiConLai(item)*-1;
        this.itemName.value(lastname + ' ' + firstname);
        this.itemHocPhiConLai.value(T.numberDisplay(hocPhiConLai) + ' đồng');
        this.itemHoanTien.value('');
        this.setState({hocPhiConLai, data: item});
    }

    render = () => {
        const { hocPhiConLai, soTienDong, data } = this.state;
        return this.renderModal({
            title: 'Hoàn tiền học phí',
            body: (
                <div>
                   <FormTextBox ref={e => this.itemName = e} type='text' label='Tên học viên' readOnly={true} />
                   <FormTextBox ref={e => this.itemHocPhiConLai = e} type='text' label='Số tiền đóng thừa' readOnly={true} />
                   <FormTextBox ref={e => this.itemHoanTien = e} type='number' onChange={value => this.setState({ soTienDong: value })} max={hocPhiConLai} label='Số tiền hoàn lại' readOnly={false} />
                </div>),
            buttons: soTienDong ? 
                [<button key={0} className='btn btn-success' onClick={() => {
                    T.confirm('Xác nhận gửi thông báo hoàn tiền', 'Bạn có chắc muốn gửi thông báo hoàn tiền đến học viên ' + data.lastname + ' ' + data.firstname + ' với số tiền ' + T.numberDisplay(soTienDong), true, isConfirm =>
                    isConfirm && this.props.showNoti({soTienDong, data}));
                }}>Thanh toán</button>] : 
                null
        });
    }
}

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, abstract } = this.props.data || { _id: '', title: '', content: '', abstract: '' };
        const soTienDong = item && item.soTienDong;
        const name = item && item.data ? item.data.lastname + ' ' + item.data.firstname : '',
        course = item && item.data && item.data.course && item.data.course.name,
        identityCard = item && item.data && item.data.identityCard;
        let newAbstract = '',
        newContent = '';
        newAbstract = abstract.replaceAll('{ho_ten}', name)
            .replaceAll('{fee}', T.numberDisplay(soTienDong))
            .replaceAll('{khoa}', course)
            .replaceAll('{cmnd}', identityCard);
            newContent = content.replaceAll('{ho_ten}', name)
            .replaceAll('{fee}', T.numberDisplay(soTienDong))
            .replaceAll('{khoa}', course)
            .replaceAll('{cmnd}', identityCard); 
        this.itemTitle.value(title);
        this.itemSoTienDong.value(T.numberDisplay(soTienDong));
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item, content, abstract, soTienDong });
    }

    onSend = () => {
        const soTienDong = this.state.soTienDong;
        const student = this.state.item && this.state.item.data;
        const user = student && student.user;
        const { courseFee, discount, lichSuDongTien } = student;
        const hocPhiDaDong = lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.map(item => item.fee).reduce((prev, next) => prev + next) : 0;
        const hocPhiConLai = courseFee && courseFee.fee && courseFee.fee - (hocPhiDaDong ? hocPhiDaDong : 0) - ((discount && discount.fee) ? discount.fee : 0);
        const hocPhi = courseFee && courseFee.fee && courseFee.fee - ((discount && discount.fee) ? discount.fee : 0);
        const data = {
            title: this.itemTitle.value(),
            abstract: this.itemAbstract.value(),
            content: this.itemContent.html(),
            type: '0',
            user: user._id,
            sentDate: new Date(),
        };
        T.confirm('Xác nhận gửi thông báo hoàn tiền', 'Bạn có chắc muốn gửi thông báo hoàn tiền đến học viên ' + user.lastname + ' ' + user.firstname + ' với số tiền ' + T.numberDisplay(soTienDong), true, isConfirm =>
            isConfirm && this.props.addStudentPayment(student._id, {fee: soTienDong*-1, user: user._id}, hocPhi, hocPhiConLai, () => {
                this.props.create(data, () => {
                    this.props.getUserChatToken(data.user, dataUser => {
                        if (dataUser && dataUser.token){
                            axios.post('https://fcm.googleapis.com/fcm/send', {
                                notification: {
                                    title: data.title,
                                    type: data.type,
                                    body: data.content,
                                    abstract: data.abstract,
                                    mutable_content: true,
                                    sound: 'Tri-tone'
                                },
                                to:  dataUser.token
                            },
                                {
                                    headers: {
                                        Authorization: 'key=AAAAyyg1JDc:APA91bGhj8NFiemEgwLCesYoQcbGOiZ0KX2qbc7Ir7sFnANrypzIpniGsVZB9xS8ZtAkRrYqLCi5QhFGp32cKjsK_taIIXrkGktBrCZk7u0cphZ1hjI_QXFGRELhQQ_55xdYccZvmZWg'
                                    }
                                }
                            );
                        }
                    });
                    T.notify('Gửi thông báo thành công!', 'success');
                    this.hide();
                    window.location.reload();
                });
            }));
        
    }

    render = () => this.renderModal({
        title: 'Cấu hình thông báo học viên',
        size: 'large',
        dataBackdrop: 'static',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemSoTienDong = e} label='Số tiền hoàn' readOnly={true} />
            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
            <FormEditor ref={e => this.itemContent = e} smallText={'{ho_ten},{cmnd}'} uploadUrl='/user/upload?category=notification' label='Nội dung' readOnly={this.props.readOnly} />
        </>,
        buttons:
            <a className='btn btn-success' href='#' onClick={e => this.onSend(e)} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Gửi thông báo
            </a>
    });
}

class DebtTrackingPage extends AdminPage {
    state = { isSearching: false, searchText: '' };
    componentDidMount() {
        T.ready(() => {
            T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' }));
            T.onSearch = (searchText) => this.onSearch({ searchText });
        });
        this.props.getDebtStudentPage(1, undefined, {}, {}, {});
        this.props.getNotificationTemplateAll({}, data => {
            if (data && data.length) {
                const indexHoanTien = data.findIndex(template => template.type == '0');
                if (indexHoanTien != -1) {
                    this.setState({ data: data[indexHoanTien] });
                } else {
                    this.setState({
                        data: {
                            title: defaultTitleHoanTien,
                            abstract: defaultAbstractHoanTien,
                            content: defaultContentHoanTien
                        }
                    });
                }
            } else {
                this.setState({
                    data: {
                        title: defaultTitleHoanTien,
                        abstract: defaultAbstractHoanTien,
                        content: defaultContentHoanTien
                    }
                });
            }
        });
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
            autoDisplay:true,
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <TableHead getPage={this.props.getDebtStudentPage}>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <TableHeadCell sort={true} filter='search' name='firstname'  style={{ width: '100%' }}>Họ và tên</TableHeadCell>
                    <TableHeadCell name='course' filter='select' filterData = {ajaxSelectCourse} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</TableHeadCell>
                    <TableHeadCell name='courseFee' filter='select' filterData = {ajaxSelectCourseFeeByCourseType()} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói</TableHeadCell>
                    <TableHeadCell sort={true} name='courseFee' style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền gói</TableHeadCell>
                    <TableHeadCell name='discount' filter='select' filterData={ajaxSelectDiscount} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giảm giá</TableHeadCell>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền phải đóng</th>
                    <TableHeadCell name='coursePayment' filter='select' filterData = {ajaxSelectCoursePayment} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lần thanh toán</TableHeadCell>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình thức thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin đóng</th>
                    <TableHeadCell  style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền đã đóng</TableHeadCell>
                    <TableHeadCell  style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền còn nợ</TableHeadCell>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời hạn đóng</th>
                    {permission.write && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                    </TableHead>),
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
                    <TableCell type='text'  content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'fee') : ''} />
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
                        {this.chechHocPhiConLai(item) && this.chechHocPhiConLai(item) < 0 ? 
                            <a className='btn btn-danger' href='#' onClick={() => this.modalHoanTien.show(item)}>
                                <i className='fa fa-lg fa-reply' />
                            </a> 
                            : null
                        }
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
                <CirclePageButton type='export' onClick={() => exportDebtStudentPage()} />
                <InPhieuThuModal readOnly={false} ref={e => this.modal = e} exportPhieuThu={this.props.exportPhieuThu} />
                <HoanTienModal readOnly={false} ref={e => this.modalHoanTien = e} showNoti={this.notiModal && this.notiModal.show} chechHocPhiConLai={this.chechHocPhiConLai} />
                <NotificationModal readOnly={!permission.write} addStudentPayment={this.props.addStudentPayment} ref={e => this.notiModal = e} create={this.props.createNotification} getUserChatToken={this.props.getUserChatToken} data={this.state.data} />
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDebtStudentPage}  />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getDebtStudentPage, exportPhieuThu, getNotificationTemplateAll, createNotification, addStudentPayment, getUserChatToken };
export default connect(mapStateToProps, mapActionsToProps)(DebtTrackingPage);
