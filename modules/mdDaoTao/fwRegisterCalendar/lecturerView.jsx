import React from 'react';
import { connect } from 'react-redux';
import {getRegisterCalendarPageByAdmin, updateRegisterCalendarByAdmin, createRegisterCalendarByAdmin, deleteRegisterCalendarByAdmin, getRegisterCalendarDateNumber, getRegisterCalendarOfLecturer } from './redux';
import {  getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormDatePicker, FormSelect } from 'view/component/AdminPage';
const RegisterCalendarStates = [
    { id: 'approved', text: 'Đã duyệt', color: '#1488db', className: 'btn btn-primary', icon: 'fa fa-lg fa-check' },
    { id: 'waiting', text: 'Đang chờ duyệt', color: '#ffc107', className: 'btn btn-warning', icon: 'fa fa-lg fa-clock-o' },
    { id: 'reject', text: 'Từ chối', color: '#dc3545', className: 'btn btn-danger', icon: 'fa fa-lg fa-times' },
];
const RegisterCalendarStatesMapper = {};
RegisterCalendarStates.forEach(({ id, text, color }) => RegisterCalendarStatesMapper[id] = { text, color });

class RegisterCalendarModal extends AdminModal {
    state = {listRegisterCalendar: null};
    onShow = (item) => {
        function formatDayOrMonth(item){
            return ('0' + item).slice(-2);
        }

        function formatDate(item) {
            let date = new Date(item);
            const year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate()-1;

            return `${year}-${formatDayOrMonth(month)}-${formatDayOrMonth(day)}T17:00:00.000Z`;// chuyển ngày trong calendar sang định dạng lưu trong DB
        }

        const { _id, lecturer, dateNumber, dateOff, startHour, numOfHours, state } = item.data || { dateOff: item.start ? item.start.toISOString() : null, startHour: 8, numOfHours: 2, state: 'waiting' },
            endHour = startHour + numOfHours;
        this.itemlecturer.value(lecturer ? lecturer.lastname + '' + lecturer.firstname : null);
        this.itemDate.value(dateOff);
        this.itemStartHour.value(startHour);
        this.itemNumOfHours.value(numOfHours);
        this.itemState && this.itemState.value(state);

        this.setState({ loading: false, _id, lecturer, dateNumber, dateOff, startHour, endHour });
        dateOff ? this.props.getRegisterCalendarOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, dateOff: formatDate(dateOff)}, data => {
            if (data.items && data.items.length){
                this.setState({ listRegisterCalendar: data.items }, () => this.getDateNumber());
            } else {
                this.setState({ listRegisterCalendar: null });
            }
        }) : null;
    }

    onSubmit = () => {
        const { _id } = this.state;
        const data = {
            dateOff: this.itemDate.value(),
            startHour: this.itemStartHour.value(),
            numOfHours: Number(this.itemNumOfHours.value()),
        };
        if (data.dateOff == '') {
            T.notify('Ngày nghỉ chưa được chọn!', 'danger');
            this.itemDate.focus();
        } else if (data.startHour == '') {
            T.notify('Giờ bắt đầu chưa được chọn!', 'danger');
            this.itemStartHour.focus();
        } else if (data.numOfHours == '') {
            T.notify('Số giờ học chưa được chọn!', 'danger');
            this.itemNumOfHours.focus();
        } else {
            let today  = new Date();
            const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            data.dateOff = new Date(data.dateOff.getFullYear(), data.dateOff.getMonth(), data.dateOff.getDate());
            if (!_id && data.dateOff < currentDate) {
                T.notify('Ngày nghỉ không được nhỏ hơn ngày hiện tại!', 'danger');
                this.itemDate.focus();
            } else {
                this.props.onSave(_id, data, () => this.hide());
            }
        }
    }

    delete = () => T.confirm('Xóa lịch dạy', 'Bạn có chắc chắn xóa lịch dạy này?', isConfirm => {
        isConfirm && this.props.delete(this.state._id);
        this.hide();
    })

    onSelectDate = (dateOff => { 
        if(dateOff) {
            this.props.getRegisterCalendarOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, dateOff: dateOff }, data => {
                this.setState({ dateOff, listRegisterCalendar: data.items &&  data.items.length ? data.items : null }, () => this.getDateNumber());
            });
        }
    });

    onChangeHour = () => {
        let startHour = this.itemStartHour.value(),
            numOfHours = this.itemNumOfHours.value();
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
        const { _id, lecturer } = this.state,
            dateOff = new Date(this.state.dateOff),
            startHour = this.itemStartHour.value(),
            numOfHours = this.itemNumOfHours.value();
        if (lecturer && dateOff && startHour != null) {
            this.props.getDateNumber(_id, lecturer._id, new Date(dateOff.getFullYear(), dateOff.getMonth(), dateOff.getDate()), startHour,numOfHours, (dateNumber) => this.setState({ dateNumber }));
        }
    }

    render = () => {
        const courseItem = this.props.courseItem;
        return this.renderModal({
            title: 'Lịch dạy thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <p className='col-md-6'>Khóa học: <b>{courseItem && courseItem.name ? courseItem.name   : ''}</b>. Hạng LX: <b>{courseItem && courseItem.courseType ? courseItem.courseType.title : ''}</b></p>
                    <FormTextBox  className='col-lg-6' ref={e => this.itemlecturer = e} label='Giáo viên' readOnly={true} />
                    <FormSelect className='col-6 col-md-6' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} readOnly={true} /> 
                    <FormDatePicker className='col-12 col-md-6' ref={e => this.itemDate = e} label='Ngày nghỉ' onChange={this.onSelectDate} readOnly={this.props.readOnly} type='date-mask' required />
                    <FormTextBox className='col-6 col-md-6' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                    <FormTextBox className='col-6 col-md-6' ref={e => this.itemNumOfHours = e} label='Số giờ nghỉ' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                </div>
            </>,
            buttons: <>
                {this.state._id && this.props.calendar ? <button type='button' className='btn btn-danger' onClick={() => this.delete()}>Xóa</button> : null}
        </>
        });
    }
}

class LecturerView extends AdminPage {
    state = {};
    eventSelect = null;
    componentDidMount() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user;
        const { courseId, lecturerId, filterOn } = this.props;
        const course = this.props.course ? this.props.course.item : null;

        if (!course) {
            this.props.getCourse(courseId, data => {
                if (data.error) {
                    T.notify('Lấy khóa học bị lỗi!', 'danger');
                    this.props.history.push('/user/course/' + courseId);
                }
            });
        }
        if (courseId && lecturerId) {
            this.setState({ courseId, lecturerId, isLecturer, isCourseAdmin, filterOn });
            this.props.getRegisterCalendarPageByAdmin(undefined, undefined, { courseId: courseId, lecturerId: lecturerId, filterOn: filterOn});
        }

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
                monthNames: ['Tháng Một','Tháng Hai','Tháng Ba','Tháng Bốn','Tháng Năm','Tháng Sáu','Tháng Bảy','Tháng Tám','Tháng Chín','Tháng Mười','Tháng Mười Một','Tháng Mười Hai'],
                monthNamesShort: ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'],
                dayNames: ['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ Nhật'],
                dayNamesShort: ['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'],
                header: {
                    left: 'prev,next',
                    center: 'title',
                    right: 'month,agendaWeek,agendaDay'
                },
                views: {
                    month: { timeFormat: '' },
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
            });
        });
    }

    getEventObject = (currentEnvent = {}, newItem) => {

        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let dateOff = new dateOff(newItem.dateOff);
        const year = dateOff.getFullYear(),
            month = dateOff.getMonth() + 1,
            day = dateOff.getDate();
        
        const newEvent = {
        ...currentEnvent,
        title: `${newItem.lecturer ? newItem.lecturer.lastname + ' ' + newItem.lecturer.firstname : ''}`,
        start: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour)}:00:00`,
        end: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour + newItem.numOfHours)}:00:00`,
        item: newItem,
        color: '#1488DB',
    };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getRegisterCalendarPageByAdmin(undefined, undefined, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
           done && done(item.list);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modalCourseAdmin.show(data);
    }

    onModalFormSave = (_id, data, done) => {
        _id ? this.props.updateRegisterCalendarByAdmin(_id, data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
            done && done();
            if (this.eventSelect) {
                const eventSelect = this.getEventObject(this.eventSelect, item);
                $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
                $(this.calendar).fullCalendar('renderEvent', eventSelect);
                this.eventSelect = null;
            }
        }) : this.props.createRegisterCalendarByAdmin(data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, data => {
            done && done();
            const newEvent = this.getEventObject({}, data);
            $(this.calendar).fullCalendar('renderEvent', newEvent);
        });
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        this.modalCourseAdmin.show(data);
    }

    deleteCalendar = (_id) => {
        this.props.deleteRegisterCalendarByAdmin(_id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn});
        if (this.eventSelect) {
            $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
            this.eventSelect = null;
        }
    }
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá lịch dạy biểu', 'Bạn có chắc muốn xoá lịch dạy này?', true, isConfirm =>
        isConfirm && this.props.deleteRegisterCalendarByAdmin(item._id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn} ));
        
    getPage = (pageNumber, pageSize) => this.props.getRegisterCalendarPageByAdmin(pageNumber, pageSize, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn });

    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('registerCalendar');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.registerCalendar && this.props.registerCalendar.page ?
        this.props.registerCalendar.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '60%' }} nowrap='true'>Giáo viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: '30%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày nghỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ nghỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ nghỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.dateOff, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : ''}<br />{item.lecturer ? item.lecturer.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.lecturer ? item.lecturer.identityCard : ''} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={courseItem && courseItem.name ? courseItem.name : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.lecturer && item.lecturer.phoneNumber ? T.mobileDisplay(item.lecturer.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.dateOff ? T.dateToText(item.dateOff, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    <TableCell type='text' content={RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }} nowrap='true'/>
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });
        return (<>
                <div>
                    {this.props.list ? table : null}
                    {this.props.calendar ? 
                    <div ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <RegisterCalendarModal ref={e => this.modalCourseAdmin = e} readOnly={!permission.write} courseItem={courseItem} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createRegisterCalendarByAdmin} update={this.props.updateRegisterCalendarByAdmin} delete={this.deleteCalendar} getDateNumber={this.props.getRegisterCalendarDateNumber} getPage={this.props.getRegisterCalendarPageByAdmin} getRegisterCalendarOfLecturer={this.props.getRegisterCalendarOfLecturer} onSave={this.onModalFormSave}  /> 
                 <Pagination name='pageRegisterCalendar' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.getPage} />
                <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarPageByAdmin, updateRegisterCalendarByAdmin, createRegisterCalendarByAdmin, deleteRegisterCalendarByAdmin, getRegisterCalendarDateNumber, getCourse, getRegisterCalendarOfLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerView);