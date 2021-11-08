import React from 'react';
import { connect } from 'react-redux';
import { getRegisterCalendarOfLecturerByStudent, getAllRegisterCalendars } from './redux';
import { getTimeTableOfLecturer, createTimeTableByStudent, getTimeTableDateNumber } from 'modules/mdDaoTao/fwTimeTable/redux';
import { getStudentByUser } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormDatePicker, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { RegisterCalendarStates, timeOffStatesMapper, RegisterCalendarStatesMapper, sectionHours } from './index';
class RegisterTimeTableModal extends AdminModal {
    state = { listTimeTable: null, selectedSectionHours: [] };
    sectionHour = {};
    // componentDidMount() {
    //     this.props.getStudentByUser({ user: this.props.userId }, student => {
    //         this.setState({ student });
    //     });
    // }

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

        const { _id, dateNumber, date, startHour, numOfHours, state } = item.data || { date: item.start ? item.start.toISOString() : null, startHour: 7, numOfHours: 1, state: 'waiting' },
            endHour = startHour + numOfHours;
        this.itemDate.value(date);
        this.itemState && this.itemState.value(state);
        let avaiableHours = sectionHours || [], currentTimeTables = [];
        const OffCalendar = this.props.listRegisterCalendar.find(calendar => formatDate(calendar.dateOff) == formatDate(date));
        this.props.getRegisterCalendarOfLecturerByStudent({ date: formatDate(date) }, data => {  //lấy lịch nghỉ và thời khóa biểu theo date
            if (data.listTimeTable && data.listRegisterCalendar){
                if (OffCalendar && OffCalendar.timeOff == 'morning') {
                    avaiableHours = sectionHours.filter(avaiableHour => avaiableHour.startHour > 12);
                } else if (OffCalendar && OffCalendar.timeOff == 'noon' ) {
                    avaiableHours = sectionHours.filter(avaiableHour => avaiableHour.startHour < 12);
                }
                if (data.listTimeTable && data.listTimeTable.length) {
                    data.listTimeTable.forEach(timeTable => {
                        avaiableHours.forEach(sectionHour => { // loại bỏ những giờ học đã có
                            if (sectionHour.startHour == timeTable.startHour) {
                                avaiableHours = avaiableHours.filter(item => item != sectionHour);
                            }
                        });
                        if (timeTable && timeTable.student && this.props.student && timeTable.student._id == this.props.student._id) {
                            currentTimeTables.push(timeTable);
                        }
                    });
                }
                this.setState({ currentTimeTables, listRegisterCalendar: data.listRegisterCalendar, avaiableHours });
            } else {
                this.setState({ currentTimeTables: null });
            }
        });

        this.setState({ loading: false, _id, dateNumber, date, startHour, endHour, OffCalendar });
    }

    onSubmit = () => {
        const { _id, selectedSectionHours } = this.state;
console.log('selectedSectionHours5567', selectedSectionHours);
            const data = {
                date: this.itemDate.value(),
                selectedSectionHours: selectedSectionHours,
            };
            console.log('data-submit', data);
            // console.log('uiuiui', (Number(this.state.currentTimeTables.length) +  Number(data.selectedSectionHours.)));
            // console.log('uiuiui123', (Number(this.state.currentTimeTables.length) +  Number(data.selectedSectionHours)) > 2);

            if ( data.selectedSectionHours && this.state.currentTimeTables && (Number(this.state.currentTimeTables.length) +  Number(data.selectedSectionHours.length)) > 2) {
                T.notify('Số giờ học tối đa cho một ngày là 2!', 'danger');
                return;
            } else if (data.selectedSectionHours && data.selectedSectionHours.length < 1) {
                T.notify('Khung thời gian học chưa chọn!', 'danger');
                return;
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

    delete = () => T.confirm('Xóa thời khóa biểu', 'Bạn có chắc chắn xóa thời khóa biểu này?', isConfirm => {
        isConfirm && this.props.delete(this.state._id);
        this.hide();
    })

    // onSelectDate = (date => { 
    //     if(date) {
    //         this.props.getTimeTableOfLecturer({courseId: this.props.courseId, lecturerId: this.props.lecturerId, date: date }, data => {
    //             this.setState({ date, listTimeTable: data.items &&  data.items.length ? data.items : null });
    //         });
    //     }
    // });

    selectHours = (e, index) => {
        let { avaiableHours, selectedSectionHours = [] } = this.state;
        console.log('123456', selectedSectionHours);
        const isSelected = selectedSectionHours.find(selectedSectionHour => selectedSectionHour.id == index);
        if (e) {
            if (!isSelected) {
                selectedSectionHours.push(avaiableHours.find(sectionHour => sectionHour.id == index));
            }
        } else {
            selectedSectionHours = selectedSectionHours.forEach(selectedStartHour => {
                if (selectedStartHour.id != index) {
                    return selectedStartHour;
                }
            });
        }
        console.log('selectedSectionHours999888777', selectedSectionHours);

        this.setState({ selectedSectionHours });
    }

    render = () => {
        const { _id, loading, date, dateNumber, currentTimeTables, OffCalendar, avaiableHours } = this.state;
        const student = this.props.student;
        console.log('student', student);
        console.log('currentTimeTables', currentTimeTables);
        const table = renderTable({
            getDataSource: () => currentTimeTables,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '70%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: '30%' }} nowrap='true'>CMND/CCCD</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số giờ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} >
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.student ? item.student.lastname + ' ' + item.student.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.student ? item.student.identityCard : ''}  />
                    <TableCell type='text' content={ item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                    <TableCell type='text' content={RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                </tr>
            ),
        });
        return this.renderModal({
            title: 'Lịch học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    {OffCalendar ? <p className='col-lg-12' style={{ background: 'antiquewhite', paddingBottom: '10px', paddingTop: '10px'}} >Giáo viên: <b>{OffCalendar && OffCalendar.lecturer ? OffCalendar.lecturer.lastname + ' ' + OffCalendar.lecturer.firstname : 'Không có thông tin'}</b> nghỉ <b>{timeOffStatesMapper && timeOffStatesMapper[OffCalendar.timeOff] && timeOffStatesMapper[OffCalendar.timeOff].text}</b> <span className='text-danger'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span> </p> : null}
                </div>
                <div style={{ display: !OffCalendar || OffCalendar && OffCalendar.timeOff != 'allDay' ? 'block' : 'none' }}>
                    <div className='row'>
                        {student ? <p className='col-md-4'>Học viên: <b>{student ? student.lastname + ' ' + student.firstname : 'Không có thông tin'}</b></p> : null}
                        {student ? <p className='col-md-4'>Số điện thoại: <b>{student && student.user && student.user.phoneNumber ? student.user.phoneNumber : 'Không có thông tin'}</b></p> : null}
                        <FormDatePicker className='col-md-4' ref={e => this.itemDate = e} label='Ngày học' readOnly={!this.props.readOnly} type='date-mask' required />
                        {loading ? <p className='col-12'>Đang tải...</p> : ''}
                    </div>
                    <div className='row'>
                        <FormSelect className='col-md-4' ref={e => this.itemState = e} label='Trạng thái' data={RegisterCalendarStates} style={{ display: _id ? 'flex': 'none' }} readOnly={true} />
                        <p className='col-md-6'> {dateNumber == null ? '' :
                            (dateNumber == -1 ? <span className='text-danger'>Trùng thời khóa biểu!</span> : <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>)}
                        </p>
                        <div className='row col-md-12' style={{marginBottom: '25px'}}>
                            <p className='col-md-12'>Chọng khung giờ đăng ký: </p>
                            {avaiableHours && avaiableHours.length ? avaiableHours.map((sectionHour) =>
                            (
                                <div key={sectionHour.id} className='col-md-6'>
                                    <FormCheckbox ref={e => this.sectionHour[sectionHour.id] = e} label={'Khung giờ: ' + sectionHour.text} onChange={e => this.selectHours(e, sectionHour.id)} />
                                </div>

                            )
                            ) : null}
                        </div>
                        {currentTimeTables && currentTimeTables.length && date != null ? 
                        <div className='col-md-12'>
                            <p>
                                Lịch học đã đăng ký ngày <span className='text-success'>{new Date(date).getDayText()} {new Date(date).getDateText()}</span><span> của học viên: </span>
                            </p>
                            {table}
                        </div> : ''}
                    </div>
                </div>
            </>,
            buttons: <>
                {this.state._id && this.props.calendar ? <button type='button' className='btn btn-danger' onClick={() => this.delete()}>Xóa</button> : null}
        </>
        });
    }
}
class StudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/dang-ky-lich-hoc'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getStudentByUser({ user: this.props.system.user && this.props.system.user._id }, student => {
                    this.setState({ student });
                    if (student) {
                        this.props.getRegisterCalendarOfLecturerByStudent({ courseId: this.state.courseId }, data => {
                            if (data.error) {
                                this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                            } else {
                                const { listTimeTable, listRegisterCalendar } = data;
                                this.setState({ listTimeTable, listRegisterCalendar });
                            }
                        });
                    }
                });
              
                const _this = this;
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
                    dayNames: ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'],
                    dayNamesShort: ['CN', 'Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'],
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
                        _this.getData(data => {
                            callback(data.listRegisterCalendar.concat(data.listTimeTable).map(item => _this.getEventObject({}, item)));
                        });
                        },
                    select: (start, end) => {
                        if (start.toDate().getDay() != '6' && start.toDate().getDay() != '0') {
                            this.onCalendarSelect(start.toDate(), end.toDate());
                        } 
                        // else {
                        //     this.onCalendarSelect(start.toDate(), end.toDate());
                        // }
                    },
                    eventClick: function(calEvent) {
                        _this.eventSelect = calEvent;
                        if (calEvent.start.toDate().getDay() != '6' && calEvent.start.toDate().getDay() != '0' && calEvent.item && calEvent.item.student) {
                            _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                        }
                        //  else {
                        //     _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                        // }
                       
                    },
                    aspectRatio: 3,
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    getEventObject = (currentEnvent = {}, newItem) => {
        // console.log('555565555', this.state);
        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let newEvent  = {};
        if (newItem.student) { //render thời khóa biểu
            let date = new Date(newItem.date);
            const year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();
            if (newItem.student && this.state.student && newItem.student._id == this.state.student._id) {
                newEvent = {
                    ...currentEnvent,
                    title: `${newItem.student ? newItem.student.lastname + ' ' + newItem.student.firstname : ''}`,
                    start: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour)}:00:00`,
                    end: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour + newItem.numOfHours)}:00:00`,
                    item: newItem,
                    color: '#1488DB',
                };
            }
        } else { // render lịch nghỉ của giáo viên
            let dateOff = new Date(newItem.dateOff);
            const year = dateOff.getFullYear(),
                month = dateOff.getMonth() + 1,
                day = dateOff.getDate();
            newEvent = {
                ...currentEnvent,
                title: `${newItem.lecturer ? newItem.lecturer.lastname + ' ' + newItem.lecturer.firstname : ''}`,
                start: `${year}-${formatTime(month)}-${formatTime(day)}T${newItem.timeOff == 'noon' ? '13' : '07'}:00:00`,
                end: `${year}-${formatTime(month)}-${formatTime(day)}T${newItem.timeOff == 'morning' ? '11' : '17'}:00:00`,
                item: newItem,
                cotextColor:'white',
                // backgroundColor:  RegisterCalendarStatesMapper[newItem.state] && RegisterCalendarStatesMapper[newItem.state].color,
                backgroundColor: 'red'
            };
        }
        console.log('newEvent', newEvent);
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getRegisterCalendarOfLecturerByStudent({ courseId: this.state.courseId }, data => {
            done && done(data);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modal.show(data);
    }

    onModalFormSave = (_id, data, done) => {
        const { selectedSectionHours } = data;
        if (selectedSectionHours && selectedSectionHours.length) {
            selectedSectionHours.forEach(selectedSectionHour => {
                
                this.props.createTimeTableByStudent({ date: data.date,startHour: selectedSectionHour.startHour, numOfHours: 1 }, item => {
                    done && done();
                    const newEvent = this.getEventObject({}, item);
                    $(this.calendar).fullCalendar('renderEvent', newEvent);
                });
            });
        }
    
       
        // _id ? this.props.updateTimeTableByAdmin(_id, data, {courseId: this.props.courseId, lecturerId: this.props.lecturerId, filterOn: this.props.filterOn}, item => {
        //     done && done();
        //     if (this.eventSelect) {
        //         const eventSelect = this.getEventObject(this.eventSelect, item);
        //         $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
        //         $(this.calendar).fullCalendar('renderEvent', eventSelect);
        //         this.eventSelect = null;
        //     }
        // }) : this.props.createTimeTableByStudent(data, item => {
        //     done && done();
        //     const newEvent = this.getEventObject({}, item);
        //     $(this.calendar).fullCalendar('renderEvent', newEvent);
        // });
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        this.modal.show(data);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        // const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        // let { list } = this.props.registerCalendar && this.props.registerCalendar.page ? this.props.registerCalendar.page : { list: [] };
        // const table = renderTable({
        //     getDataSource: () => list,
        //     renderHead: () => (
        //         <tr>
        //             <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
        //             {/* <th style={{ width: '40%' }} nowrap='true'>Khóa học</th> */}
        //             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
        //             <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Ngày học</th>
        //             <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Giờ học</th>
        //             <th style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Xe học</th>
        //             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
        //             <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ghi chú</th>
        //         </tr>),
        //     renderRow: (item, index) => (
        //         <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
        //             <TableCell type='number' content={index + 1} />
        //             {/* <TableCell type='text' content={<>{item.student && item.student.course ? item.student.course.name : ''} {item.student && item.student.courseType ? '(' + item.student.courseType.title + ')' : ''}</>} style={{ whiteSpace: 'nowrap' }} /> */}
        //             <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.dateNumber} />
        //             <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
        //             <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
        //             <TableCell type='number' style={{ textAlign: 'center' }} content={item.licensePlates} />
        //             <TableCell type='text' style={{ textAlign: 'center', backgroundColor: item.truant ? 'red' : '', color: item.truant ? 'white' : '' }} content={item.truant ? 'X' : ''} />
        //             <TableCell type='link' style={{ textAlign: 'center' }} content={<i className='fa fa-lg fa-comment' />} onClick={e => e.preventDefault() || this.modal.show(item)} />
        //         </tr>),
        // });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name || '...'),
            breadcrumb: [<Link key={0} to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId}>Khóa học</Link>, 'Đăng ký lịch học'],
            content: <>
                <div className='tile'>
                    {/* {table} */}
                    <div id='calendar' ref={e => this.calendar = e}></div>
                </div>
                <RegisterTimeTableModal ref={e => this.modal = e} readOnly={false} userId={this.props.system && this.props.system.user && this.props.system.user._id} student={this.state.student} courseId={this.state.courseId} listRegisterCalendar={this.state.listRegisterCalendar} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                     create={this.props.createTimeTableByStudent} update={this.props.updateTimeTableByAdmin} getStudentByUser={this.props.getStudentByUser} getPage={this.props.getRegisterCalendarPageByAdmin} getRegisterCalendarOfLecturerByStudent={this.props.getRegisterCalendarOfLecturerByStudent} onSave={this.onModalFormSave}  /> 
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarOfLecturerByStudent, getAllRegisterCalendars, getTimeTableOfLecturer, createTimeTableByStudent, getTimeTableDateNumber, getStudentByUser  };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
