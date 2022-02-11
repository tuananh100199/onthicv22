import React from 'react';
import { connect } from 'react-redux';
import { getCourseByStudent } from './redux';
import { createChangeLecturer } from 'modules/mdDaoTao/fwChangeLecturer/redux';
import { getRateByUser } from 'modules/_default/fwRate/redux';
import RateModal from 'modules/_default/fwRate/RateModal';
import { AdminPage, CirclePageButton, PageIconHeader, PageIcon, AdminModal, FormTextBox, FormRichTextBox, FormDatePicker } from 'view/component/AdminPage';

class ViewScoreModal extends AdminModal {
    state = {};
    onShow = (data) => {
        const { student, course } = data;
        this.setState({ student, course });
    };

    render = () => {
        const { student, course } = this.state,
            monThiTotNghiep = course && course.monThiTotNghiep,
            diemThiTotNghiep = student && student.diemThiTotNghiep,
            isLoading = !(monThiTotNghiep && monThiTotNghiep.length && diemThiTotNghiep && diemThiTotNghiep.length);

        return this.renderModal({
            title: 'Điểm thi tốt nghiệp của học viên',
            body:
                <>
                    {!isLoading ? monThiTotNghiep.map((monThi, i) => (
                        <p key={i}>{monThi.title + ': '}<span className={diemThiTotNghiep[i].diemLiet ? 'text-danger' : ''}>{diemThiTotNghiep[i].point}</span></p>
                    )) : null}
                </>
        });
    }
}

class ChangeLecturerModal extends AdminModal {
    state = {};

    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemReason.focus()));
    }

    onShow = (data) => {
        const { student, course } = data,
            studentId = student._id,
            teacherGroups = course.teacherGroups.find(({ student }) => student.find(({ _id }) => _id == studentId.toString()) != null),
            currentLecturer = teacherGroups && teacherGroups.teacher;

        this.itemCurrentName.value(currentLecturer ? currentLecturer.lastname + ' ' + currentLecturer.firstname : '');
        this.itemPhoneNumber.value(currentLecturer ? currentLecturer.phoneNumber : '');
        this.itemIdentityCard.value(currentLecturer ? currentLecturer.identityCard : '');
        this.setState({ student, course, currentLecturer });
    };

    onSubmit = () => {
        const data = {
            student: this.state.student && this.state.student._id,
            requestedLecturer: this.itemRequestedLecturer.value(),
            startDate: this.itemStartDate.value(),
            reason: this.itemReason.value()
        };
        if (data.startDate == '') {
            T.notify('Ngày đổi bị trống!', 'danger');
            this.itemStartDate.focus();
        } else if (data.reason == '') {
            T.notify('Lý do đổi bị trống!', 'danger');
            this.itemReason.focus();
        } else {
            this.props.create(data, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Thay đổi giáo viên',
            size: 'large',
            body:
                <>
                    <div className='row'>
                        <h6 className='col-md-12'> Thông tin giáo viên hiện tại: </h6>
                        <FormTextBox ref={e => this.itemCurrentName = e} label='Họ tên giáo viên hiện tại' className='col-md-4' readOnly={true} />
                        <FormTextBox ref={e => this.itemIdentityCard = e} label='CMND,CCCD' className='col-md-4' readOnly={true} />
                        <FormTextBox ref={e => this.itemPhoneNumber = e} label='Điện thoại' className='col-md-4' readOnly={true} />
                    </div>
                    <div className='row'>
                        <h6 className='col-md-12'> Thông tin thay đổi giáo viên: </h6>
                        <FormTextBox className='col-md-4' ref={e => this.itemRequestedLecturer = e} label='Giáo viên thay đổi' readOnly={false} />
                        <FormDatePicker ref={e => this.itemStartDate = e} label='Ngày bắt đầu đổi' className='col-md-6' />
                        <FormRichTextBox ref={e => this.itemReason = e} label='Lý do' className='col-md-12' readOnly={false} />
                    </div>
                </>
        });
    }
}
class UserCoursePageDetail extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
            _id = route.parse(window.location.pathname)._id;
        this.setState({ courseId: _id });
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user');
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push('/user');
                    } else if (data.item && data.student) {
                        this.setState(data.item);
                        if (data.teacher) {
                            this.setState({ teacher: data.teacher });
                            this.props.getRateByUser('teacher', data.teacher._id);
                        }
                        this.setState({ student: data.student });
                    } else {
                        this.props.history.push('/user');
                    }
                });
            });
        } else {
            this.props.history.push('/user');
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.url != this.props.match.url) {
            const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id'),
                _id = route.parse(window.location.pathname)._id;
            this.setState({ courseId: _id });
            if (_id) {
                T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                    this.props.getCourseByStudent(_id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user');
                        } else if (data.notify) {
                            T.alert(data.notify, 'error', false, 2000);
                            this.props.history.push('/user');
                        } else if (data.item) {
                            this.setState(data.item);
                        } else {
                            this.props.history.push('/user');
                        }
                    });
                });
            } else {
                this.props.history.push('/user');
            }
        }
    }

    render() {
        const course = this.props.course && this.props.course.item,
            subjects = course && course.subjects ? course.subjects : [];
        const { name, courseId, teacher, student } = this.state, rate = this.props.rate.item && this.props.rate.item.value;
        const showDiemThiTotNghiep = student && student.diemThiTotNghiep && student.diemThiTotNghiep.length;
        const showMonThucHanh = subjects.length && student && student.tienDoThiHetMon && (subjects.findIndex(subject => (subject.monTienQuyet == true && !student.tienDoThiHetMon[subject._id])) == -1);
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: `Khóa học: ${name}`,
            breadcrumb: ['Khóa học'],
            content: (
                <div className='row user-course'>
                    <PageIconHeader text='Thông tin chung' />

                    <PageIcon to={`/user/hoc-vien/khoa-hoc/thong-tin/${courseId}`} icon='fa-info' iconBackgroundColor='#17a2b8' text='Thông tin khóa học' />
                    {course && !course.isDefault ? <PageIcon to='#' icon='fa-graduation-cap ' text='Xem điểm thi tốt nghiệp' iconBackgroundColor={showDiemThiTotNghiep ? '#8d6e63' : 'secondary'} onClick={(e) => { e.preventDefault(); showDiemThiTotNghiep ? this.viewScoreModal.show({ student, course }) : T.alert('Bạn chưa có điểm thi tốt nghiệp!', 'error', false, 8000); }} /> : null}
                    <PageIcon to={`/user/course/${courseId}/forum`} icon='fa-users' iconBackgroundColor='#3e24aa' text='Forum' />
                    <PageIcon to={''} icon='fa-star' iconBackgroundColor='orange' text='Đánh giá giáo viên' visible={teacher != null}
                        onClick={(e) => { e.preventDefault(); this.modal.show(); }} subtitle={rate ? rate + ' sao' : 'Chưa đánh giá'} />
                    {/* check render */}
                    {teacher && <RateModal ref={e => this.modal = e} title='Đánh giá giáo viên' type='teacher' _refId={teacher._id} />}
                    {teacher && <PageIcon to='#' icon='fa-refresh' iconBackgroundColor='#D00' text='Thay đổi giáo viên' onClick={(e) => { e.preventDefault(); this.changeLecturerModal.show({ student, course }); }} />}
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/tien-do-hoc-tap`} icon='fa-line-chart' iconBackgroundColor='#69f0ae' text='Tiến độ học tập' />
                    <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/cong-no`} icon='fa-money' iconBackgroundColor='#900' text='Học phí' />
                    {subjects.length ? <>
                        <PageIconHeader text='Môn học lý thuyết' />
                        {subjects.map((subject, index) =>
                            !subject.monThucHanh && <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${courseId}/mon-hoc/${subject._id}`} icon='fa-briefcase' iconBackgroundColor='#1488db' text={subject ? subject.title : ''} />
                        )}
                    </> : null}

                    {course && !course.isDefault && subjects.length ? <>
                        <PageIconHeader text='Môn học thực hành' />
                        {subjects.map((subject, index) =>
                            subject.monThucHanh && <PageIcon key={index} to={`/user/hoc-vien/khoa-hoc/${courseId}/mon-hoc/${subject._id}`} onClick={() => !showMonThucHanh ? T.alert('Vui lòng hoàn thành hai môn học: Pháp luật giao thông đường bộ và Kỹ thuật lái xe để mở khóa!', 'error', false, 8000) : null} notify={!showMonThucHanh} icon='fa-briefcase' iconBackgroundColor={showMonThucHanh ? '#1488db' : 'secondary'} text={subject ? subject.title : ''} />
                        )}
                        {teacher && <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/dang-ky-lich-hoc`} onClick={() => !showMonThucHanh ? T.alert('Vui lòng hoàn thành hai môn học: Pháp luật giao thông đường bộ và Kỹ thuật lái xe để mở khóa!', 'error', false, 8000) : null} icon='fa-calendar-plus-o' notify={!showMonThucHanh} iconBackgroundColor={showMonThucHanh ? '#8d74aa' : 'secondary'} text='Đăng ký lịch học' />}
                        <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/thoi-khoa-bieu`} icon='fa-calendar' onClick={() => !showMonThucHanh ? T.alert('Vui lòng hoàn thành hai môn học: Pháp luật giao thông đường bộ và Kỹ thuật lái xe để mở khóa!', 'error', false, 8000) : null} notify={!showMonThucHanh} iconBackgroundColor={showMonThucHanh ? '#ffc107' : 'secondary'} text='Thời khóa biểu' />
                    </> : null}
                    
                    {course && !course.isDefault ?
                    <>
                        <PageIconHeader text='Liên lạc' />
                        <PageIcon to={`/user/chat/${courseId}`} icon='fa-comments-o' iconBackgroundColor='#28a745' text='Chat' visible={this.state.chatActive} />
                        <PageIcon to={`/user/hoc-vien/khoa-hoc/${courseId}/phan-hoi`} icon='fa-commenting-o' iconBackgroundColor='#dc3545' text='Phản hồi' />
                        <CirclePageButton type='custom' customClassName='btn-success' customIcon='fa-comments-o' onClick={() => this.props.history.push('/user/chat/' + this.state.courseId)} />
                    </> : null}

                    <ViewScoreModal ref={e => this.viewScoreModal = e} />
                    <ChangeLecturerModal ref={e => this.changeLecturerModal = e} create={this.props.createChangeLecturer} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course, driveTest: state.trainning.driveTest, rate: state.framework.rate });
const mapActionsToProps = { getCourseByStudent, getRateByUser, createChangeLecturer };
export default connect(mapStateToProps, mapActionsToProps)(UserCoursePageDetail);