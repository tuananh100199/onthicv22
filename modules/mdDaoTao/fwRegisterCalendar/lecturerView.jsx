import React from 'react';
import { connect } from 'react-redux';
import {getRegisterCalendarPageByAdmin, getAllRegisterCalendars, updateRegisterCalendarByAdmin, createRegisterCalendarByAdmin, deleteRegisterCalendarByAdmin, getRegisterCalendarOfLecturer } from './redux';
import {  getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import Pagination from 'view/component/Pagination';
import Dropdown from 'view/component/Dropdown';
import { AdminPage, AdminModal, TableCell, renderTable, FormDatePicker, FormSelect } from 'view/component/AdminPage';
import { RegisterCalendarStates, RegisterCalendarStatesMapper, timeOffStates, timeOffStatesMapper } from './index';
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

        const { _id, lecturer, dateOff, timeOff, state } = item.data || { dateOff: item.start ? item.start.toISOString() : null, timeOff: 'allDay', state: 'waiting' };
        this.itemDate.value(dateOff);
        this.itemTimeOff.value(timeOff);
        this.itemState && this.itemState.value(state);

        this.setState({ loading: false, _id, lecturer, dateOff, state });
        dateOff ? this.props.getRegisterCalendarOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, dateOff: formatDate(dateOff)}, data => {
            if (data.items && data.items.length){
                this.setState({ listRegisterCalendar: data.items });
            } else {
                this.setState({ listRegisterCalendar: null });
            }
        }) : null;
    }

    onSubmit = () => {
        const { _id } = this.state;
        const data = {
            lecturer: this.props.lecturerId,
            state: this.itemState.value(),
            dateOff: this.itemDate.value(),
            timeOff: this.itemTimeOff.value(),
        };
        if (data.dateOff == '') {
            T.notify('Ngày nghỉ chưa được chọn!', 'danger');
            this.itemDate.focus();
        } else if (data.timeOff == '') {
            T.notify('Buổi nghỉ chưa được chọn!', 'danger');
            this.itemStartHour.focus();
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

    delete = () => T.confirm('Xóa lịch dạy', 'Bạn có chắc chắn muốn xóa lịch dạy này?', isConfirm => {
        isConfirm && this.props.delete(this.state._id);
        this.hide();
    })

    cancel = () => {
        const { state } = this.state;
        const data = {
            state: state == 'cancel' ? 'waiting' : 'cancel',
        };
        T.confirm(`${data.state == 'cancel' ? 'Hủy lịch nghỉ' : 'Bỏ hủy lịch nghỉ'}`, `Bạn có chắc chắn muốn ${data.state == 'cancel' ? 'hủy' : 'bỏ hủy'} lịch nghỉ này?`, isConfirm => {
            isConfirm && this.props.onSave(this.state._id, data, () => this.hide());
         });
    }

    onSelectDate = (dateOff => { 
        if(dateOff) {
            this.props.getRegisterCalendarOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, dateOff: dateOff }, data => {
                this.setState({ dateOff, listRegisterCalendar: data.items &&  data.items.length ? data.items : null });
            });
        }
    });

    render = () => {
        const { _id, state } = this.state;
        const courseItem = this.props.courseItem;
        return this.renderModal({
            title: 'Lịch dạy thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <p className='col-md-6'>Khóa học: <b>{courseItem && courseItem.name ? courseItem.name   : ''}</b>. Hạng LX: <b>{courseItem && courseItem.courseType ? courseItem.courseType.title : ''}</b></p>
                    <p  className='col-lg-6' label='Giáo viên' readOnly={true} >Giáo viên: <span style={{fontWeight: 700}}>{this.props.lecturerName}</span> </p>
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} readOnly={!this.props.isCourseAdmin} /> 
                    <FormDatePicker className='col-md-4' ref={e => this.itemDate = e} label='Ngày nghỉ' onChange={this.onSelectDate} readOnly={(state == 'approved' || state == 'reject') && this.props.isLecturer} type='date-mask' required />
                    <FormSelect className='col-md-4' ref={e => this.itemTimeOff = e} label='Thời gian nghỉ'  data={timeOffStates} readOnly={(state == 'approved' || state == 'reject') && this.props.isLecturer} /> 
                </div>
            </>,
            buttons: <>
                { _id && this.props.calendar && this.props.isCourseAdmin ? <button type='button' className='btn btn-danger' onClick={() => this.delete()}>Xóa</button> : null }
                { _id && this.props.isLecturer && (state == 'waiting' || state == 'cancel') ? <button type='button' className='btn btn-danger' onClick={() => this.cancel()}>{state == 'cancel' ? 'Bỏ hủy' : 'Hủy' }</button> : null }
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
                    month: { timeFormat: 'H:mm' },
                    agendaWeek: { columnHeaderFormat: 'ddd DD/MM' }
                },
                events: function(start, end, timezone, callback) {
                    _this.getData(items => {
                        callback(items.map(item => _this.getEventObject({}, item)));
                    });
                    },
                select: (start, end) => {
                    if (isLecturer && start.toDate().getDay() != '5' && start.toDate().getDay() != '6') {
                        this.onCalendarSelect(start.toDate(), end.toDate());
                    } else {
                        this.onCalendarSelect(start.toDate(), end.toDate());
                    }
                },
                eventClick: function(calEvent) {
                    _this.eventSelect = calEvent;
                    if (isLecturer && calEvent.start.toDate().getDay() != '5' && calEvent.start.toDate().getDay() != '6') {
                        _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                    } else {
                        _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                    }
                   
                },
                aspectRatio:  isLecturer ? 3 : 2,
            });
        });
    }

    getEventObject = (currentEnvent = {}, newItem) => {

        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let dateOff = new Date(newItem.dateOff);
        const year = dateOff.getFullYear(),
            month = dateOff.getMonth() + 1,
            day = dateOff.getDate();
        
        const newEvent = {
        ...currentEnvent,
        title: `${newItem.lecturer ? newItem.lecturer.lastname + ' ' + newItem.lecturer.firstname : ''}`,
        start: `${year}-${formatTime(month)}-${formatTime(day)}T${newItem.timeOff == 'noon' ? '13' : '07'}:00:00`,
        end: `${year}-${formatTime(month)}-${formatTime(day)}T${newItem.timeOff == 'morning' ? '11' : '17'}:00:00`,
        item: newItem,
        textColor:'white',
        color: newItem.state ==  'approved' ? 'red' : RegisterCalendarStatesMapper[newItem.state] && RegisterCalendarStatesMapper[newItem.state].color,
    };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getAllRegisterCalendars({ courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn }, list => {
           done && done(list);
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

    updateState = (item, state) => this.props.updateRegisterCalendarByAdmin(item._id, { state }, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn});

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
                    <th style={{ width: '40%' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày nghỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi nghỉ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => {
                const stateText = RegisterCalendarStatesMapper[item.state] ? RegisterCalendarStatesMapper[item.state].text : ' ',
                dropdownState = <Dropdown items={RegisterCalendarStates} item={stateText} onSelected={e => this.updateState(item, e.id)} />;
                return (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.dateOff, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.lecturer ? item.lecturer.lastname + ' ' + item.lecturer.firstname : ''}<br />{item.lecturer ? item.lecturer.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={courseItem && courseItem.name ? courseItem.name : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.lecturer ? item.lecturer.identityCard : ''} style={{ whiteSpace: 'nowrap' }} onClick={e => this.edit(e, item)} />
                    <TableCell type='text' content={item.lecturer && item.lecturer.phoneNumber ? T.mobileDisplay(item.lecturer.phoneNumber) : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.dateOff ? T.dateToText(item.dateOff, 'dd/mm/yyyy') : ''} />
                    <TableCell type='text' content={timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: timeOffStatesMapper[item.timeOff] && timeOffStatesMapper[item.timeOff].color }}  nowrap='true'/>
                    {this.state.isCourseAdmin ? 
                    <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />:
                    <TableCell type='text' content={RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                    }
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ); 
        },
        });
        return (<>
                <div>
                    {this.props.list ? table : null}
                    {this.props.calendar ? 
                    <div id='calendar' ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <RegisterCalendarModal ref={e => this.modalCourseAdmin = e} readOnly={false} isCourseAdmin={this.state.isCourseAdmin} isLecturer={this.state.isLecturer} courseItem={courseItem} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createRegisterCalendarByAdmin} update={this.props.updateRegisterCalendarByAdmin} delete={this.deleteCalendar} getPage={this.props.getRegisterCalendarPageByAdmin} getRegisterCalendarOfLecturer={this.props.getRegisterCalendarOfLecturer} onSave={this.onModalFormSave}  /> 
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
const mapActionsToProps = { getRegisterCalendarPageByAdmin, getAllRegisterCalendars, updateRegisterCalendarByAdmin, createRegisterCalendarByAdmin, deleteRegisterCalendarByAdmin, getCourse, getRegisterCalendarOfLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerView);