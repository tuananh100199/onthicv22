import React from 'react';
import { connect } from 'react-redux';
import { getCoursePage, createCourse, updateCourse, deleteCourse } from './redux';
import { ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';

class CourseModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = () => {
        this.itemName.value('');
        this.itemCourseType.value(null);
    }

    onSubmit = () => {
        const data = {
            name: this.itemName.value(),
            courseType: this.itemCourseType.value(),
        };
        if (data.name == '') {
            T.notify('Tên khóa học bị trống!', 'danger');
            this.itemName.focus();
        } if (data.licenseClass == '') {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.create(data, data => {
                this.hide();
                data.item && this.props.history.push('/user/course/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Khóa học mới',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên khóa học' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemCourseType = e} label='Loại khóa học' data={ajaxSelectCourseType} readOnly={this.props.readOnly} />
        </>,
    });
}

class CoursePage extends AdminPage {
    componentDidMount() {
        this.props.getCoursePage();
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    delete = (e, item) => e.preventDefault() || T.confirm('Khóa học', 'Bạn có chắc bạn muốn xóa khóa học này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteCourse(item._id));

    render() {
        const permission = this.getUserPermission('course');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khai giảng</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Quản trị viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Cố vấn học tập</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.name} url={'/user/course/' + item._id} />
                    <TableCell type='date' content={item.thoiGianKhaiGiang} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='number' content={item.admins ? item.admins.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.length : 0} />
                    <TableCell type='number' content={item.groups ? item.groups.reduce((a, b) => (a.student ? a.student.length : 0) + (b.student ? b.student.length : 0), 0) : 0} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateCourse(item._id, { active }, () => {
                        T.notify('Cập nhật thông tin khóa học thành công!');
                    })} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: <>
                <div className='tile'>{table}</div>
                <CourseModal create={this.props.createCourse} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getCoursePage} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getCoursePage, createCourse, updateCourse, deleteCourse };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);
