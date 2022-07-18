import React from 'react';
import { connect } from 'react-redux';
import { getTimeTablePage, createTimeTable, updateTimeTable, deleteTimeTable, getTimeTableDateNumber } from './redux';
import { getStudent,ajaxSelectStudent, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormEditor, FormTextBox, FormRichTextBox,TableHead,TableHeadCell } from 'view/component/AdminPage';
import { createNotification } from 'modules/_default/fwNotification/redux';
import axios from 'axios';

const stateMapper = {
    choLienHe: { text: 'Chờ liên hệ', style: { color: 'black' } },
    dangLienHe: { text: 'Đang liên hệ', style: { color: '#1488DB' } },
    daLienHe: { text: 'Đã liên hệ', style: { color: 'green' } },
    // UngVien: { text: 'Ứng viên', style: { color: '#28A745' } },
};
const states = Object.entries(stateMapper).map(([key, value]) => ({ id: key, text: value.text }));
const defaultTitleHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu!',
defaultAbstractHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu ngày {ngayDangKy}',
defaultContentHuyDangKyThoiKhoaBieu = '<p>Xin chào {ho_ten} {cmnd},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo huỷ thời khoá biểu học thực hành bạn đã đăng ký ngày {ngayDangKy} với lý do: {lyDoHuyThoiKhoaBieu}, chúng tôi sẽ thông báo tới bạn các buổi học khác trong thời gian sớm nhất!</p>';


class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { state, student } = item;
        const { _id, title, content, abstract } = this.props.dataHuyThoiKhoaBieu|| { _id: '', title: '', content: '', abstract: '' };
        let newAbstract = '',
        newContent = '';
        newAbstract = abstract.replaceAll('{ho_ten}', student ? student.fullName : '')
            .replaceAll('{cmnd}',student ? '(' + student.identityCard + ')' : '')
            .replaceAll('{ngayDangKy}', item && item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : '');
            newContent = content.replaceAll('{ho_ten}', student ? student.fullName : '')
            .replaceAll('{cmnd}', student ? '(' + student.identityCard + ')' : '')
            .replaceAll('{lyDoHuyThoiKhoaBieu}', 'Giáo viên bận việc đột xuất')
            .replaceAll('{ngayDangKy}', item && item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : '');
        this.itemTitle.value(title);
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item, content, abstract, state });
    }

    onSend = () => {
        const student = this.state.item && this.state.item.student,
        user = student && student.user;
        const data = {
            title: this.itemTitle.value(),
            abstract: this.itemAbstract.value(),
            content: this.itemContent.html(),
            type: '0',
            user: user._id,
            sentDate: new Date(),
        };
        T.confirm('Xác nhận gửi thông báo thời khoá biểu', 'Bạn có chắc muốn gửi thông báo thời khoá biểu đến học viên ' + student.fullName , true, isConfirm =>
            isConfirm && this.props.create(data, () => {
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
                this.props.updateStudent(student._id, {soGioThucHanhDaHoc: student.soGioThucHanhDaHoc -1});
                T.notify('Gửi thông báo thành công!', 'success');
                this.hide();
                window.location.reload();
            }));   
    }

    render = () => this.renderModal({
        title: 'Cấu hình thông báo học viên',
        size: 'large',
        dataBackdrop: 'static',
        body: <>
            <FormTextBox ref={e => this.itemTitle = e} label='Chủ đề' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemFee = e} label='Số tiền hoàn' readOnly={true} />
            <FormRichTextBox ref={e => this.itemAbstract = e} label='Mô tả ngắn gọn' readOnly={this.props.readOnly} />
            <FormEditor ref={e => this.itemContent = e} smallText={'{ho_ten},{cmnd}'} uploadUrl='/user/upload?category=notification' label='Nội dung' readOnly={this.props.readOnly} />
        </>,
        buttons:
            <a className='btn btn-success' href='#' onClick={e => this.onSend(e)} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Gửi thông báo
            </a>
    });
}

class TimeTablePage extends AdminPage {
    state = { searchText: '', isSearching: false };
    componentDidMount() {
        T.ready(()=>{
            this.props.getTimeTablePage(1, 50, {state: 'teacherOff'},{},{});
            this.props.getNotificationTemplateAll({}, data => {
                if (data && data.length) {
                    const indexHuyThoiKhoaBieu = data.findIndex(template => template.state == 'huyThoiKhoaBieu');
                    if (indexHuyThoiKhoaBieu != -1) {
                        this.setState({ data: data[indexHuyThoiKhoaBieu] });
                    } else {
                        this.setState({
                            dataHuyThoiKhoaBieu: {
                                title: defaultTitleHuyDangKyThoiKhoaBieu,
                                abstract: defaultAbstractHuyDangKyThoiKhoaBieu,
                                content: defaultContentHuyDangKyThoiKhoaBieu,
                            }
                        });
                    }
                } else {
                    this.setState({
                        dataHuyThoiKhoaBieu: {
                            title: defaultTitleHuyDangKyThoiKhoaBieu,
                            abstract: defaultAbstractHuyDangKyThoiKhoaBieu,
                            content: defaultContentHuyDangKyThoiKhoaBieu
                        }
                    });
                }
            });
        });
        // T.ready(() => T.showSearchBox());
        // T.onSearch = (searchText) => this.props.getTimeTablePage(undefined, undefined, searchText ? { searchText: searchText } : null, () => {
        //     this.setState({ searchText, isSearching: searchText != '' });
        // });
    }

    updateState = (item, state) => this.props.updateTimeTable(item._id, { stateTeacherOff: state });

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('timeTable',['read', 'write', 'admin']);
        permission.delete=permission.admin;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
            this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            autoDisplay:true,stickyHead:true,
            renderHead: () => (
                <TableHead getPage = {this.props.getTimeTablePage}>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }}>#</TableHeadCell>
                    <TableHeadCell name='student' filter='select' filterData={ajaxSelectStudent} style={{ width: '100%',minWidth:200 }} menuStyle={{width:200}} nowrap='true'>Học viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số điện thoại</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giáo viên</TableHeadCell>
                    <TableHeadCell name='date' sort={true} style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Tình trạng</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhân viên xử lý</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => {
                const selectedState = stateMapper[item.stateTeacherOff],
                    dropdownState = <Dropdown items={states} item={selectedState} onSelected={e => this.updateState(item, e.id)} textStyle={selectedState ? selectedState.style : null} />;
                return (
                    <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.student ? item.student.identityCard : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={item.student && item.student.user ? item.student.user.phoneNumber : ''} />
                        <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span></>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                        {/* <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} /> */}
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='text' content={item.staff ? item.staff.lastname + ' ' + item.staff.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='buttons' content={item} >
                        <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.notiModal.show(item)}>
                                    <i className='fa fa-lg fa-paper-plane' />
                                </a>
                        </TableCell>
                    </tr>);
            } 
        });
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Giáo viên nghỉ đột xuất',
            breadcrumb: ['Giáo viên nghỉ đột xuất'],
            content: <>
                <div className='tile'>{table}</div>
                <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} updateStudent={this.props.updateStudent} create={this.props.createNotification} getUserChatToken={this.props.getUserChatToken} dataHuyThoiKhoaBieu={this.state.dataHuyThoiKhoaBieu} />
                <Pagination name='adminTimeTable' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTimeTablePage} />
            </>,
            // onCreate: permission.write ? this.edit : null,
            // onDelete: permission.delete ? this.delete : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePage, createTimeTable, updateTimeTable, deleteTimeTable, getStudent, getTimeTableDateNumber, getNotificationTemplateAll, getUserChatToken, createNotification, updateStudent};
export default connect(mapStateToProps, mapActionsToProps)(TimeTablePage);
