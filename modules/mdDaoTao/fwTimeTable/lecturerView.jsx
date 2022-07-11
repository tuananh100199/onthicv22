import React from 'react';
import { connect } from 'react-redux';
import {getTimeTablePageByAdmin, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getTimeTableOfLecturer, getTimeTabletAll,createTimeTableMulti } from './redux';
import { getStudent, ajaxSelectStudentOfLecturer } from 'modules/mdDaoTao/fwStudent/redux';
import { getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { getCarOfLecturer } from 'modules/mdDaoTao/fwCar/redux';
import { getUserChatToken } from 'modules/mdDaoTao/fwChat/redux';
import { createNotification } from 'modules/_default/fwNotification/redux';
import { getNotificationTemplateAll } from 'modules/mdTruyenThong/fwNotificationTemplate/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormSelect, FormDatePicker,FormCheckbox, FormRichTextBox, FormEditor  } from 'view/component/AdminPage';
import {  RegisterCalendarStatesMapper,RegisterCalendarStates,sectionHours,sectionOverTimeHours,timeOffStatesMapper } from 'modules/mdDaoTao/fwRegisterCalendar/index';
import Dropdown from 'view/component/Dropdown';
import {  getAllRegisterCalendars } from 'modules/mdDaoTao/fwRegisterCalendar/redux';
import axios from 'axios';

const defaultTitleHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu!',
defaultAbstractHuyDangKyThoiKhoaBieu = 'Thông báo về việc huỷ đăng ký thời khoá biểu ngày {ngayDangKy}',
defaultContentHuyDangKyThoiKhoaBieu = '<p>Xin chào {ho_ten} {cmnd},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo huỷ thời khoá biểu học thực hành bạn đã đăng ký ngày {ngayDangKy} với lý do: {lyDoHuyThoiKhoaBieu}, chúng tôi sẽ thông báo tới bạn các buổi học khác trong thời gian sớm nhất!</p>',
defaultTitleDangKyThoiKhoaBieu = 'Thông báo về việc đăng ký thời khoá biểu thành công!',
defaultAbstractDangKyThoiKhoaBieu = 'Thông báo về việc đăng ký thời khoá biểu ngày: {ngayDangKy} thành công',
defaultContentDangKyThoiKhoaBieu = '<p>Xin chào {ho_ten} {cmnd},</p>\n<p>Trung tâm Đào tạo và Sát hạch lái xe Hiệp Phát thông báo thời khoá biểu ngày {ngayDangKy} đã được xác nhận, bạn vui lòng có mặt trước 15p chuẩn bị tham gia buổi học!</p>';
class TimeTableModal extends AdminModal {
    state = {listTimeTable: null};
    sectionHour = {};
    componentDidMount() {
        this.props.getCarOfLecturer({ user: this.props.lecturerId }, car => {
            if (car) {
                this.setState({car: car});
            }
        });
        $(document).ready(() => this.onHidden(() => {
            let {avaiableHours, avaiableOverTimeHours} = this.state;
            avaiableHours&&avaiableHours.forEach(avaiableHour => this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false));
            avaiableOverTimeHours&&avaiableOverTimeHours.forEach(avaiableHour => this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false));
            this.setState({student:null,date:null,listTimeTable:[],OffCalendar:null},()=>{
                this.itemDate && this.itemDate.value('');
            });
            // this.itemDate.value(null);
            // this.itemStudent.value(null);
        }));
    }

    onShow = (item) => {
        
        function formatDayOrMonth(item){
            return ('0' + item).slice(-2);
        }

        function formatDate(item) {
            if(!item) return null;
            let date = new Date(item);
            const year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();

            return `${year}-${formatDayOrMonth(month)}-${formatDayOrMonth(day)}T00:00:00.000Z`;// chuyển ngày trong calendar sang định dạng lưu trong DB
        }
        const { _id, student, dateNumber, date, startHour, numOfHours, state, car } = item.data || { date: item.start ? item.start.toISOString() : '', startHour: 8, numOfHours: 2, state: 'waiting', truant: false, car: this.state.car ? this.state.car : ''},
            endHour = startHour + numOfHours;
        this.itemStudent.value(student ? student._id : null);
        this.itemDate && this.itemDate.value(date);
        // this.itemStartHour.value(startHour);
        // this.itemNumOfHours.value(numOfHours);
        this.itemCar.value(car && car.licensePlates);
        // this.itemTruant.value(truant);
        // this.itemContent.value(content);
        // this.itemNote.value(note);
        this.itemState && this.itemState.value(state);
        const soGioThucHanhDaHoc = item && item.data && item.data.student && item.data.student.soGioThucHanhDaHoc ? item.data.student.soGioThucHanhDaHoc:0;
        this.setState({ loading: false, _id, student, dateNumber, date, startHour, endHour,soGioThucHanhDaHoc ,selectedSectionHours:[],selectedSectionOverTimeHours:[]});
        date ? this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: formatDate(date), official: this.props.official }, data => {
            if (data.items && data.items.length){
                this.setState({ listTimeTable: data.items }, () => {
                    this.getDateNumber();
                    (data.items || []).forEach(timeTable => {
                        if (timeTable.state == 'waiting') {
                            const countDownDate = new Date(timeTable.createdAt).getTime() + 1000*3600*24;
                            let x = window.onload = setInterval(function() {
                            
                                const now = new Date().getTime();
                                const distance = countDownDate - now;
                                
                                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                
                                document.getElementById(`timeRemain${timeTable._id}`) ? document.getElementById(`timeRemain${timeTable._id}`).innerHTML = `Thời gian còn lại: ${hours}:${minutes}:${seconds}` : null;
                                
                                if (distance < 0) {
                                    clearInterval(x);
                                    document.getElementById(`timeRemain${timeTable._id}`).innerHTML = null;
                                }
                            }, 1000);
                        }
                    });
                });
            } else {
                this.setState({ listTimeTable: null });
            }
        }) : null;
    }

    onSubmit = () => {
        const { _id, student, car,selectedSectionHours, selectedSectionOverTimeHours } = this.state;
        if (student) {
            // const data = {
            //     student: student ? student._id : null,
            //     date: this.itemDate.value(),
            //     startHour: this.itemStartHour.value(),
            //     numOfHours: Number(this.itemNumOfHours.value()),
            //     state: this.itemState.value(),
            //     truant: this.itemTruant.value(),
            //     car: car ? car._id : null,
            //     content: this.itemContent.value(),
            //     note: this.itemNote.value(),
            // };
            // if (data.date == '') {
            //     T.notify('Ngày học chưa được chọn!', 'danger');
            //     this.itemDate.focus();
            // } else if (data.startHour == '') {
            //     T.notify('Giờ bắt đầu chưa được chọn!', 'danger');
            //     this.itemStartHour.focus();
            // } else if (data.numOfHours == '') {
            //     T.notify('Số giờ học chưa được chọn!', 'danger');
            //     this.itemNumOfHours.focus();
            // } else if (data.car == '') {
            //     T.notify('Xe học chưa được chọn!', 'danger');
            //     this.itemCar.focus();
            // } else if (!_id && this.state.dateNumber == -1) {
            //     T.notify('Trùng thời khóa biểu!', 'danger');
            //     this.itemStartHour.focus();
            // } else {
            //     let today  = new Date();
            //     const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            //     data.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), '07', '00', '00');
            //     if (!_id && data.date < currentDate) {
            //         T.notify('Ngày học không được nhỏ hơn ngày hiện tại!', 'danger');
            //         this.itemDate.focus();
            //     } else {
            //         this.props.onSave(_id, data);
            //         this.hide();
            //     }
            // }
            const data = {
                date: this.itemDate.value(),
                selectedSectionHours: selectedSectionHours,
                selectedSectionOverTimeHours: selectedSectionOverTimeHours,
                car: car ? car._id : null,
                student: student ? student._id : null,
            };
            // sẽ xem lại chỗ xử lý selectedSectionOverTimeHours. Hiện tại vẫn là lấy hết tất cả.
            let today  = new Date();
            const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const currentHour = new Date(today).getHours();
            const result = selectedSectionHours.filter(select => select.startHour  <= currentHour);
            const dataDate = new Date(data.date).getDate();
            data.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), '07', '00', '00');
            if (!_id && data.date <= currentDate || (dataDate == new Date(currentDate).getDate() && result.length)) {
                T.notify('Thời gian tối thiểu đăng ký là trước 1 ngày!', 'danger');
                this.itemDate.focus();
            } 
            else if (!_id && (data.selectedSectionHours && data.selectedSectionHours.length < 1) && (data.selectedSectionOverTimeHours && data.selectedSectionOverTimeHours.length < 1)) {
                T.notify('Khung thời gian học chưa chọn!', 'danger');
            }
             else {
                this.props.onSave(_id, data, () =>{
                    this.hide();
                    this.setState({student:null,date:null});
                });
            }
        }
    }

    delete = () => T.confirm('Xóa thời khóa biểu', 'Bạn có chắc chắn xóa thời khóa biểu này?', isConfirm => {
        isConfirm && this.props.delete(this.state._id);
        this.hide();
    })

    onChangeCourse = (data) => data && data.id && this.setState({ courseType: data.id }, () => {
        this.itemStudent.value(null);
    });

    onChangeStudent = (data) => data && data.id && this.setState({ loading: true }, () => this.props.getStudent(data.id, student => {
        this.setState({ loading: false, student,soGioThucHanhDaHoc:student.soGioThucHanhDaHoc||0 }, () =>{
            this.itemDate && this.itemDate.value(this.state.date);
            this.state.date && this.onSelectDate(this.state.date);
            this.state._id || this.getDateNumber();
        });
    }));

    handleRenderDateOff = (date,teacherDateOff,studentRegisterCalendar)=>{
        let avaiableHours = sectionHours || [],
        avaiableOverTimeHours = sectionOverTimeHours;
        if(teacherDateOff){
            if (teacherDateOff.timeOff == 'morning') {
                avaiableHours = sectionHours.filter(avaiableHour => avaiableHour.startHour > 12);
            } else if (teacherDateOff.timeOff == 'noon' ) {
                avaiableHours = sectionHours.filter(avaiableHour => avaiableHour.startHour < 12);
            }else{
                avaiableHours = [];
            }
        }
        if(avaiableHours.length){
            avaiableHours = avaiableHours.filter(avaiableHour=>!studentRegisterCalendar.find(calendar=>calendar.startHour==avaiableHour.startHour));
        }

        avaiableOverTimeHours = sectionOverTimeHours.filter(avaiableHour=>!studentRegisterCalendar.find(calendar=>calendar.startHour==avaiableHour.startHour));
        setTimeout(()=>{
            sectionHours.forEach(avaiableHour =>{
                this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false);
            });
            sectionOverTimeHours.forEach(avaiableHour =>{
                this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false);
            });
        },100);
        
        this.setState({date,avaiableHours,avaiableOverTimeHours,listTimeTable:studentRegisterCalendar,
             OffCalendar:teacherDateOff,selectedSectionHours:[],selectedSectionOverTimeHours:[]});
        
    }

    onSelectDate = (date => { 
        const student = this.state.student;
        if(date && student) {
            const listTeacherDateOff = this.props.listTeacherDateOff ||[];
            const dateOff = listTeacherDateOff.find(item=>{
                return T.dateToText(item.dateOff,'dd/mm/yyyy')==T.dateToText(date,'dd/mm/yyyy');
            });
            this.sectionHour={};
            // lấy lịch học ngày hôm nay của học viên.
            this.props.getTimeTabletAll({student:this.state.student._id,date},studentRegisterCalendar=>{
                this.handleRenderDateOff(date,dateOff,studentRegisterCalendar);
            });


            // this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date, official: this.props.official }, data => {
            //     this.setState({ date, listTimeTable: data.items &&  data.items.length ? data.items : null }, () => this.getDateNumber());
            // });
        }
    });

    selectHours = (e, index) => {
        let { avaiableHours, selectedSectionHours } = this.state;
        if (e) {
            selectedSectionHours.push(avaiableHours.find(sectionHour => sectionHour.id == index));
        } else {
            selectedSectionHours = selectedSectionHours.map(selectedStartHour => {
                if (selectedStartHour.id != index) {
                    return selectedStartHour;
                }
            });
        }
        this.setState({ selectedSectionHours: selectedSectionHours.filter(item => item) });
    }

    selectOverTimeHours = (e, index) => {
        let { avaiableOverTimeHours, selectedSectionOverTimeHours } = this.state;
        if (e) {
            selectedSectionOverTimeHours.push(avaiableOverTimeHours.find(sectionHour => sectionHour.id == index));
        } else {
            selectedSectionOverTimeHours = selectedSectionOverTimeHours.map(selectedStartHour => {
                if (selectedStartHour.id != index) {
                    return selectedStartHour;
                }
            });
        }
        this.setState({ selectedSectionOverTimeHours: selectedSectionOverTimeHours.filter(item => item) });
    }

    onChangeHour = () => {
        let startHour = this.itemStartHour?this.itemStartHour.value():null,
            numOfHours = this.itemNumOfHours?this.itemNumOfHours.value():null;
        if (startHour && numOfHours) {
            startHour = Number(startHour);
            numOfHours = Number(numOfHours);
            if (startHour < 0) {
                this.itemStartHour.value(0);
            } else if (startHour > 23) {
                this.itemStartHour.value(startHour % 100 <= 23 ? startHour % 100 : startHour % 10);
            } else if (numOfHours < 1) {
                this.itemNumOfHours.value(1);
            } else if (numOfHours > 23) {
                this.itemNumOfHours.value(numOfHours % 100 <= 23 ? numOfHours % 100 : numOfHours % 10);
            } else {
                this.getDateNumber();
                this.setState({ endHour: startHour + numOfHours });
            }
        } else {
            this.setState({ endHour: null, dateNumber: null });
        }
    }

    getDateNumber = () => {
        const { _id, student } = this.state,
            date = new Date(this.state.date),
            startHour = this.itemStartHour.value(),
            numOfHours = this.itemNumOfHours.value();
        if (student && date && startHour != null) {
            this.props.getDateNumber(_id, student._id, new Date(date.getFullYear(), date.getMonth(), date.getDate()), startHour,numOfHours, (dateNumber) => this.setState({ dateNumber }));
        }
    }

    render = () => {
        const {  date, student, listTimeTable,avaiableHours,avaiableOverTimeHours,OffCalendar,_id } = this.state;
        const table = renderTable({
            getDataSource: () => listTimeTable,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '30%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th> */}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.student ? item.student.lastname + ' ' + item.student.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student ? item.student.identityCard : ''}  />
                    <TableCell type='text' content={ item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    {/* <TableCell type='text' content={ <>{RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} {item.state == 'waiting' ? <div id={`timeRemain${item._id}`} ></div> : null}</>} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/> */}
                </tr>
            ),
        });
        return this.renderModal({
            title: 'Buổi học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.itemStudent = e} readOnly={this.props.readOnly || _id} label='Học viên' data={ajaxSelectStudentOfLecturer(this.props.courseId, this.props.lecturerId)} onChange={this.onChangeStudent} className='col-md-6' />
                    <div className="col-md-6" style={{display:student?'block':'none'}}>
                    {(student||date) && !(this.props.readOnly || _id) ? <FormDatePicker ref={e => this.itemDate = e} readOnly={this.props.readOnly || _id} label='Ngày học' onChange={this.onSelectDate} required />:null}
                    {(this.props.readOnly || _id) && <p className='col-md-6'>Ngày học: <b>{T.dateToText(this.state.date,'dd/mm/yyyy')}</b></p>}
                    </div>
                    
                    {/* {student ? <p className='col-lg-5'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p> : null}
                    {loading ? <p className='col-12'>Đang tải...</p> : ''} */}
                    {student?<>
                        <p className='col-md-4'>Giờ học chính thức:{this.props.courseItem.practiceNumOfHours}</p>
                    <p className='col-md-4'>Số giờ đã học:{this.state.soGioThucHanhDaHoc}</p>
                    <p className='col-md-4'>Còn lại {this.props.courseItem.practiceNumOfHours - this.state.soGioThucHanhDaHoc}</p>
                    </>:null}
                    
                    </div>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <div style={{display:'none'}}>
                        <FormTextBox className='col-md-4' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                        <FormTextBox className='col-md-4' ref={e => this.itemNumOfHours = e} label='Số giờ học' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                        <FormTextBox ref={e => this.itemCar = e} label='Xe học' className='col-md-4' style={{ textTransform: 'uppercase' }} readOnly={true} />
                    </div>
                    
                    <p className='col-md-4'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. </p>
                    <p className='col-md-4'>Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    {/* <p className='col-md-6'> {dateNumber == null ? '' :
                        (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                    </p> */}
                    {date ?<>
                        <div className='row col-12' style={{marginBottom: '25px'}}>
                    {OffCalendar && !_id ? <p className='col-lg-12' style={{ background: 'antiquewhite', paddingBottom: '10px', paddingTop: '10px'}} >Giáo viên: <b>{OffCalendar && OffCalendar.lecturer ? OffCalendar.lecturer.lastname + ' ' + OffCalendar.lecturer.firstname : 'Không có thông tin'}</b> nghỉ <b>{timeOffStatesMapper && timeOffStatesMapper[OffCalendar.timeOff] && timeOffStatesMapper[OffCalendar.timeOff].text}</b> <span className='text-danger'>{new Date(date).getDateText()}</span> </p> : null}
                            {avaiableHours && avaiableHours.length ? <p className='col-md-12'>Chọn khung giờ hành chính: </p>:null}
                            {avaiableHours && avaiableHours.length ? avaiableHours.map((sectionHour) =>
                            (
                                <div key={sectionHour.id} className='col-md-6'>
                                    <FormCheckbox ref={e => this.sectionHour[sectionHour.id] = e} label={'Khung giờ: ' + sectionHour.text} onChange={e => this.selectHours(e, sectionHour.id)} />
                                </div>
                            )) : null}
                            {avaiableOverTimeHours && avaiableOverTimeHours.length && <p className='col-md-12'>Chọn khung giờ ngoài hành chính: </p>}
                            {avaiableOverTimeHours && avaiableOverTimeHours.length ? avaiableOverTimeHours.map((sectionHour) =>
                            (
                                <div key={sectionHour.id} className='col-md-6'>
                                    <FormCheckbox ref={e => this.sectionHour[sectionHour.id] = e} label={'Khung giờ: ' + sectionHour.text} onChange={e => this.selectOverTimeHours(e, sectionHour.id)} />
                                </div>
                            )) : null}
                        </div>
                    {listTimeTable && listTimeTable.length ? 
                    <div className='col-md-12'>
                        <p>
                            Lịch dạy ngày <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span><span> của giáo viên <b>{this.props.lecturerName ? this.props.lecturerName : ''}</b></span>
                        </p>
                        {table}
                    </div> : ''}
                    </> :null }
                    

                    <FormCheckbox ref={e => this.itemTruant = e} label='Học viên vắng học' className='col-md-4' readOnly={false} />
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} readOnly={false} /> 

                    <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung học' className='col-lg-6' readOnly={false} />
                    <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' className='col-lg-6' readOnly={false} />
                </div>
            </>,
            buttons: <>
                {this.state._id && this.props.calendar ? 
                [
                    <button type='button' key={1} className='btn btn-danger' onClick={() => this.delete()}>Xóa</button>,
                    // <button type='button' className='btn btn-primary' onClick={() => this.onSubmit()}>Lưu</button>
                ] : null}
        </>
        });
    }
}

class NotificationModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemTitle.focus()));
    }

    onShow = (item) => {
        const { state, student } = item;
        const { _id, title, content, abstract } = (state =='approved' ? this.props.data : this.props.dataHuyThoiKhoaBieu) || { _id: '', title: '', content: '', abstract: '' };
        console.log(item);
        let newAbstract = '',
        newContent = '';
        newAbstract = abstract.replaceAll('{ho_ten}', student ? student.fullName : '')
            .replaceAll('{cmnd}',student ? '(' + student.identityCard + ')' : '')
            .replaceAll('{ngayDangKy}', item && item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : '');
            newContent = content.replaceAll('{ho_ten}', student ? student.fullName : '')
            .replaceAll('{cmnd}', student ? '(' + student.identityCard + ')' : '')
            .replaceAll('{lyDoHuyThoiKhoaBieu}', 'Không sắp xếp được giáo viên')
            .replaceAll('{ngayDangKy}', item && item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : '');
        this.itemTitle.value(title);
        this.itemAbstract.value(newAbstract);
        this.itemContent.html(newContent);
        this.setState({ _id, item, content, abstract });
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

class LecturerView extends AdminPage {
    state = {};
    eventSelect = null;
    componentDidMount() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user;
        const { courseId, lecturerId } = this.props;
        const course = this.props.course ? this.props.course.item : null;

        if (!course) {
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/' + courseId);
                }
            });
        }
        if (lecturerId) {
            this.setState({ isLecturer, isCourseAdmin });
            this.getTimeTablePage(undefined, undefined);
            this.props.getAllRegisterCalendars({lecturerId});
        }

        this.props.getNotificationTemplateAll({}, data => {
            if (data && data.length) {
                const indexThoiKhoaBieu = data.findIndex(template => template.state == 'thoiKhoaBieu');
                if (indexThoiKhoaBieu != -1) {
                    this.setState({ data: data[indexThoiKhoaBieu] });
                } else {
                    this.setState({
                        data: {
                            title: defaultTitleDangKyThoiKhoaBieu,
                            abstract: defaultAbstractDangKyThoiKhoaBieu,
                            content: defaultContentDangKyThoiKhoaBieu,
                        }
                    });
                }
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

        const _this = this;
        T.ready('/user/course', () => {
          $(this.calendar).fullCalendar({
                timeZone: 'UTC', timeFormat: 'DD-HH:mm', dayHeaderFormat: 'dd/mm',
                // weekNumbers: true,
                selectable: true, eventLimit: false,
                displayEventTime: true, slotEventOverlap: false, navLinks: true,
                weekNumberCalculation: 'ISO',
                fixedWeekCount: false, displayEventEnd: true,
                showNonCurrentDates: false,
                monthNames: ['Tháng Một','Tháng Hai','Tháng Ba','Tháng Tư','Tháng Năm','Tháng Sáu','Tháng Bảy','Tháng Tám','Tháng Chín','Tháng Mười','Tháng Mười Một','Tháng Mười Hai'],
                monthNamesShort: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
                dayNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'],
                dayNamesShort: ['CN', 'Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7',],
                header: {
                    left: 'prev,next',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                views: {
                    month: { timeFormat: 'H:mm' },
                    agendaWeek: { columnHeaderFormat: 'ddd DD/MM' }
                },
                events: function(start, end, timezone, callback) {
                    _this.getData(items => {
                        callback(items.map(item => _this.getEventObject({}, item)));
                    });
                    },
                select: (startDate, endDate) => {
                    this.onCalendarSelect(startDate.toDate(), endDate.toDate());
                },
                eventClick: function(calEvent) {
                    _this.eventSelect = calEvent;
                    _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                },
                aspectRatio:  isLecturer ? 3 : 2,
            });
        });
    }

    getEventObject = (currentEnvent = {}, newItem) => {
        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let date = new Date(newItem.date);
        const year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate();
        
        const newEvent = {
            ...currentEnvent,
            title: `${newItem.student ? newItem.student.lastname + ' ' + newItem.student.firstname : ''}`,
            start: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour)}:00:00`,
            end: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour + newItem.numOfHours)}:00:00`,
            item: newItem,
            textColor:'white',
            color: RegisterCalendarStatesMapper[newItem.state] && RegisterCalendarStatesMapper[newItem.state].color,
        };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getTimeTableOfLecturer({ courseId: this.props.courseId, lecturerId: this.props.lecturerId, official: this.props.official, filterType: this.props.filterType }, data => {
           done && done(data.items);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modal.show(data);
    }

    onModalFormSave = (_id, data, done) => {
        if(!_id){
            const {selectedSectionHours, selectedSectionOverTimeHours } = data;
            const list = selectedSectionHours.concat(selectedSectionOverTimeHours);
                const handleCreateTimeTable = (index = 0) => {
                    if (index == list.length) {
                        done && done();
                        this.getTimeTablePage();
                        // window.location.reload();
                    } else {
                        let newData = { 
                            date: data.date, 
                            startHour: list[index].startHour, 
                            numOfHours: 1,
                            car:data.car,
                            student:data.student,
                            state:'approved', 
                            lecturer:this.props.lecturerId,
                        };
                        this.props.createTimeTableByAdmin(newData, item => {
                            handleCreateTimeTable(index + 1);
                            const newEvent = this.getEventObject({}, item);
                            $(this.calendar).fullCalendar('renderEvent', newEvent);
                        });
                    }
                };
                handleCreateTimeTable();
        }else{
            done && done();// không có hàm update, chỗ này chỉ cho xem thôi, nên khi save thì chỉ đóng modal
        }
        
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        this.modal.show(data);
    }

    deleteCalendar = (_id) => {
        this.props.deleteTimeTableByAdmin(_id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, filterType: this.props.filterType});
        if (this.eventSelect) {
            $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
            this.eventSelect = null;
        }
    }

    updateState = (item, state) => this.updateTimeTable(item._id, { state });
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thời khóa biểu', 'Bạn có chắc muốn xoá thời khóa biểu này?', true, isConfirm =>
        isConfirm && this.props.deleteTimeTableByAdmin(item._id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, official: this.props.official, filterType: this.props.filterType } ));
        
    getPage = (pageNumber, pageSize) => this.getTimeTablePage(pageNumber, pageSize);

    getTimeTablePage = (pageNumber, pageSize) => {
        this.props.getTimeTablePageByAdmin(pageNumber, pageSize, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, official: this.props.official, filterType: this.props.filterType });
    }

    updateTimeTable = (_id, data, done) => {
        this.props.updateTimeTableByAdmin(_id, data, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, official: this.props.official, filterType: this.props.filterType }, item => {
            done && done(item);
        });
    }

    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
        this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const listTeacherDateOff = this.props.registerCalendar && this.props.registerCalendar.list ? this.props.registerCalendar.list:[];
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const stateText = RegisterCalendarStatesMapper[item.state] ? RegisterCalendarStatesMapper[item.state].text : ' ',
                dropdownState = <Dropdown items={RegisterCalendarStates} item={stateText} onSelected={e => this.updateState(item, e.id)} />;
                return (
                    <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='link' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                        <TableCell type='text' content={item.student && item.student.user && item.student.user.phoneNumber ? T.mobileDisplay(item.student.user.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                        {/* <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} /> */}
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.dateNumber} />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                        {/* <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} /> */}
                        <TableCell type='number' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.car && item.car.licensePlates} />
                        <TableCell type='checkbox' content={item.truant} permission={permission} onChanged={active =>  T.confirm('Học viên vắng học', 'Bạn có chắc muốn thay đổi trạng thái học viên nghỉ học?', true, isConfirm =>
                            isConfirm && this.updateTimeTable(item._id, { truant: active })) }/>
                        {this.state.isCourseAdmin ? 
                            <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />:
                            <TableCell type='text' content={RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                        }
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}>
                            {this.state.isCourseAdmin && (item.state == 'approved' || item.state == 'reject')  &&
                                <a className='btn btn-success' href='#' onClick={e => e.preventDefault() || this.notiModal.show(item)}>
                                    <i className='fa fa-lg fa-paper-plane' />
                                </a>}
                        </TableCell>
                        
                    </tr>
            );
        },
        });
        return (<>
                <div>
                    {this.props.list ? table : null}
                    {this.props.calendar ? 
                    <div ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <TimeTableModal ref={e => this.modal = e} getTimeTabletAll = {this.props.getTimeTabletAll} listTeacherDateOff={listTeacherDateOff} isCourseAdmin={this.state.isCourseAdmin} readOnly={!permission.write||!this.state.isCourseAdmin} courseItem={courseItem} getStudent={this.props.getStudent} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createTimeTableByAdmin} update={this.props.updateTimeTableByAdmin} delete={this.deleteCalendar} getDateNumber={this.props.getTimeTableDateNumber} getPage={this.props.getTimeTablePageByAdmin} getTimeTableOfLecturer={this.props.getTimeTableOfLecturer} onSave={this.onModalFormSave} getCarOfLecturer={this.props.getCarOfLecturer}  /> 
                 <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} getUserChatToken={this.props.getUserChatToken} data={this.state.data} dataHuyThoiKhoaBieu={this.state.dataHuyThoiKhoaBieu} />
                 <Pagination name='pageTimeTable' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.getPage} />
                {this.state.isCourseAdmin ?
                    permission.write && <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button>
                     : null}
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, timeTable: state.trainning.timeTable,registerCalendar:state.trainning.registerCalendar });
const mapActionsToProps = { getTimeTablePageByAdmin, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getCourse, getStudent, getTimeTableOfLecturer, getCarOfLecturer,getAllRegisterCalendars,getTimeTabletAll,createTimeTableMulti, getUserChatToken, createNotification, getNotificationTemplateAll };
export default connect(mapStateToProps, mapActionsToProps)(LecturerView);

