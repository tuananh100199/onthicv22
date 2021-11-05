import React from 'react';
import { connect } from 'react-redux';
import { getRegisterCalendarByStudent } from './redux';
import { AdminPage, AdminModal, TableCell, renderTable } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { note, truant } = item || { note: '', truant: false };
        this.setState({ note, truant });
    }

    render = () => {
        return this.renderModal({
            title: 'Ghi chú',
            body: <>
                <label className='col-md-12'>Ghi chú của giáo viên: <b>{this.state.note ? this.state.note : 'Chưa có!'}</b></label>
            </>,
        });
    }
}
class StudentView extends AdminPage {
    state = {};
    componentDidMount() {
        const route = T.routeMatcher('/user/course/:_id/student/register-calendar'),
            _id = route.parse(window.location.pathname)._id;
        if (_id) {
            this.setState({ courseId: _id });
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getRegisterCalendarByStudent(data => {
                    if (data.error) {
                        this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
                    } else {
                        this.setState({ name: data.list && data.list[0] && data.list[0].student && data.list[0].student.course && data.list[0].student.course.name });
                    }
                });
            });
        } else {
            this.props.history.push(`/user/hoc-vien/khoa-hoc/${this.state.courseId}`);
        }
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const today = T.dateToText(new Date().toISOString(), 'dd/mm/yyyy');
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId;
        let { list } = this.props.registerCalendar && this.props.registerCalendar.page ? this.props.registerCalendar.page : { list: [] };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    {/* <th style={{ width: '40%' }} nowrap='true'>Khóa học</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Buổi học</th>
                    <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Ngày học</th>
                    <th style={{ width: '35%', textAlign: 'center' }} nowrap='true'>Giờ học</th>
                    <th style={{ width: '30%', textAlign: 'center' }} nowrap='true'>Xe học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nghỉ học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ghi chú</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index} style={{ backgroundColor: T.dateToText(item.date, 'dd/mm/yyyy') == today ? '#D9EDF7' : '' }} >
                    <TableCell type='number' content={index + 1} />
                    {/* <TableCell type='text' content={<>{item.student && item.student.course ? item.student.course.name : ''} {item.student && item.student.courseType ? '(' + item.student.courseType.title + ')' : ''}</>} style={{ whiteSpace: 'nowrap' }} /> */}
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.dateNumber} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type='number' style={{ width: 'auto', textAlign: 'center' }} content={item.numOfHours ? `${item.startHour}h-${item.startHour + item.numOfHours}h` : `${item.startHour}h`} />
                    <TableCell type='number' style={{ textAlign: 'center' }} content={item.licensePlates} />
                    <TableCell type='text' style={{ textAlign: 'center', backgroundColor: item.truant ? 'red' : '', color: item.truant ? 'white' : '' }} content={item.truant ? 'X' : ''} />
                    <TableCell type='link' style={{ textAlign: 'center' }} content={<i className='fa fa-lg fa-comment' />} onClick={e => e.preventDefault() || this.modal.show(item)} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name || '...'),
            breadcrumb: [<Link key={0} to={'/user/hoc-vien/khoa-hoc/' + this.state.courseId}>Khóa học</Link>, 'Thời khóa biểu'],
            content: <>
                <div className='tile'>
                    {table}
                </div>
                <NoteModal ref={e => this.modal = e} update={this.props.updateRegisterCalendarByAdmin} />
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, registerCalendar: state.trainning.registerCalendar });
const mapActionsToProps = { getRegisterCalendarByStudent };
export default connect(mapStateToProps, mapActionsToProps)(StudentView);
