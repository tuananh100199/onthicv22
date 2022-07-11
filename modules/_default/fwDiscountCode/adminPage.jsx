import React from 'react';
import { connect } from 'react-redux';
import { getDiscountCodePage, getDiscountCode ,createDiscountCode, updateDiscountCode,  deleteDiscountCode } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormDatePicker, FormSelect, FormCheckbox, FormRichTextBox, FormEditor } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { ajaxSelectStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import axios from 'axios';

const defaultTitleDiscountCode = 'Thông báo khuyến mãi dành cho bạn!',
    defaultAbstractDiscountCode = 'Thông báo khuyến mãi học phí dành cho bạn!',
    defaultContentDiscountCode = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát dành tặng cho bạn mã code {code} có giá trị {fee}, hạn dùng đến {endDate} vui lòng sử dụng trước thời hạn để nhận được các ưu đãi của chúng tôi!</p>';

const typeCode = [{ id: 'personal', text: 'Cá nhân'}, { id: 'all', text: 'Chung'}];
class DiscountCodeModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemFee.focus()));
    }

    onShow = (item) => {
        const { _id, isPersonal, fee, user, endDate, startDate, code } = item || { _id: null, name: '', fee: 0, description: '', code: '' };
        this.itemIsPersonal.value(isPersonal ? 'personal' : 'all');
        this.itemFee.value(fee);
        this.itemEndDate.value(endDate);
        this.itemStartDate.value(startDate);
        if(isPersonal) this.itemUser.value({id: user._id, text: `${user.lastname} ${user.firstname}` + (user.identityCard ? ` (${user.identityCard})` : '')});
        else this.itemCode.value(code);
        this.setState({ _id, isShow: isPersonal});
    }

    onSubmit = () => {
        let data = {
            isPersonal: this.itemIsPersonal.value() == 'personal',
            fee: this.itemFee.value(),
            endDate: this.itemEndDate.value(),
            startDate: this.itemStartDate.value(),
        };
        if(!data.fee || data.fee == ''){
            T.notify('Học phí bị trống!', 'danger');
            this.itemFee.focus();
        } else if(!data.endDate){
            T.notify('Ngày kết thúc áp dụng bị trống!', 'danger');
            this.itemEndDate.focus();
        } else if(!data.startDate){
            T.notify('Ngày bắt đầu áp dụng bị trống!', 'danger');
            this.itemStartDate.focus();
        } else if (data.isPersonal) {
            if(!this.itemUser.value()){
                T.notify('Học viên bị trống!', 'danger');
                this.itemUser.focus();
            } else {
                data.user = this.itemUser.value();
                this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
            }
        } else {
            if(!this.itemCode.value() || this.itemCode.value() ==''){
                T.notify('Mã code bị trống!', 'danger');
                this.itemCode.focus();
            } else {
                data.code = this.itemCode.value();
                this.state._id ? this.props.update(this.state._id, data, this.hide()) : this.props.create(data, this.hide());
            }
        }
    }

    onChange = (id) => {
        this.setState({ isShow: (id == 'personal')});
    }    

    checkCode = (e) => {
        e.preventDefault();
        if(!this.itemCode.value() || this.itemCode.value() == ''){
            $('#stateCode').text('Mã code không hợp lệ').css('color', 'red');
        } else {
            this.props.getDiscountCode({code: this.itemCode.value()}, data => {
                if(!data) $('#stateCode').text('Mã code hợp lệ').css('color', 'green');
                else $('#stateCode').text('Mã code không hợp lệ').css('color', 'red');
            });
        }
    }

    render = () => this.renderModal({
        title: 'Code giảm giá',
        body: <>
            <FormSelect ref={e => this.itemIsPersonal = e} onChange={data => this.onChange(data.id)} label='Loại code giảm giá' data={typeCode} /> 
                <FormSelect ref={e => this.itemUser = e} className={this.state.isShow ? 'd-block' : 'd-none'} data={ajaxSelectStudent} label='Người dùng' />
                <FormTextBox  ref={e => this.itemCode = e} className={this.state.isShow ? 'd-none' : 'd-block'} type='text' label='Mã code' />

            <FormTextBox ref={e => this.itemFee = e} type='number' label='Số tiền giảm' />
            <div className='row'>
                <FormDatePicker className='col-md-6' ref={e => this.itemStartDate = e} label='Thời gian bắt đầu áp dụng' />
                <FormDatePicker className='col-md-6' ref={e => this.itemEndDate = e} label='Thời gian kết thúc áp dụng' />
            </div>
            <p id='stateCode' className='col-md-4'></p>
        </>,
        buttons: 
        !this.state.isShow && !this.state._id ? <a className='btn btn-warning' onClick={e => this.checkCode(e)} href='#' style={{ color: 'white' }}>
            <i className='fa fa-lg fa-paper-plane' /> Kiểm tra code
        </a>:null
    });
}

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { _id, title, content, abstract } = this.props.data || { _id: '', title: '', content: '', abstract: '' };
        const {fee, code, endDate} = item;
        const name = item && item.user ? item.user.lastname + ' ' + item.user.firstname : '',
        identityCard = item && item.user && item.user.identityCard;
        let newAbstract = '',
        newContent = '';
        newAbstract = abstract.replaceAll('{ho_ten}', name)
            .replaceAll('{fee}', T.numberDisplay(fee))
            .replaceAll('{cmnd}', identityCard)
            .replaceAll('{endDate}', endDate ? T.dateToText(endDate,'dd/mm/yyyy') : '')
            .replaceAll('{code}', code);
            newContent = content.replaceAll('{ho_ten}', name)
            .replaceAll('{fee}', T.numberDisplay(fee))
            .replaceAll('{cmnd}', identityCard)
            .replaceAll('{endDate}', endDate ? T.dateToText(endDate,'dd/mm/yyyy') : '')
            .replaceAll('{code}', code);
        this.itemTitle.value(title);
        this.itemFee.value(T.numberDisplay(fee));
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item, content, abstract, fee });
    }

    onSend = () => {
        const fee = this.state.fee;
        const user = this.state.item && this.state.item.user;
        const data = {
            title: this.itemTitle.value(),
            abstract: this.itemAbstract.value(),
            content: this.itemContent.html(),
            type: '0',
            user: user.user,
            sentDate: new Date(),
        };
        T.confirm('Xác nhận gửi thông báo mã giảm giá', 'Bạn có chắc muốn gửi thông báo mã giảm giá đến học viên ' + user.lastname + ' ' + user.firstname + ' với số tiền ' + T.numberDisplay(fee), true, isConfirm =>
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

class  DiscountCodePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        this.props.getDiscountCodePage(1,50,{endDate: {$gte: new Date()}});
        this.props.getNotificationTemplateAll({}, data => {
            if (data && data.length) {
                const indexGiamGia = data.findIndex(template => template.state == 'giamGia');
                if (indexGiamGia != -1) {
                    this.setState({ data: data[indexGiamGia] });
                } else {
                    this.setState({
                        data: {
                            title: defaultTitleDiscountCode,
                            abstract: defaultAbstractDiscountCode,
                            content: defaultContentDiscountCode,
                        }
                    });
                }
            } else {
                this.setState({
                    data: {
                        title: defaultTitleDiscountCode,
                        abstract: defaultAbstractDiscountCode,
                        content: defaultContentDiscountCode
                    }
                });
            }
        });
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Gói học phí', 'Bạn có chắc bạn muốn xóa gói học phí này?', true, isConfirm =>
        isConfirm && this.props. deleteDiscountCode(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    onChange = (value) => {
        if(value) this.props.getDiscountCodePage(1,50,{});
        else this.props.getDiscountCodePage(1,50,{endDate: {$gte: new Date()}});
    }

    render() {
        const permission = this.getUserPermission('discountCode'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.discountCode && this.props.discountCode.page ?
                this.props.discountCode.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Mã code</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại code</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Người dùng</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền giảm (VNĐ)</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày hết hạn</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.code} />
                        <TableCell type='text' content={item.isPersonal?'Cá nhân' : 'Chung'} />
                        <TableCell type='text' style={{whiteSpace: 'nowrap'}} content={item.isPersonal? (item.user ? `${item.user.lastname} ${item.user.firstname}` + (item.user.identityCard ? ` (${item.user.identityCard})` : ''): '') : ''} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='number' content={item.endDate ? T.dateToText(item.endDate, 'dd/mm/yyyy') : ''} />
                        <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} onEdit={this.edit} permission={permission} onDelete={this.delete}>
                        {permission.write &&
                            <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.notiModal.show(item)}>
                                <i className='fa fa-lg fa-paper-plane' />
                            </a>}
                    </TableCell>
                    </tr>),
            });
        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Code giảm giá',
            breadcrumb: ['Code giảm giá'],
            content: <>
                <div className='tile'>
                    <FormCheckbox ref={e => this.check = e} style={{ paddingRight: '12px' }} onChange={value => this.onChange(value)} label='Hiển thị code hết hạn' />
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <DiscountCodeModal ref={e => this.modal = e} getDiscountCode={this.props.getDiscountCode} readOnly={!permission.write} create={this.props.createDiscountCode} update={this.props.updateDiscountCode} />
                <Pagination name='pageDiscount' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDiscountCodePage} />
                <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} getUserChatToken={this.props.getUserChatToken} data={this.state.data} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, discountCode: state.accountant.discountCode });
const mapActionsToProps = { getDiscountCodePage, getDiscountCode, createDiscountCode, updateDiscountCode,  deleteDiscountCode, getUserChatToken, getNotificationTemplateAll, createNotification };
export default connect(mapStateToProps, mapActionsToProps)( DiscountCodePage);
