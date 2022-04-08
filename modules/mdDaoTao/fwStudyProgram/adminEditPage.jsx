import React from 'react';
import { connect } from 'react-redux';
import { getStudyProgramItem, updateStudyProgram, updateStudyProgramActive } from './redux';
import { ajaxSelectCourseType } from 'modules/mdDaoTao/fwCourseType/redux';
import { Link } from 'react-router-dom';
import { AdminPage, FormTextBox, FormSelect, FormRichTextBox, CirclePageButton, FormCheckbox } from 'view/component/AdminPage';

class adminStudyProgramPage extends AdminPage {
    state = {};
    componentDidMount() {

        const setData = (data) => {
            const { title, active, kiemTra, note, monHoc, courseType, lyThuyet,
                thucHanh, time} = data;

            this.name.value(title);
            this.examDescribe.value(kiemTra);
            this.lyThuyet.value(lyThuyet);
            this.courseType.value(courseType ? { id: courseType._id, text: courseType.title } : null);
            this.thucHanh.value(thucHanh);
            this.monHoc.value(monHoc);
            this.note.value(note);
            this.time.value(time);
            this.active.value(active);
        };

        T.ready('/user/study-program', () => {
            const params = T.routeMatcher('/user/study-program/:_id').parse(window.location.pathname);
            if (params && params._id) {
                this.props.getStudyProgramItem(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy chương trình học bị lỗi!', 'danger');
                        this.props.history.push('/user/study-program');
                    } else if (data.item) {
                        setData(data.item);
                    } else {
                        this.props.history.push('/user/course/' + params._id);
                    }
                });
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    saveInfo = () => {
        const studyProgram = this.props.studyProgram ? this.props.studyProgram.item || {} : {};
        if (studyProgram) {
            const changes = {
                title: this.name.value().trim(),
                courseType: this.courseType.value(),
                time: this.time.value(),
                note: this.note.value(),
                kiemTra: this.examDescribe.value(),
                lyThuyet: this.lyThuyet.value(),
                thucHanh: this.thucHanh.value(),
                monHoc: this.monHoc.value()
            };
            if (changes.title == '') {
                T.notify('Tên khóa học trống!', 'danger');
                this.name.focus();
            } else {
                this.props.updateStudyProgram(studyProgram._id, changes);
            }
        }
    }

    changeDefault = (active) => {
        const studyProgram = this.props.studyProgram ? this.props.studyProgram.item || {} : {};
        if (active) {
            this.props.updateStudyProgramActive(studyProgram);
        }
    }

    render() {
        const studyProgram = this.props.studyProgram ? this.props.studyProgram.item || {} : {};
        const currentUser = this.props.system ? this.props.system.user : null,
            permission = this.getUserPermission('studyProgram'),
            previousRoute = '/user/study-program',
            { isLecturer, isCourseAdmin } = currentUser,
            readOnly = ((!permission.write || isLecturer) && !isCourseAdmin); //TODO: xem lại !isCourseAdmin
       
        return this.renderPage({
            icon: 'fa fa-tasks',
            title: 'Chương trình học: ' + studyProgram.title,
            breadcrumb: [<Link key={0} to='/user/study-program'>Chương trình học</Link>, 'Thông tin khóa học'],
            content: 
                <div className='tile'>
                    <div className='row'>
                        <FormTextBox ref={e => this.name = e} label='Tên chương trình học' className='col-md-4' value={studyProgram.title} readOnly={readOnly} />
                        <FormSelect ref={e => this.courseType = e} label='Loại khóa học' data={ajaxSelectCourseType} className='col-md-4' readOnly={readOnly} />
                        <FormCheckbox ref={e => this.active = e} className={'col-md-4'} label='Trạng thái' isSwitch={true} onChange={active => this.changeDefault(active)} readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.monHoc = e} label='Môn học' readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.time = e} label='Thời gian' readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.lyThuyet = e} label='Nội dung lý thuyết' readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.thucHanh = e} label='Nội dung thực hành' readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.examDescribe = e} label='Hình thức kiểm tra' readOnly={readOnly} />
                        <FormRichTextBox className='col-md-6' ref={e => this.note = e} label='Ghi chú' readOnly={readOnly} />
                        {!readOnly ? <CirclePageButton type='save' onClick={this.saveInfo} /> : null}
            </div>
                </div>,
            backRoute: previousRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, studyProgram: state.trainning.studyProgram });
const mapActionsToProps = { getStudyProgramItem, updateStudyProgram, updateStudyProgramActive };
export default connect(mapStateToProps, mapActionsToProps)(adminStudyProgramPage);
