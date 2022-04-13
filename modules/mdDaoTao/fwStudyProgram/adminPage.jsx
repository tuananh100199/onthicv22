import React from 'react';
import { connect } from 'react-redux';
import { createStudyProgram, getStudyProgramAll, updateStudyProgramActive } from './redux';
import { getCourseTypeAll, ajaxSelectCourseType } from '../fwCourseType/redux';
import { AdminPage, AdminModal, FormTextBox, FormSelect, TableCell, renderTable  } from 'view/component/AdminPage';

class StudyProgramModal extends AdminModal {
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemName.focus()));
    }

    onShow = () => {
        this.itemName.value('');
        this.itemCourseType.value(null);
    }

    onSubmit = () => {
        const data = {
            title: this.itemName.value(),
            courseType: this.itemCourseType.value(),
        };
        if (data.title == '') {
            T.notify('Tên khóa học bị trống!', 'danger');
            this.itemName.focus();
        } else if (data.courseType == '') {
            T.notify('Loại khóa học bị trống!', 'danger');
            this.itemCourseType.focus();
        } else {
            this.props.create(data, data => {
                this.hide();
                data.item && this.props.history.push('/user/study-program/' + data.item._id);
            });
        }
    }

    render = () => this.renderModal({
        title: 'Chương trình học mới',
        body: <>
            <FormTextBox ref={e => this.itemName = e} label='Tên chương trình học' readOnly={this.props.readOnly} />
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
            this.props.getStudyProgramAll({});
        });
        T.ready();
    }

    create = e => e.preventDefault() || this.modal.show();

    onChangeCourseType = (courseType) => {
        this.props.getStudyProgramAll({courseType: courseType});
    }

    changeDefault = (item, active) => {
        if (active) {
            this.props.updateStudyProgramActive(item);
        }
    }

    render() {
        const permission = this.getUserPermission('course'),
            readOnly = (!permission.write || this.props.system.user.isLecturer) && (this.props.system.user && !this.props.system.user.isCourseAdmin);
        const list = this.props.studyProgram && this.props.studyProgram.list ? this.props.studyProgram.list : [];
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên chương trình</th>
                    <th style={{ width: '100%' }}>Hạng</th>
                    {!readOnly && <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>}
                    {!readOnly && <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/study-program/' + item._id} />
                    <TableCell type='text' content={item.courseType ? item.courseType.title : ''} url={'/user/course/' + item._id} />
                    {!readOnly && <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.changeDefault(item, active)} />}
                    {!readOnly && <TableCell type='buttons' content={item} permission={permission} onEdit={'/user/course/' + item._id} onDelete={this.delete} />}
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-tasks',
            title: 'Chương trình học',
            breadcrumb: ['Chương trình học'],
            content: <>
                <div className='tile'>
                    <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} onChange={data => this.onChangeCourseType(data.id)} className='col-md-4' readOnly={readOnly} />
                    {table}
                </div>
                <StudyProgramModal create={this.props.createStudyProgram} ref={e => this.modal = e} history={this.props.history} readOnly={!permission.write} />
            </>,
            onCreate: !readOnly ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, studyProgram: state.trainning.studyProgram });
const mapActionsToProps = { createStudyProgram, getCourseTypeAll, getStudyProgramAll, updateStudyProgramActive };
export default connect(mapStateToProps, mapActionsToProps)(CoursePage);
