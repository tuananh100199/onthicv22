import React from 'react';
import { connect } from 'react-redux';
import {getTimeTablePageByAdmin, updateTimeTableByAdmin, createTimeTableByAdmin, deleteTimeTableByAdmin, getTimeTableDateNumber, getTimeTableOfLecturer } from './redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import {  getCourse, ajaxSelectStudentOfLecturer } from 'modules/mdDaoTao/fwCourse/redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox, FormCheckbox, FormRichTextBox, FormSelect, FormDatePicker } from 'view/component/AdminPage';



class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, note, truant } = item || { note: '', truant: false };
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
            this.props.update(_id, changes, {courseId: this.props.courseId, lecturerId: this.props.lecturerId}, () => this.hide());
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
    state = {};
    onShow = (item) => {
        console.log('item', item);
        const { _id, student, dateNumber, date, startHour, numOfHours, truant, licensePlates, content, note } = item || { date: item.start ? item.start : null, startHour: 8, numOfHours: 2, truant: false, licensePlates: '', content: '', note: '' },
            endHour = startHour + numOfHours;
        this.itemStudent.value(student ? student._id : null);
        this.itemDate.value(date);
        this.itemStartHour.value(startHour);
        this.itemNumOfHours.value(numOfHours);
        this.itemLicensePlates.value(licensePlates);
        this.itemTruant.value(truant);
        this.itemContent.value(content);
        this.itemNote.value(note);

        this.setState({ loading: false, _id, student, dateNumber, date, startHour, endHour });
        item ? this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: date }, data => {
            if (data.items){
                this.setState({ listTimeTable: data.items }, () => this.getDateNumber());
            } 
        }) :  this.setState({ listTimeTable: null });
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const data = {
                student: student ? student._id : null,
                date: this.itemDate.value(),
                startHour: this.itemStartHour.value(),
                numOfHours: this.itemNumOfHours.value(),
                truant: this.itemTruant.value(),
                licensePlates: this.itemLicensePlates.value(),
                content: this.itemContent.value(),
                note: this.itemNote.value(),
            };
            if (data.date == null) {
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
                    this.props.onSave(_id, data, () => {
                        this.hide();
                    });
                }
            }
        }
    }

    onChangeCourse = (data) => data && data.id && this.setState({ courseType: data.id }, () => {
        this.itemStudent.value(null);
    });

    onChangeStudent = (data) => data && data.id && this.setState({ loading: true }, () => this.props.getStudent(data.id, student => {
        this.setState({ loading: false, student }, () => this.state._id || this.getDateNumber());
    }));

    onSelectDate = (date => { 
        if(date) {
            this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: date }, data => {
                this.setState({ date, listTimeTable: data.items }, () => this.getDateNumber());
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
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={<>{item.student ? item.student.lastname + ' ' + item.student.firstname : ''}<br />{item.student ? item.student.identityCard : ''}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
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
                    {loading ? <p className='col-12'>Đang tải...</p> : ''}
                </div>
                <div className='row' style={{ display: student ? 'flex' : 'none' }}>
                    <p className='col-lg-7'>Khóa học: <b>{student && student.course ? student.course.name : ''}</b>. Hạng LX: <b>{student && student.courseType ? student.courseType.title : ''}</b></p>
                    <p className='col-lg-5'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p>

                    <FormDatePicker className='col-12 col-md-4' ref={e => this.itemDate = e} label='Ngày học' onChange={this.onSelectDate} readOnly={this.props.readOnly} type='date-mask' required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemStartHour = e} label='Giờ bắt đầu' type='number' min='0' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                    <FormTextBox className='col-6 col-md-4' ref={e => this.itemNumOfHours = e} label='Số giờ học' type='number' min='1' max='23' onChange={this.onChangeHour} readOnly={this.props.readOnly} required />
                    
                    <div className='col-12' style={{ visibility: date &&  listTimeTable && listTimeTable.length ? 'visible' : 'hidden' }}>
                        {listTimeTable == null ? '' : <>
                            <p> {dateNumber == null ? '' :
                                (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                            </p>
                            <p>{date == null ? '' : <>
                                Lịch học: <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span></>}
                            </p>
                            {table}
                        </> }
                    </div>

                    <FormTextBox ref={e => this.itemLicensePlates = e} label='Xe học' className='col-md-4' style={{ textTransform: 'uppercase' }} readOnly={this.props.readOnly} required />
                    <FormCheckbox ref={e => this.itemTruant = e} label='Học viên vắng học' className='col-md-8' readOnly={this.props.readOnly} />

                    <FormRichTextBox ref={e => this.itemContent = e} label='Nội dung học' className='col-lg-6' readOnly={this.props.readOnly} />
                    <FormRichTextBox ref={e => this.itemNote = e} label='Ghi chú' className='col-lg-6' readOnly={this.props.readOnly} />
                </div>
            </>,
        });
    }
}

class LecturerView extends AdminPage {
    state = {};
    eventSelect = null;
    componentDidMount() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user;
        const courseId = this.props.courseId, 
            lecturerId = this.props.lecturerId,
            filterOn = this.props.filterOn;
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
            this.props.getTimeTablePageByAdmin(undefined, undefined, { courseId: courseId, lecturerId: lecturerId, filterOn: filterOn});
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
        let date = new Date(newItem.date);
        const newEvent = {
        ...currentEnvent,
        title: `${newItem.startHour}-${newItem.startHour + newItem.numOfHours} ${newItem.student ? newItem.student.lastname + ' ' + newItem.student.firstname : ''}`,
        start: date,
        // end: (newItem.date + 1) + + `T${newItem.startHour + newItem.numOfHours}:00:00`,
        // className: `calendar-event-${EnumTrangThaiDksd[newItem.trangThai]}`,
        item: newItem,
        // color: newItem.trangThai == 0 && new Date() > new Date(newItem.ngayBatDau) ? '#7b8494' : '',
    };
        // if (userEmail && userEmail == newItem?.emailNguoiTao) {
        //     newEvent['textColor'] = '#511a6b !important';
        // }
        // console.log(newEvent);
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getTimeTablePageByAdmin(undefined, undefined, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
           done && done(item.list);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, ...item };
        this.modalCourseAdmin.show(data);
    }

    onModalFormSave = (_id, data, done) => {

        _id ? this.props.updateTimeTableByAdmin(_id, data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
            // console.log('data-update', item);
            done && done();
            if (this.eventSelect) {
                const eventSelect = this.getEventObject(this.eventSelect, item);
                $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
                $(this.calendar).fullCalendar('renderEvent', eventSelect);
                this.eventSelect = null;
            }
        }) : this.props.createTimeTableByAdmin(data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, data => {
            // console.log('data-create', data);
            done && done();
            const newEvent = this.getEventObject({}, data);
            $(this.calendar).fullCalendar('renderEvent', newEvent);
        });
    }

    edit = (e, item) => {
        e.preventDefault();
        if (this.state.isLecturer) {
            this.modalLecturer.show(item);
        } else if (this.state.isCourseAdmin) {
            this.modalCourseAdmin.show(item);
        }
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Xoá thời khóa biểu', 'Bạn có chắc muốn xoá thời khóa biểu này?', true, isConfirm =>
        isConfirm && this.props.deleteTimeTableByAdmin(item._id, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn} ));
        
    getPage = (pageNumber, pageSize) => this.props.getTimeTablePageByAdmin(pageNumber, pageSize, { courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn });

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
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
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
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete} />
                </tr>
            ),
        });
        return (<>
                <div>
                    {this.props.list ? table : null}
                    {this.props.grid ? 
                    <div ref={e => this.calendar = e}></div>
                    : null} 
                </div>
                <NoteModal ref={e => this.modalLecturer = e} readOnly={!permission.write} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn}
                    update={this.props.updateTimeTableByAdmin} />
                <TimeTableModal ref={e => this.modalCourseAdmin = e} readOnly={!permission.write} courseItem={courseItem} getStudent={this.props.getStudent} courseId={this.props.courseId} lecturerId={this.props.lecturerId} filterOn={this.props.filterOn}
                    create={this.props.createTimeTableByAdmin} update={this.props.updateTimeTableByAdmin} getDateNumber={this.props.getTimeTableDateNumber} getPage={this.props.getTimeTablePageByAdmin} getTimeTableOfLecturer={this.props.getTimeTableOfLecturer} onSave={this.onModalFormSave}  /> 
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

