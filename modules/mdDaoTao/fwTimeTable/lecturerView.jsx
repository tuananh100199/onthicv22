import React from 'react';
import { connect } from 'react-redux';
import {getTimeTablePageByAdmin, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getTimeTableOfLecturer } from './redux';
import { getStudent, ajaxSelectStudentOfLecturer } from 'modules/mdDaoTao/fwStudent/redux';
import {  getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormRichTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';
import { RegisterCalendarStates, RegisterCalendarStatesMapper } from 'modules/mdDaoTao/fwRegisterCalendar/index';
import Dropdown from 'view/component/Dropdown';

class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, note, truant } = item.data || { note: '', truant: false };
        this.itemNote.value(note);
        this.itemTruant.value(truant);

        this.setState({ loading: false, _id, student });
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const changes = {
                note: this.itemNote.value(),
                truant: this.itemTruant.value(),
            };
            this.props.update(_id, changes, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: false}, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Ghi chú',
            body: <>
                <FormCheckbox ref={e => this.itemTruant = e} label='Học viên nghỉ học' isSwitch={true} readOnly={this.props.readOnly} />
                <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' readOnly={this.props.readOnly} />
            </>,
        });
    }
}

class TimeTableModal extends AdminModal {
    state = {listTimeTable: null};
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

        const { _id, student, dateNumber, date, startHour, numOfHours, state, truant, licensePlates, content, note } = item.data || { date: item.start ? item.start.toISOString() : null, startHour: 8, numOfHours: 2, state: 'waiting', truant: false, licensePlates: '', content: '', note: '' },
            endHour = startHour + numOfHours;
        this.itemStudent.value(student ? student._id : null);
        this.itemDate.value(date);
        this.itemStartHour.value(startHour);
        this.itemNumOfHours.value(numOfHours);
        this.itemLicensePlates.value(licensePlates);
        this.itemTruant.value(truant);
        this.itemContent.value(content);
        this.itemNote.value(note);
        this.itemState && this.itemState.value(state);

        this.setState({ loading: false, _id, student, dateNumber, date, startHour, endHour });
        date ? this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: formatDate(date)}, data => {
            if (data.items && data.items.length){
                this.setState({ listTimeTable: data.items }, () => this.getDateNumber());
            } else {
                this.setState({ listTimeTable: null });
            }
        }) : null;
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const data = {
                student: student ? student._id : null,
                date: this.itemDate.value(),
                startHour: this.itemStartHour.value(),
                numOfHours: Number(this.itemNumOfHours.value()),
                state: this.itemState.value(),
                truant: this.itemTruant.value(),
                licensePlates: this.itemLicensePlates.value(),
                content: this.itemContent.value(),
                note: this.itemNote.value(),
            };
            if (data.date == '') {
                T.notify('Ngày học chưa được chọn!', 'danger');
                this.itemDate.focus();
            } else if (data.startHour == '') {
                T.notify('Giờ bắt đầu chưa được chọn!', 'danger');
                this.itemStartHour.focus();
            } else if (data.numOfHours == '') {
                T.notify('Số giờ học chưa được chọn!', 'danger');
                this.itemNumOfHours.focus();
            } else if (data.licensePlates == '') {
                T.notify('Xe học chưa được chọn!', 'danger');
                this.itemLicensePlates.focus();
            } else if (!_id && this.state.dateNumber == -1) {
                T.notify('Trùng thời khóa biểu!', 'danger');
                this.itemStartHour.focus();
            } else {
                let today  = new Date();
                const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                data.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate());
                if (!_id && data.date < currentDate) {
                    T.notify('Ngày học không được nhỏ hơn ngày hiện tại!', 'danger');
                    this.itemDate.focus();
                } else {
                    this.props.onSave(_id, data, () => this.hide());
                }
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
        this.setState({ loading: false, student }, () => this.state._id || this.getDateNumber());
    }));

    onSelectDate = (date => { 
        if(date) {
            this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: date }, data => {
                this.setState({ date, listTimeTable: data.items &&  data.items.length ? data.items : null }, () => this.getDateNumber());
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
        const { _id, student } = this.state,
            date = new Date(this.state.date),
            startHour = this.itemStartHour.value(),
            numOfHours = this.itemNumOfHours.value();
        if (student && date && startHour != null) {
            this.props.getDateNumber(_id, student._id, new Date(date.getFullYear(), date.getMonth(), date.getDate()), startHour,numOfHours, (dateNumber) => this.setState({ dateNumber }));
        }
    }

    render = () => {
        const { loading, date, dateNumber, student, listTimeTable } = this.state;
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
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.student ? item.student.lastname + ' ' + item.student.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student ? item.student.identityCard : ''}  />
                    <TableCell type='text' content={ item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                </tr>
            ),
        });
        return this.renderModal({
            title: 'Buổi học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    <FormSelect ref={e => this.itemStudent = e} label='Học viên' data={ajaxSelectStudentOfLecturer(this.props.courseId, this.props.lecturerId)} onChange={this.onChangeStudent} className='col-lg-6' readOnly={this.props.readOnly} />
                    {student ? <p className='col-lg-5'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p> : null}
                    {loading ? <p className='col-12'>Đang tải...</p> : ''}
                </div>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <FormDatePicker className='col-12 col-md-4' ref={e => this.itemDate = e} label='Ngày học' onChange={this.onSelectDate} readOnly={this.props.readOnly} type='date-mask' required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemNumOfHours = e} label='Số giờ học' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                    
                    <p className='col-md-6'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-md-6'> {dateNumber == null ? '' :
                        (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                    </p>
                    {listTimeTable && listTimeTable.length && date != null ? 
                    <div className='col-md-12'>
                        <p>
                            Lịch dạy ngày <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span><span> của cố vấn <b>{this.props.lecturerName ? this.props.lecturerName : ''}</b></span>
                        </p>
                        {table}
                    </div> : ''}

                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Xe học' className='col-md-4' style={{ textTransform: 'uppercase' }} readOnly={this.props.readOnly} required />
                    <FormCheckbox ref={e => this.itemTruant = e} label='Học viên vắng học' className='col-md-4' readOnly={this.props.readOnly} />
                    <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} readOnly={this.props.readOnly} /> 

                    <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung học' className='col-lg-6' readOnly={this.props.readOnly} />
                    <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' className='col-lg-6' readOnly={this.props.readOnly} />
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
        const { courseId, lecturerId, filterOn, official } = this.props;
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
            this.props.getTimeTablePageByAdmin(undefined, undefined, { courseId: courseId, lecturerId: lecturerId, filterOn: filterOn, official: official });
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
        color: '#1488DB',
    };
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getTimeTablePageByAdmin(undefined, undefined, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, official: this.props.official}, item => {
           done && done(item.list);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modalCourseAdmin.show(data);
    }

    onModalFormSave = (_id, data, done) => {
        _id ? this.props.updateTimeTableByAdmin(_id, data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
            done && done();
            if (this.eventSelect) {
                const eventSelect = this.getEventObject(this.eventSelect, item);
                $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
                $(this.calendar).fullCalendar('renderEvent', eventSelect);
                this.eventSelect = null;
            }
        }) : this.props.createTimeTableByAdmin(data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, data => {
            done && done();
            const newEvent = this.getEventObject({}, data);
            $(this.calendar).fullCalendar('renderEvent', newEvent);
        });
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        if (this.state.isLecturer) {
            this.modalLecturer.show(data);
        } else if (this.state.isCourseAdmin) {
            this.modalCourseAdmin.show(data);
        }
    }

    deleteCalendar = (_id) => {
        this.props.deleteTimeTableByAdmin(_id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn});
        if (this.eventSelect) {
            $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
            this.eventSelect = null;
        }
    }

    updateState = (item, state) => this.props.updateTimeTableByAdmin(item._id, { state }, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn});
    
    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thời khóa biểu', 'Bạn có chắc muốn xoá thời khóa biểu này?', true, isConfirm =>
        isConfirm && this.props.deleteTimeTableByAdmin(item._id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn} ));
        
    getPage = (pageNumber, pageSize) => this.props.getTimeTablePageByAdmin(pageNumber, pageSize, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn, official: this.props.official });

    render() {
        const courseItem = this.props.course && this.props.course.item ? this.props.course.item : {};
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const permission = this.getUserPermission('timeTable');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.timeTable && this.props.timeTable.page ?
        this.props.timeTable.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Số điện thoại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
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
                        <TableCell type='text' content={<><span>{item.student && item.student.course ? item.student.course.name : ''}</span><br />{item.student && item.student.courseType ? item.student.courseType.title : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.dateNumber} />
                        <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.licensePlates} />
                        <TableCell type='checkbox' content={item.truant} permission={permission} onChanged={active =>  T.confirm('Học viên vắng học', 'Bạn có chắc muốn thay đổi trạng thái học viên nghỉ học?', true, isConfirm =>
                            isConfirm && this.props.updateTimeTableByAdmin(item._id, { truant: active }, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn} )) }/>
                        <TableCell content={dropdownState} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} />
                        <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
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
                <NoteModal ref={e => this.modalLecturer = e} readOnly={!permission.write} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn} 
                    update={this.props.updateTimeTableByAdmin} />
                <TimeTableModal ref={e => this.modalCourseAdmin = e} readOnly={!permission.write} courseItem={courseItem} getStudent={this.props.getStudent} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createTimeTableByAdmin} update={this.props.updateTimeTableByAdmin} delete={this.deleteCalendar} getDateNumber={this.props.getTimeTableDateNumber} getPage={this.props.getTimeTablePageByAdmin} getTimeTableOfLecturer={this.props.getTimeTableOfLecturer} onSave={this.onModalFormSave}  /> 
                 <Pagination name='pageTimeTable' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.getPage} />
                {this.state.isCourseAdmin ?
                    <button type='button' className='btn btn-success btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.edit}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}
            </>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, timeTable: state.trainning.timeTable });
const mapActionsToProps = { getTimeTablePageByAdmin, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getCourse, getStudent, getTimeTableOfLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerView);

