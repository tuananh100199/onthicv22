import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTabs, FormTextBox, FormDatePicker, FormEditor, FormSelect, FormRichTextBox, CirclePageButton } from 'view/component/AdminPage';
import AdminSubjectView from './tabView/adminSubjectView';
import AdminTeacherView from './tabView/adminTeacherView';
import AdminManagerView from './tabView/adminManagerView';
import AdminStudentView from './tabView/adminStudentView';
// import AdminAssignTeacherView from './tabView/adminAssignTeacherView';
import AdminRepresentersView from './tabView/adminRepresentersView';

const previousRoute = '/user/course';
class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const route = T.routeMatcher('/user/course/:_id'),
                _id = route.parse(window.location.pathname)._id;
            if (_id) {
                this.props.getCourse(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        const { name, maxStudent, shortDescription, detailDescription, courseType, courseFee,
                            thoiGianKhaiGiang, thoiGianBatDau, thoiGianKetThuc, thoiGianThiKetThucMonDuKien, thoiGianThiKetThucMonChinhThuc, thoiGianThiTotNghiepDuKien, thoiGianThiTotNghiepChinhThuc } = data.item;

                        this.name.value(name);
                        this.courseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
                        this.courseFee.value(courseFee);
                        this.maxStudent.value(maxStudent);
                        this.shortDescription.value(shortDescription);
                        this.detailDescription.html(detailDescription);

                        this.thoiGianKhaiGiang.value(thoiGianKhaiGiang);
                        this.thoiGianBatDau.value(thoiGianBatDau);
                        this.thoiGianKetThuc.value(thoiGianKetThuc);
                        this.thoiGianThiKetThucMonDuKien.value(thoiGianThiKetThucMonDuKien);
                        this.thoiGianThiKetThucMonChinhThuc.value(thoiGianThiKetThucMonChinhThuc);
                        this.thoiGianThiTotNghiepDuKien.value(thoiGianThiTotNghiepDuKien);
                        this.thoiGianThiTotNghiepChinhThuc.value(thoiGianThiTotNghiepChinhThuc);

                        this.setState(data.item);
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            } else {
                this.props.history.push(previousRoute);
            }
        });
    }

    saveInfo = () => {
        const changes = {
            name: this.name.value().trim(),
            maxStudent: this.maxStudent.value(),
            courseType: this.courseType.value(),
            courseFee: this.courseFee.value(),
            shortDescription: this.shortDescription.value(),
            detailDescription: this.detailDescription.html(),
            courseFees: this.state.courseFees
        };
        if (changes.courseFee == null) changes.courseFee = 0;

        if (changes.name == '') {
            T.notify('Tên khóa học trống!', 'danger');
            this.name.focus();
        } else {
            this.props.updateCourse(this.state._id, changes, () => {
                T.notify('Cập nhật thông tin khóa học thành công!');
            });
        }
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            // currentPermissions = this.getCurrentPermissions(),
            permissionCourse = this.getUserPermission('course'),
            permissionUser = this.getUserPermission('user'),
            permissionDivision = this.getUserPermission('division'),
            readOnly = !permissionCourse.write;
        const tabInfo = <div className='row'>
            <h3 className='tile-title' style={{ width: '100%', paddingLeft: 15, marginBottom: 5 }}>Thông tin chung</h3>
            <FormTextBox ref={e => this.name = e} label='Tên khóa học' className='col-md-3' value={this.state.name} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
            <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} className='col-md-3' readOnly={readOnly} />
            <FormTextBox ref={e => this.maxStudent = e} label='Số  học viên tối đa' className='col-md-3' type='number' readOnly={readOnly} />
            <FormTextBox ref={e => this.courseFee = e} type='number' label='Học phí' className='col-md-3' readOnly={readOnly} />

            <h3 className='tile-title' style={{ width: '100%', paddingLeft: 15, marginBottom: 5 }}>Thời gian</h3>
            <FormDatePicker type='time' ref={e => this.thoiGianKhaiGiang = e} label='Thời gian khai giảng' className='col-md-4' readOnly={readOnly} />
            <FormDatePicker ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' className='col-md-4' readOnly={readOnly} />
            <FormDatePicker ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' className='col-md-4' readOnly={readOnly} />

            <FormDatePicker type='time' ref={e => this.thoiGianThiKetThucMonDuKien = e} label='Thời gian kết thúc môn dự kiến' className='col-md-6' readOnly={readOnly} />
            <FormDatePicker type='time' ref={e => this.thoiGianThiKetThucMonChinhThuc = e} label='Thời gian kết thúc môn chính thức' className='col-md-6' readOnly={readOnly} />

            <FormDatePicker ref={e => this.thoiGianThiTotNghiepDuKien = e} label='Thời gian tốt nghiệp dự kiến' className='col-md-6' readOnly={readOnly} />
            <FormDatePicker ref={e => this.thoiGianThiTotNghiepChinhThuc = e} label='Thời gian tốt nghiệp chính thức' className='col-md-6' readOnly={readOnly} />

            <h3 className='tile-title' style={{ width: '100%', paddingLeft: 15, marginBottom: 5 }}>Mô tả khoá học</h3>
            <FormRichTextBox ref={e => this.shortDescription = e} label='Mô tả ngắn khóa học' className='col-md-12' readOnly={readOnly} />
            <FormEditor ref={e => this.detailDescription = e} label='Mô tả chi tiết khóa học' className='col-md-12' readOnly={readOnly} style={{ height: '400px' }} />

            {permissionCourse.write ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
        </div>;

        const tabs = [
            { title: 'Thông tin chung', component: tabInfo },
            { title: 'Môn học', component: <AdminSubjectView permission={permissionCourse} /> },
            { title: 'Quản trị viên', component: <AdminManagerView permission={permissionCourse} currentUser={currentUser} permissionUser={permissionUser} permissionDivision={permissionDivision} /> },
            { title: 'Học viên', component: this.state.courseType && this.props.course ? <AdminStudentView permission={permissionCourse} permissionUser={permissionUser} courseType={this.state.courseType} course={this.props.course} /> : null },
            { title: 'Gán cố vấn học tập', component: <AdminTeacherView permission={permissionCourse} permissionUser={permissionUser} courseType={this.state.courseType} updateCourse={this.props.updateCourse} /> },
            { title: 'Gán giáo viên', component: <AdminRepresentersView permission={permissionCourse} permissionDivision={permissionDivision} /> },
        ];

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: ' + (this.state.name),
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Chi tiết khóa học'],
            content: <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
