import React from 'react';
import { connect } from 'react-redux';
import { getCoursePage, createCourse, updateCourse, deleteCourse } from './redux';
import { getCourseTypeAll, ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormTabs } from 'view/component/AdminPage';
import AdminCourseFilterView from './tabView/adminCourseFilterView';

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
        } else if (data.courseType == '') {
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
    state = {};
    componentDidMount() {
        this.props.getCourseTypeAll(list => {
            const courseTypes = list.map(item => ({ id: item._id, text: item.title }));
            this.setState({ courseTypes });
        });
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    render() {
        const permission = this.getUserPermission('course');
        const courseTypes = this.state.courseTypes ? this.state.courseTypes : [];
        const tabs = courseTypes.length ? courseTypes.map(courseType => ({ title: courseType.text, component: <AdminCourseFilterView courseFilter={courseType.course} courseType={courseType.id} /> })) : [];
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Khóa học',
            breadcrumb: ['Khóa học'],
            content: <>
                <FormTabs id='coursePageTab' contentClassName='tile' tabs={tabs} />
                <CourseModal create={this.props.createCourse} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCoursePage, createCourse, updateCourse, deleteCourse, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);
