import React from 'react';
import { connect } from 'react-redux';
import { getReviewClassPage, createReviewClass, updateReviewClass, deleteReviewClass } from './redux';
import { AdminPage, AdminModal, FormTextBox, TableCell, renderTable, CirclePageButton, FormCheckbox , FormDatePicker, FormSelect} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import {ajaxSelectTeacherByCourseType} from 'modules/_default/fwTeacher/redux';
import {ajaxSelectCourseType} from 'modules/mdDaoTao/fwCourseType/redux';
import { ajaxSelectSubject } from 'modules/mdDaoTao/fwSubject/redux';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import { getUserChatToken, getAllUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import axios from 'axios';

const  defaultTitleHuyOnTap = 'Thông báo về việc huỷ lớp ôn tập!',
    defaultAbstractHuyOnTap = 'Thông báo về việc huỷ lớp ôn tập ngày {ngayOnTap}',
    defaultContentHuyOnTap = '<p>Xin chào {ho_ten}({cmnd}),</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo huỷ buổi ôn tập ngày {ngayOnTap} với lý do: {lyDoHuyOnTap}, chúng tôi sẽ thông báo tới bạn các buổi học khác trong thời gian sớm nhất!</p>',
    defaultTitleOnTap = 'Thông báo về việc mở lớp ôn tập!',
    defaultAbstractOnTap = 'Thông báo về việc mở lớp ôn tập ngày {ngayOnTap}',
    defaultContentOnTap = '<p>Xin chào {ho_ten},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo buổi ôn tập bạn đã đăng ký vào lúc {ngayOnTap} đã được xác nhận, bạn vui lòng có mặt trước 15p để chúng tôi sắp xếp vị trí ngồi học!</p>';
class ReviewClassModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
        
    }

    onShow = (item) => {
        const { _id, title, active, dateStart, dateEnd, courseType, maxStudent, subject, students, state } = item || { _id: null, title: '', active:true };
        let teacher = item ? item.teacher : null;
        this.itemTeacher.value(teacher?{id: `${teacher._id}:${teacher.user}`, text: `${teacher.lastname} ${teacher.firstname} ${teacher.maGiaoVien ? '(' + teacher.maGiaoVien + ')' : ''}`}:null);
        this.itemTitle.value(title);
        this.itemActive.value(active);
        this.itemSubject.value(subject?{id:subject._id,text:subject.title}:null);
        this.itemDateStart.value(dateStart);
        this.itemDateEnd.value(dateEnd);
        this.itemRemainStudent.value(maxStudent);
        this.itemCourseType.value(courseType?{ id:courseType._id, text:courseType.title } : null);
        // this.itemTeacher.value(teacher);
        this.setState({ _id, students, dateEnd, dateStart, state });
    }

    onSubmitCustom = () => {
        const students = this.state.students || [];
        let data = {
            title: this.itemTitle.value().trim(),
            active: this.itemActive.value()?1:0,
            dateStart: this.itemDateStart.value(),
            dateEnd: this.itemDateEnd.value(),
            courseType: this.itemCourseType.value(),
            maxStudent: this.itemRemainStudent.value(),
        };
        if (data.title == '') {
            T.notify('Tên lớp bị trống!', 'danger');
            this.itemTitle.focus();
        } if (!this.itemTeacher.value()) {
            T.notify('Giáo viên bị trống!', 'danger');
            this.itemTeacher.focus();
        } else {
            console.log(this.itemSubject.value());
            const teacher = this.itemTeacher.value().split(':');
            data.teacher = teacher[0];
            if(this.itemSubject.value() && this.itemSubject.value() != '' ) data.subject = this.itemSubject.value();
            if(this.state._id){
                data.remainStudent = parseInt(data.maxStudent) - students.length;
                this.props.update(this.state._id, data, this.hide());
            } else {
                data.remainStudent = data.maxStudent;
                this.props.create(data, this.hide());
            }
        }
    }
    render = () => this.renderModal({
        title: 'Lớp ôn tập',
        size: 'large',
        body: <div className='row'>
            <FormTextBox className='col-md-6' ref={e => this.itemTitle = e} label='Tên lớp' readOnly={this.props.readOnly || new Date(this.state.dateEnd) < new Date()}/>
            <FormTextBox className='col-md-6' ref={e => this.itemRemainStudent = e} label='Số học viên tối đa' readOnly={this.props.readOnly || new Date(this.state.dateEnd) < new Date()} />
            <FormDatePicker className='col-md-6' ref={e => this.itemDateStart = e} label='Thời gian bắt đầu'  type='time' readOnly={this.props.readOnly||new Date(this.state.dateEnd) < new Date()} />
            <FormDatePicker className='col-md-6' ref={e => this.itemDateEnd = e} label='Thời gian kết thúc đăng ký'  type='time' readOnly={this.props.readOnly||new Date(this.state.dateEnd) < new Date()}/>
            <FormSelect className='col-md-6' ref={e => this.itemTeacher = e} label='Giáo viên' data={ajaxSelectTeacherByCourseType('',0)}  style={{ width: '100%' }} readOnly={this.props.readOnly||new Date(this.state.dateEnd) < new Date()}/>
            <FormSelect className='col-md-6' ref={e => this.itemCourseType = e} label='Khoá học' data={ajaxSelectCourseType}  style={{ width: '100%' }} readOnly={this.props.readOnly||new Date(this.state.dateEnd) < new Date()}/>
            <FormSelect className='col-md-6' ref={e => this.itemSubject = e} label='Môn học' data={ajaxSelectSubject}  style={{ width: '100%' }} readOnly={this.props.readOnly||new Date(this.state.dateEnd) < new Date()}/>
            <FormCheckbox className='col-md-6' ref={e => this.itemActive = e} isSwitch={true} label='Kích hoạt' readOnly={this.props.readOnly || new Date(this.state.dateEnd) < new Date()} />
        </div>,
        buttons: (this.props.permission.write && new Date(this.state.dateEnd) < new Date() && this.state.state == 'waiting') ?
        [
            <a className='btn btn-warning' key={0} href='#' onClick={() =>  
                T.confirm('Xác nhận huỷ lớp', 'Bạn có chắc muốn xác nhận mở lớp ôn tập ngày ' + T.dateToText(this.state.dateStart, 'dd/mm/yyyy') , true, isConfirm =>
                isConfirm && this.props.sendNoTi(this.state.dateStart,this.state.students,this.state._id))}  style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Mở lớp
            </a> ,
            <a className='btn btn-danger' href='#' key={1} onClick={() => {
                T.confirm('Xác nhận huỷ lớp', 'Bạn có chắc muốn huỷ lớp ôn tập ngày ' + T.dateToText(this.state.dateStart, 'dd/mm/yyyy') , true, isConfirm =>
                isConfirm && this.props.showReasonModal({dateStart: this.state.dateStart, students: this.state.students, _id: this.state._id}));}} style={{ color: 'white' }}>
                <i className='fa fa-lg fa-paper-plane' /> Huỷ lớp
            </a>
        ]: 
        <a className='btn btn-info' href='#' onClick={e => e.preventDefault && this.onSubmitCustom()} style={{ color: 'white' }}>
            <i className='fa fa-lg fa-save' /> Lưu
        </a>
    });
}

class CancelClassModal extends AdminModal {
    state = { showSubmitBtn: false, lyDoHuyOnTap: 'Không đủ số lượng'};
    componentDidMount() {
        T.ready(() => this.onShown(() => {}));
    }

    onShow = (item) => {
        const {dateStart, students, _id} = item;
        this.setState({ dateStart, students, _id });
    }

    checkOther = (item) => {
        if(item && item != ''){
            $('#khac').prop('checked',true);
            this.setState({lyDoHuyOnTap: item});
        } else{
            $('#khac').prop('checked',false);
            this.setState({lyDoHuyOnTap: 'Không đủ số lượng'});
        }
    }

    checked = () =>{
        this.setState({showSubmitBtn: true});
    }

    render = () => this.renderModal({
        title: 'Lý do huỷ lớp ôn tập',
        dataBackdrop: 'static',
        body: (
            <div>
                <div className='tile-body'>
                    <div><b>Chọn lý do huỷ lớp ôn tập:</b></div>
                    <div className='form-check'>
                        <input className='form-check-input' type='radio' name='lyDo' id='khongDuSoLuong' onChange={this.checked}/>
                        <label className='form-check-label' htmlFor='khongDuSoLuong'>
                            Không đủ số lượng
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
                T.confirm('Xác nhận huỷ lớp', 'Bạn có chắc muốn huỷ lớp ôn tập ngày ' + T.dateToText(this.state.dateStart, 'dd/mm/yyyy') , true, isConfirm =>
                isConfirm && this.props.sendNoTi(this.state.dateStart, this.state.students, this.state._id, this.state.lyDoHuyOnTap));
            }}
        >Xác nhận gửi thông báo</button> : null
    });
}

class ReviewClassPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getReviewClassPage();
        this.props.getNotificationTemplateAll({}, data => {
            if (data && data.length) {
                const indexHuyOnTap = data.findIndex(template => template.state == 'huyOnTap');
                if (indexHuyOnTap != -1) {
                    this.setState({ dataHuyOnTap: data[indexHuyOnTap] });
                } else {
                    this.setState({
                        dataHuyOnTap: {
                            title: defaultTitleHuyOnTap,
                            abstract: defaultAbstractHuyOnTap,
                            content: defaultContentHuyOnTap
                        }
                    });
                }
                const indexOnTap = data.findIndex(template => template.state == 'onTap');
                if (indexOnTap != -1) {
                    this.setState({ dataOnTap: data[indexOnTap] });
                } else {
                    this.setState({
                        dataOnTap: {
                            title: defaultTitleOnTap,
                            abstract: defaultAbstractOnTap,
                            content: defaultContentOnTap
                        }
                    });
                }
            } else {
                this.setState({
                    dataOnTap: {
                        title: defaultTitleOnTap,
                        abstract: defaultAbstractOnTap,
                        content: defaultContentOnTap
                    }
                });
            }
        });
    }

    create = (e) => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Lớp ôn tập', 'Bạn có chắc bạn muốn lớp ôn tập này?', true, isConfirm =>
        isConfirm && this.props.deleteReviewClass(item._id));

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

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

    sendNoti = (dateStart, students, _id, lyDoHuyOnTap) => {
        let title='',content='',abstract='';
        let changes = {};
        if(lyDoHuyOnTap){
            changes = {state: 'reject', lyDoHuyOnTap};
            title = this.state.dataHuyOnTap.title;
            content = this.state.dataHuyOnTap.content;
            abstract = this.state.dataHuyOnTap.abstract;
        } else {
            changes = { state: 'approved'};
            title = this.state.dataOnTap.title;
            content = this.state.dataOnTap.content;
            abstract = this.state.dataOnTap.abstract;
        }
        const handleSendNotification = (index = 0) => {
            if (index == students.length) {
                T.notify('Gửi thông báo thành công!', 'success');
                this.props.updateReviewClass(_id, changes, () =>{
                    this.modal.hide();
                    this.reasonModal.hide();
                });
            } else {
                const student = students[index];
                let newAbstract = abstract.replaceAll('{ho_ten}', student.lastname + ' ' + student.firstname).replaceAll('{ngayOnTap}', T.dateToText(dateStart, 'dd/mm/yyyy')),
                newContent =  content.replaceAll('{ho_ten}', student.lastname + ' ' + student.firstname).replaceAll('{ngayOnTap}', T.dateToText(dateStart, 'hh:mm dd/mm/yyyy')).replaceAll('{lyDoHuyOnTap}', lyDoHuyOnTap); 
                const data = {
                    title: title,
                    abstract: newAbstract,
                    content: newContent,
                    type: '0',
                    user: student.user,
                    sentDate: new Date(),
                };
                this.props.createNotification(data, () => {
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
                        handleSendNotification(index + 1);
                    });
                });
            }
        };
        handleSendNotification();
    }

    render() {
        const permission = this.getUserPermission('reviewClass'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.reviewClass && this.props.reviewClass.page ?
                this.props.reviewClass.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Tên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Môn học</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời gian bắt đầu</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số học viên</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Kích hoạt</th>
                        <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={item.title} url={'/user/review-class/' + item._id}/>
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.subject ? item.subject.title : 'Ôn tập chung'} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center' }} content={item.dateStart ? T.dateToText(item.dateStart, 'dd/mm/yyyy') : ''} />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center' }} content={item.students ? (item.students.length + '/' + item.maxStudent) : '0/' + item.maxStudent} permission={permission}  />
                        <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={this.renderState(item)} />
                        <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateReviewClass(item._id, {active})} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={item.state == 'waiting' ?  this.edit : null} onDelete={item.state=='waiting' ? this.delete : null} />
                    </tr>),
            });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Lớp ôn tập',
            breadcrumb: ['Lớp ôn tập'],
            content: <>
                <div className='tile'>
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                <ReviewClassModal ref={e => this.modal = e} readOnly={!permission.write} sendNoTi={this.sendNoti} showReasonModal={this.reasonModal && this.reasonModal.show} create={this.props.createReviewClass} update={this.props.updateReviewClass} permission={permission} />
                <CancelClassModal  readOnly={true} ref={e => this.reasonModal = e} sendNoTi={this.sendNoti} />
                <Pagination name='pageReviewClass' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getReviewClassPage} />
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>
        });
    }
}

const mapStateToProps = state => ({ system: state.system, reviewClass: state.training.reviewClass });
const mapActionsToProps = { getReviewClassPage, createReviewClass, updateReviewClass, deleteReviewClass, getNotificationTemplateAll, getUserChatToken, getAllUserChatToken, createNotification };
export default connect(mapStateToProps, mapActionsToProps)(ReviewClassPage);
