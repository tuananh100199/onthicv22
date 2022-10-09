import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import {ajaxSelectProfileType} from 'modules/_default/fwProfileType/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormDatePicker, FormEditor, FormSelect, FormRichTextBox, CirclePageButton, FormCheckbox } from 'view/component/AdminPage';

class EditCoursePage extends AdminPage {
    state = {};
    componentDidMount() {
        const setData = (course) => {
            const { name, maxStudent, shortDescription, detailDescription, courseType, close, lock, profileType,
                thoiGianKhaiGiang, thoiGianBatDau, thoiGianKetThuc, thoiGianThiKetThucMonDuKien, thoiGianThiTotNghiepDuKien, thoiGianThiTotNghiepChinhThuc, active, chatActive, commentActive } = course;

            this.name.value(name);
            this.courseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
            this.maxStudent.value(maxStudent);
            this.profileType.value(profileType?{id:profileType._id,text:profileType.title}:'');
            this.shortDescription.value(shortDescription);
            this.detailDescription.html(detailDescription);

            this.thoiGianKhaiGiang.value(thoiGianKhaiGiang);
            this.thoiGianBatDau.value(thoiGianBatDau);
            this.thoiGianKetThuc.value(thoiGianKetThuc);
            this.thoiGianThiKetThucMonDuKien.value(thoiGianThiKetThucMonDuKien);
            // this.thoiGianThiKetThucMonChinhThuc.value(thoiGianThiKetThucMonChinhThuc);
            this.thoiGianThiTotNghiepDuKien.value(thoiGianThiTotNghiepDuKien);
            this.thoiGianThiTotNghiepChinhThuc.value(thoiGianThiTotNghiepChinhThuc);
            this.close.value(close);
            this.active.value(active);
            this.chatActive.value(chatActive);
            this.commentActive.value(commentActive);
            this.setState({ lock });
        };

        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/info').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    setData(course);
                } else if (params._id) {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else if (data.item) {
                            setData(data.item);
                        } else {
                            this.props.history.push('/user/course/' + params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    saveInfo = () => {
        const course = this.props.course ? this.props.course.item || {} : {};
        if (course) {
            const changes = {
                name: this.name.value().trim(),
                maxStudent: this.maxStudent.value(),
                profileType:this.profileType.value(),
                courseType: this.courseType.value(),
                shortDescription: this.shortDescription.value(),
                detailDescription: this.detailDescription.html(),
                active: this.active.value(),
                close: this.close.value(),
                chatActive: this.chatActive.value(),
                commentActive: this.commentActive.value(),
                thoiGianKetThuc: this.thoiGianKetThuc.value(),
                thoiGianBatDau: this.thoiGianBatDau.value(),
                thoiGianKhaiGiang: this.thoiGianKhaiGiang.value(),
                thoiGianThiKetThucMonDuKien: this.thoiGianThiKetThucMonDuKien.value(),
                // thoiGianThiKetThucMonChinhThuc: this.thoiGianThiKetThucMonChinhThuc.value(),
                thoiGianThiTotNghiepDuKien: this.thoiGianThiTotNghiepDuKien.value(),
                thoiGianThiTotNghiepChinhThuc: this.thoiGianThiTotNghiepChinhThuc.value()

            };
            this.setState({ chatActive: changes.chatActive, commentActive: changes.commentActive });
            if (changes.thoiGianThiTotNghiepChinhThuc == 'Invalid Date') changes.thoiGianThiTotNghiepChinhThuc = null;
            if (changes.name == '') {
                T.notify('Tên khóa học trống!', 'danger');
                this.name.focus();
            } else {
                this.props.updateCourse(course._id, changes);
            }
        }
    }

    lock = (e) => {
        const course = this.props.course ? this.props.course.item || {} : {},
            lock = this.state.lock;
        e.preventDefault() || T.confirm('Khóa thông tin khóa học', `Bạn có chắc muốn ${lock ? 'mở ' : 'khóa'} thông tin khóa học này ?`, true, isConfirm =>
            isConfirm && this.props.updateCourse(course._id, { lock: !lock }, () => this.setState({ lock: !lock })));
    }

    render() {
        const course = this.props.course ? this.props.course.item || {} : {};
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('course', ['lock', 'read', 'write', 'delete']),
            previousRoute = '/user/course/' + (course ? course._id || '' : ''),
            { isLecturer, isCourseAdmin } = currentUser,
            lock = this.state.lock,
            readOnly = course.isDefault || ((!permission.write || isLecturer) && !isCourseAdmin); //TODO: xem lại !isCourseAdmin

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + course.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Thông tin khóa học'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-8' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin chung</h3>
                        <FormCheckbox ref={e => this.active = e} className={'col-md-2 ' + (readOnly ? 'invisible' : '')} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                        <FormCheckbox ref={e => this.close = e} className={'col-md-2 ' + (readOnly ? 'invisible' : '')} label='Kết thúc khóa học' isSwitch={true} readOnly={readOnly} />
                        <FormTextBox ref={e => this.name = e} label='Tên khóa học' className='col-md-6' value={course.name} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                        <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} className='col-md-6' readOnly={readOnly} />
                        <FormTextBox ref={e => this.maxStudent = e} label='Số  học viên tối đa' className='col-md-6' type='number' readOnly={readOnly} />
                        <FormSelect ref={e => this.profileType = e} label='Hồ sơ đăng ký' data={ajaxSelectProfileType} className='col-md-6' readOnly={readOnly} />
                    </div>
                </div>

                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thời gian</h3>
                        <FormDatePicker ref={e => this.thoiGianKhaiGiang = e} label='Thời gian khai giảng' className='col-md-4' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' className='col-md-4' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' className='col-md-4' readOnly={readOnly} />

                        <FormDatePicker ref={e => this.thoiGianThiKetThucMonDuKien = e} label='Thời gian thi kết thúc môn dự kiến' className='col-md-4' readOnly={readOnly} />
                        {/* <FormDatePicker ref={e => this.thoiGianThiKetThucMonChinhThuc = e} label='Thời gian kết thúc môn chính thức' className='col-md-4' readOnly={readOnly} /> */}
                        {/* <div className='col-md-4' /> */}

                        <FormDatePicker ref={e => this.thoiGianThiTotNghiepDuKien = e} label='Thời gian thi tốt nghiệp dự kiến' className='col-md-4' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.thoiGianThiTotNghiepChinhThuc = e} label='Thời gian thi tốt nghiệp chính thức' className='col-md-4' readOnly={readOnly} />

                    </div>
                </div>

                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-9' style={{ paddingLeft: 15, marginBottom: 5 }}>Mô tả khóa học</h3>
                        <p className='col-3' style={{ paddingLeft: 15, marginBottom: 5 }}>Trạng thái khóa học: {lock ? 'Đã khóa' : 'Chưa khóa'}</p>
                        <FormCheckbox ref={e => this.chatActive = e} className={'col-md-3 ' + (readOnly ? 'invisible' : '')} label='Kích hoạt chat' isSwitch={true} readOnly={readOnly} />
                        <FormCheckbox ref={e => this.commentActive = e} className={'col-md-6 ' + (readOnly ? 'invisible' : '')} label='Kích hoạt bình luận bài học' isSwitch={true} readOnly={readOnly} />

                        <FormRichTextBox ref={e => this.shortDescription = e} label='Mô tả ngắn khóa học' className='col-md-12' readOnly={readOnly} />
                        <FormEditor ref={e => this.detailDescription = e} label='Mô tả chi tiết khóa học' uploadUrl='/user/upload?category=course' className='col-md-12' readOnly={readOnly} style={{ height: '400px' }} />
                    </div>
                </div>
                {!readOnly ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
                {permission.lock ? <CirclePageButton type='custom' style={{ right: '75px' }} customClassName={lock ? 'btn-success' : 'btn-danger'} customIcon={lock ? 'fa-unlock' : 'fa-lock'} onClick={(e) => this.lock(e)} /> : null}
            </>,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
