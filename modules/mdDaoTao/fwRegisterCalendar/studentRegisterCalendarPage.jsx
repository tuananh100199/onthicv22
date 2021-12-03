import React from 'react';
import { connect } from 'react-redux';
import { getRegisterCalendarOfLecturerByStudent, createTimeTableByStudent, deleteTimeTableByStudent } from './redux';
import { getStudentByUser } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormDatePicker, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import { RegisterCalendarStates, RegisterCalendarStatesMapper, timeOffStatesMapper, sectionHours, sectionOverTimeHours } from './index';

function formatDayOrMonth(item){
    return ('0' + item).slice(-2);
}

function formatDate(item) {
    let date = new Date(item);
    const year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate();

    return `${year}-${formatDayOrMonth(month)}-${formatDayOrMonth(day)}T00:00:00.000Z`;// chuyển ngày trong calendar sang định dạng lưu trong DB
}
class RegisterTimeTableModal extends AdminModal {
    state = { listTimeTable: null };
    sectionHour = {};

    componentDidMount() {
        this.state = {};
    }
    
    onShow = (item) => {
        const { _id, dateNumber, date, startHour, numOfHours, state } = item.data || { date: item.start ? item.start.toISOString() : null, startHour: 7, numOfHours: 1, state: 'waiting' },
            endHour = startHour + numOfHours;
        this.itemDate.value(date);
        this.itemState && this.itemState.value(state);
        let avaiableHours = sectionHours || [], currentStudentTimeTables = [], 
        avaiableOverTimeHours = sectionOverTimeHours;
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
                        
                        avaiableOverTimeHours.forEach(sectionHour => { // loại bỏ những giờ học đã có khung giờ ngoài giờ hành chính
                            if (sectionHour.startHour == timeTable.startHour) {
                                avaiableOverTimeHours = avaiableOverTimeHours.filter(item => item != sectionHour);
                            }
                        });

                        if (timeTable && timeTable.student && this.props.student && timeTable.student._id == this.props.student._id) {
                            currentStudentTimeTables.push(timeTable);
                        }
                    });
                } else {
                    currentStudentTimeTables = [];
                }
                
                avaiableHours.forEach(avaiableHour => this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false));
                avaiableOverTimeHours.forEach(avaiableHour => this.sectionHour[avaiableHour.id] && this.sectionHour[avaiableHour.id].value(false));

                this.setState({ currentStudentTimeTables, listRegisterCalendar: data.listRegisterCalendar, avaiableHours, avaiableOverTimeHours }, () => {
                    currentStudentTimeTables.forEach(timeTable => {
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
                this.setState({ currentStudentTimeTables: null });
            }
        });
       
        this.setState({ loading: false, _id, dateNumber, date, startHour, endHour, state, OffCalendar, selectedSectionHours: [], selectedSectionOverTimeHours: [] });
    }

    onSubmit = () => {
        const { _id, selectedSectionHours, selectedSectionOverTimeHours } = this.state;
        const data = {
            date: this.itemDate.value(),
            selectedSectionHours: selectedSectionHours,
            selectedSectionOverTimeHours: selectedSectionOverTimeHours
        };
           
        let today  = new Date();
        const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        data.date = new Date(data.date.getFullYear(), data.date.getMonth(), data.date.getDate(), '07', '00', '00');
        if (!_id && data.date <= currentDate) {
            T.notify('Thời gian tối thiểu đăng ký là trước 1 ngày!', 'danger');
            this.itemDate.focus();
        } 
        // else if (data.selectedSectionHours && this.state.currentStudentTimeTables && (Number(this.state.currentStudentTimeTables.length) +  Number(data.selectedSectionHours.length)) > 2) {
        //     T.notify('Số giờ học tối đa cho một ngày là 2!', 'danger');
        //     return;
        // } 
        else if ((data.selectedSectionHours && data.selectedSectionHours.length < 1) && (data.selectedSectionOverTimeHours && data.selectedSectionOverTimeHours.length < 1)) {
            T.notify('Khung thời gian học chưa chọn!', 'danger');
            return;
        }
         else {
            this.props.onSave(_id, data, () => this.hide());
        }
    }

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

    delete = (_id, condition) => T.confirm('Xóa lịch học', 'Bạn có chắc chắn muốn xóa lịch học đã đăng ký này?', isConfirm => {
        isConfirm && this.props.delete(_id, condition);
        this.hide();
    })

    render = () => {
        const { _id, loading, date, dateNumber, startHour, endHour, state, currentStudentTimeTables, OffCalendar, avaiableHours, avaiableOverTimeHours } = this.state;
        const student = this.props.student;
        const table = renderTable({
            getDataSource: () => currentStudentTimeTables,
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
            renderRow: (item, index) => {
                
                return (
                    <tr key={index} >
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.student ? item.student.lastname + ' ' + item.student.firstname : ''} style={{ whiteSpace: 'nowrap' }} />
                        <TableCell type='text' content={item.student ? item.student.identityCard : ''}  />
                        <TableCell type='text' content={ item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}-${item.startHour + item.numOfHours}` : `${item.startHour}`} />
                        <TableCell type='number' style={{ textAlign: 'center' }} content={item.numOfHours} />
                        <TableCell type='text' content={ <>{RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].text} {item.state == 'waiting' ? <div id={`timeRemain${item._id}`} ></div> : null}</>} style={{ whiteSpace: 'nowrap', textAlign: 'center', color: RegisterCalendarStatesMapper[item.state] && RegisterCalendarStatesMapper[item.state].color }}  nowrap='true'/>
                    </tr>
                );
            },
        });

        return this.renderModal({
            title: 'Lịch học thực hành',
            size: 'large',
            body: <>
                <div className='row'>
                    {OffCalendar ? <p className='col-lg-12' style={{ background: 'antiquewhite', paddingBottom: '10px', paddingTop: '10px'}} >Giáo viên: <b>{OffCalendar && OffCalendar.lecturer ? OffCalendar.lecturer.lastname + ' ' + OffCalendar.lecturer.firstname : 'Không có thông tin'}</b> nghỉ <b>{timeOffStatesMapper && timeOffStatesMapper[OffCalendar.timeOff] && timeOffStatesMapper[OffCalendar.timeOff].text}</b> <span className='text-danger'>{new Date(date).getDateText()}</span> </p> : null}
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
                        <p className='col-md-4'> {dateNumber == null ? '' :
                            <>Buổi học thứ: <span className='text-primary'>{dateNumber}</span>.</>}
                        </p>
                        <p className='col-md-4'>{_id ?
                            <>Thời gian học: <span className='text-primary'>{`${startHour}h - ${endHour}h`}</span>.</> : null}
                        </p>
                        <div className='row col-md-12' style={{marginBottom: '25px'}}>
                            <p className='col-md-12'>Chọn khung giờ hành chính: </p>
                            {avaiableHours && avaiableHours.length ? avaiableHours.map((sectionHour) =>
                            (
                                <div key={sectionHour.id} className='col-md-6'>
                                    <FormCheckbox ref={e => this.sectionHour[sectionHour.id] = e} label={'Khung giờ: ' + sectionHour.text} onChange={e => this.selectHours(e, sectionHour.id)} />
                                </div>
                            )) : null}
                            <p className='col-md-12'>Chọn khung giờ ngoài hành chính: </p>
                            {avaiableOverTimeHours && avaiableOverTimeHours.length ? avaiableOverTimeHours.map((sectionHour) =>
                            (
                                <div key={sectionHour.id} className='col-md-6'>
                                    <FormCheckbox ref={e => this.sectionHour[sectionHour.id] = e} label={'Khung giờ: ' + sectionHour.text} onChange={e => this.selectOverTimeHours(e, sectionHour.id)} />
                                </div>
                            )) : null}
                        </div>
                        {currentStudentTimeTables && currentStudentTimeTables.length && date != null ? 
                        <div className='col-md-12'>
                            <p>
                                Lịch học đã đăng ký ngày <span className='text-success'>{new Date(date).getDateText()}</span><span> của học viên: </span>
                            </p>
                            {table}
                        </div> : ''}
                    </div>
                </div>
            </>,
            buttons: <>
                {_id && state == 'waiting' ? <button type='button' className='btn btn-danger' onClick={() => this.delete(_id, {date: formatDate(date)})}>Xóa</button> : null}
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
                        this.props.getRegisterCalendarOfLecturerByStudent({}, data => {
                            if (data.error) {
                                this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                            } else {
                                const { listTimeTable, listRegisterCalendar, car } = data;
                                this.setState({ listTimeTable, listRegisterCalendar, car });
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
                    },
                    eventClick: function(calEvent) {
                        _this.eventSelect = calEvent;
                        if (calEvent.start.toDate().getDay() != '6' && calEvent.start.toDate().getDay() != '0' && calEvent.item && calEvent.item.student) {
                            _this.onCalendarSelect(calEvent.start.toDate(), calEvent.end, calEvent.item);
                        }
                    },
                    aspectRatio: 3,
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    getEventObject = (currentEnvent = {}, newItem) => {
        function formatTime(item){
            return ('0' + item).slice(-2);
        }
        let newEvent  = {};
        if (newItem.student) { //render thời khóa biểu
            let date = new Date(newItem.date);
            const year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate();
            if (newItem.student && this.
                state.student && newItem.student._id == this.state.student._id) {
                newEvent = {
                    ...currentEnvent,
                    title: `${newItem.student ? newItem.student.lastname + ' ' + newItem.student.firstname : ''}`,
                    start: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour)}:00:00`,
                    end: `${year}-${formatTime(month)}-${formatTime(day)}T${formatTime(newItem.startHour + newItem.numOfHours)}:00:00`,
                    item: newItem,
                    textColor:'white',
                    color: RegisterCalendarStatesMapper[newItem.state] && RegisterCalendarStatesMapper[newItem.state].color,
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
                textColor:'white',
                backgroundColor: 'red'
            };
        }
        return newEvent;
    }
    
    getData = (done) => {
        this.props.getRegisterCalendarOfLecturerByStudent({}, data => {
            done && done(data);
        });
    }
    
    onCalendarSelect = (start, end, item) => {
        const data = { start: start, end: end, data: item };
        this.modal.show(data);
    }

    onModalFormSave = (_id, data, done) => {
        const { selectedSectionHours, selectedSectionOverTimeHours } = data;
        // if (selectedSectionHours && selectedSectionHours.length) {
            selectedSectionHours.concat(selectedSectionOverTimeHours).forEach(selectedSectionHour => {
                let newData = { 
                    date: data.date, 
                    startHour: selectedSectionHour.startHour, 
                    numOfHours: 1 
                };
                if(this.state.car) {
                    newData.car = this.state.car && this.state.car._id;
                }
                this.props.createTimeTableByStudent(newData, item => {
                    done && done();
                    const newEvent = this.getEventObject({}, item);
                    $(this.calendar).fullCalendar('renderEvent', newEvent);
                });
            });
        // }
    }

    deleteCalendar = (_id, condition) => {
        this.props.deleteTimeTableByStudent(_id, condition);
        if (this.eventSelect) {
            $(this.calendar).fullCalendar('removeEvents', [this.eventSelect._id]);
            this.eventSelect = null;
        }
    }

    edit = (e, item) => {
        const data = {data: item };
        e.preventDefault();
        this.modal.show(data);
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const courseName = this.state.student && this.state.student.course ? this.state.student.course.name : '';
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + courseName,
            breadcrumb: [<Link key={0} to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId}>Khóa học</Link>, 'Đăng ký lịch học'],
            content: <>
                <div className='tile'>
                    <div ref={e => this.calendar = e}></div>
                </div>
                <RegisterTimeTableModal ref={e => this.modal = e} readOnly={false} userId={this.props.system && this.props.system.user && this.props.system.user._id} student={this.state.student} courseId={this.state.courseId} listRegisterCalendar={this.state.listRegisterCalendar} filterOn={this.props.filterOn} calendar={this.props.calendar} lecturerName={this.props.lecturerName}
                    create={this.props.createTimeTableByStudent} delete={this.deleteCalendar} getStudentByUser={this.props.getStudentByUser} getPage={this.props.getRegisterCalendarPageByAdmin} getRegisterCalendarOfLecturerByStudent={this.props.getRegisterCalendarOfLecturerByStudent} onSave={this.onModalFormSave}  /> 
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarOfLecturerByStudent, createTimeTableByStudent, deleteTimeTableByStudent, getStudentByUser  };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
