import React from 'react';
import { connect } from 'react-redux';
import { getVerificationImagePage, createVerificationImage, updateVerificationImage, deleteVerificationImage } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getUserChatToken, getAllUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import axios from 'axios';

const  defaultTitleHuyAnh = 'Thông báo về việc từ chối ảnh đăng ký học!',
    defaultAbstractHuyAnh = 'Thông báo về việc từ chối ảnh đăng ký học!',
    defaultContentHuyAnh = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo ảnh đăng ký học của bạn không đạt yêu cầu, với lý do: {lyDo}, bạn vui lòng chụp lại ảnh và gửi sớm nhất thông qua tính năng chụp avatar tại app!</p>',
    defaultTitleDuyetAnh = 'Thông báo về việc duyệt ảnh đăng ký học!',
    defaultAbstractDuyetAnh = 'Thông báo về việc duyệt ảnh đăng ký học!',
    defaultContentDuyetAnh = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo ảnh đăng ký học của bạn đã được duyệt </p>';
class VerificationImageModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemUser.focus()));
        
    }

    onShow = (item) => {
        const { _id, user, image, createdDate, state} = item || { _id: null };
        this.itemUser.value(user? user.lastname + ' ' + user.firstname : '');
        // this.itemImage.setData('image',image);
        this.itemCreatedDate.value(createdDate ? T.dateToText(createdDate) : '');
        // this.itemState.value(state);
        this.setState({ _id, image, state, name:  user? user.lastname + ' ' + user.firstname : ''});
    }

    onSubmitCustom = () => {
        let data = {
            state: 'approved'
        };
        if(this.state._id){
            this.props.update(this.state._id, data,() => {
                this.props.sendNoTi(this.state._id, this.state.name);
                this.hide();
            });
        }
    }
    render = () => this.renderModal({
        title: 'Hình ảnh học viên',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.itemUser = e} label='Tên học viên' readOnly={true}/>
            <FormTextBox className='col-md-6' ref={e => this.itemCreatedDate = e} label='Thời gian chụp' readOnly={true} />
            <div className='d-flex justify-content-center col-md-12 row'>
                <img className='col-md-6' id='img' src={this.state.image}></img>
            </div>
            
            {/* <FormImageBox className='col-md-12' ref={e => this.itemImage = e} style={{width:'95%', height: 'auto'}} label='Hình ảnh học viên' image={this.state.image} readOnly={true} /> */}
        </div>,
        buttons: 
        [
            <a className='btn btn-warning' key={0} href='#' onClick={() =>  
                T.confirm('Xác nhận duyệt ảnh', 'Bạn có chắc muốn xác nhận duyệt ảnh của học viên ' +  this.state.name, true, isConfirm =>
                isConfirm && this.onSubmitCustom())}  style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Duyệt ảnh
            </a> ,
            <a className='btn btn-danger' href='#' key={1} onClick={() => {
                T.confirm('Xác nhận từ chối ảnh', 'Bạn có chắc muốn xác nhận duyệt ảnh của học viên ' +  this.state.name , true, isConfirm =>
                isConfirm && this.props.showReasonModal({_id: this.state._id, name: this.state.name}));}} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Từ chối ảnh
            </a>
        ]
    });
}

class CancelClassModal extends AdminModal {
    state = { showSubmitBtn: false, lyDo: 'Ảnh bị mờ'};
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = (item) => {
        const {_id, name} = item;
        this.setState({ _id, name });
    }

    checkOther = (item) => {
        if(item && item != ''){
            $('#khac').prop('checked',true);
            this.setState({lyDo: item});
        } else{
            $('#khac').prop('checked',false);
            this.setState({lyDo: 'Ảnh bị mờ'});
        }
    }

    checked = () =>{
        this.setState({showSubmitBtn: true});
    }

    render = () => this.renderModal({
        title: 'Lý do từ chối hình ảnh',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <div><b>Chọn lý do huỷ hình ảnh:</b></div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='khongDuSoLuong' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='khongDuSoLuong'>
                            Ảnh bị mờ
                        </label>
                    </div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='khac' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='khac'>
                            Khác:
                            <FormTextBox ref={e => this.itemLyDo = e} onChange={e => this.checkOther(e.target.value)} type='text' readOnly={false} />
                        </label>
                    </div>
                </div>
            </div>),
        buttons:
        this.state.showSubmitBtn ? <button className='btn btn-danger' style={{ textAlign: 'right' }}
            onClick={() => {
                T.confirm('Xác nhận từ chối ảnh', 'Bạn có chắc muốn từ chối ảnh của học viên ' + this.state.name , true, isConfirm =>
                isConfirm && this.props.update(this.state._id, {state: 'reject', lyDo:this.state.lyDo},() => {
                    this.props.sendNoTi(this.state._id, this.state.name, this.state.lyDo);
                    this.hide();
                    this.props.hideModal();
                }));
            }}
        >Xác nhận gửi thông báo</button> : null
    });
}

class VerificationImagePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        this.props.getVerificationImagePage();
        // this.props.getNotificationTemplateAll({}, data => {
        //     if (data && data.length) {
        //         const indexHuyOnTap = data.findIndex(template => template.state == 'huyOnTap');
        //         if (indexHuyOnTap != -1) {
        //             this.setState({ dataHuyOnTap: data[indexHuyOnTap] });
        //         } else {
        //             this.setState({
        //                 dataHuyOnTap: {
        //                     title: defaultTitleHuyAnh,
        //                     abstract: defaultAbstractHuyAnh,
        //                     content: defaultContentHuyAnh
        //                 }
        //             });
        //         }
        //         const indexOnTap = data.findIndex(template => template.state == 'onTap');
        //         if (indexOnTap != -1) {
        //             this.setState({ dataOnTap: data[indexOnTap] });
        //         } else {
        //             this.setState({
        //                 dataOnTap: {
        //                     title: defaultTitleDuyetAnh,
        //                     abstract: defaultAbstractDuyetAnh,
        //                     content: defaultContentDuyetAnh
        //                 }
        //             });
        //         }
        //     } else {
        //         this.setState({
        //             dataOnTap: {
        //                 title: defaultTitleDuyetAnh,
        //                 abstract: defaultAbstractDuyetAnh,
        //                 content: defaultContentDuyetAnh
        //             }
        //         });
        //     }
        // });
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lớp ôn tập', 'Bạn có chắc bạn muốn lớp ôn tập này?', true, isConfirm =>
        isConfirm && this.props.deleteVerificationImage(item._id));

    edit = (e, item) => {
        e.preventDefault();
        this.setState({currentUser: item.user}, () => this.modal.show(item));
    }

    renderState = (item) => {
        const { state, dateEnd} = item;
        if(state == 'approved') return <p className='text-success'>Mở lớp</p>;
        else if (state == 'reject') return <p className='text-danger'>Huỷ</p>;
        else if (state == 'autoReject') return <p className='text-danger'>Tự động huỷ</p>;
        else{
            if(new Date(dateEnd) > new Date()) return <p className='text-warning'>Đang mở đăng ký</p>;
            else return <p className='text-warning'>Đang chờ duyệt</p>;
        }
    };

    sendNoti = ( _id, name ,lyDo) => {
        let title='',content='',abstract='';
        let currentUser = this.state.currentUser;
        if(lyDo){
            title = defaultTitleHuyAnh;
            content =  defaultContentHuyAnh;
            abstract = defaultAbstractHuyAnh;
        } else {
            title = defaultTitleDuyetAnh;
            content = defaultContentDuyetAnh;
            abstract = defaultAbstractDuyetAnh;
        }
        let newAbstract = abstract.replaceAll('{ho_ten}', name),
                newContent =  content.replaceAll('{ho_ten}', name).replaceAll('{lyDo}', lyDo); 
                const data = {
                    title: title,
                    abstract: newAbstract,
                    content: newContent,
                    type: '0',
                    user: currentUser._id,
                    sentDate: new Date(),
                };
                this.props.createNotification(data, () => {
                    this.props.getUserChatToken(data.user, dataUser => {
                        if (dataUser && dataUser.token){
                            this.modal.hide();
                            this.reasonModal.hide();
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
                });
    }

    render() {
        const permission = this.getUserPermission('verificationImage'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.verificationImage && this.props.verificationImage.page ?
                this.props.verificationImage.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên học viên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày chụp</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.user ? item.user.lastname + ' ' + item.user.firstname : ''}/>
                        <TableCell type='image' style={{ width: '20%' }} content={item.image ? item.image : '/img/avatar.png'} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center' }} content={item.createdDate ? T.dateToText(item.createdDate, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.state == 'approved' ? 'Đã xác nhận' : (item.state == 'reject' ? 'Đã từ chối' : 'Đang chờ duyệt')} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={item.state == 'waiting' ?  this.edit : null} onDelete={this.delete} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Hình ảnh học viên',
            breadcrumb: ['Hình ảnh học viên'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <VerificationImageModal ref={e => this.modal = e} readOnly={!permission.write} sendNoTi={this.sendNoti} showReasonModal={this.reasonModal && this.reasonModal.show} create={this.props.createVerificationImage} update={this.props.updateVerificationImage} permission={permission} />
                <CancelClassModal  readOnly={true} ref={e => this.reasonModal = e} sendNoTi={this.sendNoti} hideModal={this.modal && this.modal.hide} update={this.props.updateVerificationImage}/>
                <Pagination name='pageVerificationImage' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getVerificationImagePage}  />
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, verificationImage: state.enrollment.verificationImage });
const mapActionsToProps = { getVerificationImagePage, createVerificationImage, updateVerificationImage, deleteVerificationImage, getNotificationTemplateAll, getUserChatToken, getAllUserChatToken, createNotification };
export default connect(mapStateToProps, mapActionsToProps)(VerificationImagePage);
