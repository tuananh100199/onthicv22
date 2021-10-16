import React from 'react';
import { connect } from 'react-redux';
import { getCourse, updateCourse } from '../redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormDatePicker, FormEditor, FormSelect, FormRichTextBox, CirclePageButton, FormCheckbox } from 'view/component/AdminPage';

class EditCoursePage extends AdminPage {
    state = { name: '...' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const route = T.routeMatcher('/user/course/:_id/info'),
                _id = route.parse(window.location.pathname)._id,
                previousRoute = '/user/course/' + _id;
            if (_id) {
                this.props.getCourse(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.item) {
                        const { name, maxStudent, shortDescription, detailDescription, courseType, courseFee,
                            thoiGianKhaiGiang, thoiGianBatDau, thoiGianKetThuc, thoiGianThiKetThucMonDuKien, thoiGianThiKetThucMonChinhThuc, thoiGianThiTotNghiepDuKien, thoiGianThiTotNghiepChinhThuc, active, chatActive } = data.item;

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
                        this.active.value(active);
                        this.chatActive.value(chatActive);
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
            courseFees: this.state.courseFees,
            active: this.active.value(),
            chatActive: this.chatActive.value(),
        };
        this.setState({ chatActive: changes.chatActive });
        if (changes.courseFee == null) changes.courseFee = 0;
        if (changes.name == '') {
            T.notify('Tên khóa học trống!', 'danger');
            this.name.focus();
        } else {
            this.props.updateCourse(this.state._id, changes);
        }
    }

    render() {
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('course'),
            previousRoute = '/user/course/' + this.state._id,
            { isLecturer, isCourseAdmin } = currentUser,
            readOnly = (!permission.write || isLecturer) && !isCourseAdmin; //TODO: xem lại !isCourseAdmin

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học: Thông tin khóa học ' + (this.state.name),
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, 'Thông tin khóa học'],
            content: <>
                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-md-9' style={{ paddingLeft: 15, marginBottom: 5 }}>Thông tin chung</h3>
                        <FormCheckbox ref={e => this.active = e} className={'col-md-3 ' + (readOnly ? 'invisible' : '')} label='Kích hoạt' isSwitch={true} readOnly={readOnly} />
                        <FormTextBox ref={e => this.name = e} label='Tên khóa học' className='col-md-3' value={this.state.name} onChange={e => this.setState({ title: e.target.value })} readOnly={readOnly} />
                        <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} className='col-md-3' readOnly={readOnly} />
                        <FormTextBox ref={e => this.maxStudent = e} label='Số  học viên tối đa' className='col-md-3' type='number' readOnly={readOnly} />
                        <FormTextBox ref={e => this.courseFee = e} type='number' label='Học phí' className='col-md-3' readOnly={readOnly} />
                    </div>
                </div>

                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Thời gian</h3>
                        <FormDatePicker ref={e => this.thoiGianKhaiGiang = e} label='Thời gian khai giảng' className='col-md-4' readOnly={readOnly} type='time' />
                        <FormDatePicker ref={e => this.thoiGianBatDau = e} label='Thời gian bắt đầu' className='col-md-4' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.thoiGianKetThuc = e} label='Thời gian kết thúc' className='col-md-4' readOnly={readOnly} />

                        <FormDatePicker ref={e => this.thoiGianThiKetThucMonDuKien = e} label='Thời gian kết thúc môn dự kiến' className='col-md-6' readOnly={readOnly} type='time' />
                        <FormDatePicker ref={e => this.thoiGianThiKetThucMonChinhThuc = e} label='Thời gian kết thúc môn chính thức' className='col-md-6' readOnly={readOnly} type='time' />

                        <FormDatePicker ref={e => this.thoiGianThiTotNghiepDuKien = e} label='Thời gian tốt nghiệp dự kiến' className='col-md-6' readOnly={readOnly} />
                        <FormDatePicker ref={e => this.thoiGianThiTotNghiepChinhThuc = e} label='Thời gian tốt nghiệp chính thức' className='col-md-6' readOnly={readOnly} />

                    </div>
                </div>

                <div className='tile'>
                    <div className='row'>
                        <h3 className='tile-title col-12' style={{ paddingLeft: 15, marginBottom: 5 }}>Mô tả khóa học</h3>
                        <FormCheckbox ref={e => this.chatActive = e} className={'col-md-3 ' + (readOnly ? 'invisible' : '')} label='Kích hoạt chat' isSwitch={true} readOnly={readOnly} />
                        <FormRichTextBox ref={e => this.shortDescription = e} label='Mô tả ngắn khóa học' className='col-md-12' readOnly={readOnly} />
                        <FormEditor ref={e => this.detailDescription = e} label='Mô tả chi tiết khóa học' className='col-md-12' readOnly={readOnly} style={{ height: '400px' }} />
                    </div>
                </div>
                {!readOnly ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </>,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, updateCourse };
export default connect(mapStateToProps, mapActionsToProps)(EditCoursePage);
