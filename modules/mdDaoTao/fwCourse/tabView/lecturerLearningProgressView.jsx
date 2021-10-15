import React from 'react';
import { connect } from 'react-redux';
import { getLearingProgressByLecturer } from '../redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';
class Modal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, note } = item || { note: '', truant: false };
        this.itemNote.value(note);

        this.setState({ loading: false, _id, student });
    }

    onSubmit = () => {
        const { _id, student } = this.state;
        if (student) {
            const changes = {
                note: this.itemNote.value(),
            };
            this.props.update(_id, changes, student._id, () => this.hide());
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm thực hành',
            body: <>
                <FormTextBox ref={e => this.itemNote = e} label='Nhập điểm' readOnly={this.props.readOnly} />
            </>,
        });
    }
}
class AdminStudentView extends AdminPage {
    state = {};
    componentDidMount() {
        this.props.getLearingProgressByLecturer(this.props.courseId, data => {
            this.setState({ listStudent: data.item });
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const data = this.state.listStudent ? this.state.listStudent : [],
            courseItem = this.props.course && this.props.course.item ? this.props.course.item : { subjects: [] },
            subjects = courseItem && courseItem.subjects && courseItem.subjects.sort((a, b) => a && a.title && a.title.localeCompare(b && b.title));
            const monLyThuyet = subjects.filter(subject => subject.monThucHanh == false);

        const table = renderTable({
            getDataSource: () => data, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Tên học viên</th>
                    <th style={{ width: '100%' }}>CMND/CCCD</th>
                    {subjects.length && subjects.map((subject, i) => (<th key={i} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>))}
                    <th style={{ width: 'auto' }}>Điểm lý thuyết</th>
                    <th style={{ width: 'auto' }}>Điểm thực hành</th>
                    <th style={{ width: 'auto' }}>Điểm trung bình</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    {subjects.length && subjects.map((subject, i) => (
                    <TableCell 
                        key={i} 
                        type='text' 
                        content={`${
                            (subject && item.tienDoHocTap && item.tienDoHocTap[subject._id] ? 
                            (item.tienDoHocTap[subject._id]  && Object.keys(item.tienDoHocTap[subject._id]).length > subject.lessons.length ? 
                                subject.lessons.length : 
                                Object.keys(item.tienDoHocTap[subject._id]).length) 
                            : 0) }

                            / ${subject.lessons.length} => 
                            
                            ${ subject && item.tienDoHocTap && item.tienDoHocTap[subject._id]  ? 
                               (Object.keys(item.tienDoHocTap[subject._id]).length ? 
                                Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                    Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0) ? 
                                    (Number(Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                    Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0))/ subject.lessons.length).toFixed(1) : 0
                                 : 0)
                            : 0}`
                            } />))}
                    <TableCell 
                        type='text' 
                        content={monLyThuyet.length && 
                            (monLyThuyet.reduce((subjectNext, subject) => 
                            (subject && item.tienDoHocTap && item.tienDoHocTap[subject._id]  ? 
                                (Object.keys(item.tienDoHocTap[subject._id]).length ? 
                                    Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                        Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0) ? 
                                        (Number(Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                        Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0))/ subject.lessons.length).toFixed(1) : 0
                                : 0) 
                            : 0) + subjectNext ,0)) ? 
                            (monLyThuyet.reduce((subjectNext, subject) => 
                            (subject && item.tienDoHocTap && item.tienDoHocTap[subject._id]  ? 
                                Number((Object.keys(item.tienDoHocTap[subject._id]).length ? 
                                    Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                        Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0) ? 
                                        (Number(Object.entries(item.tienDoHocTap[subject._id]).reduce((lessonNext, lesson) => 
                                        Number(lesson[1].score) / Object.keys(lesson[1].trueAnswers).length * 10 + lessonNext, 0))/ subject.lessons.length).toFixed(1) : 0
                                    : 0))
                                : 0) + subjectNext ,0) / monLyThuyet.length).toFixed(1)
                            :0
                    } />
                    <TableCell type='buttons' content={item} onEdit={this.edit} />
                    <TableCell type='text' content={item.identityCard} />
                </tr>),
        });
        return <div className='tile-body'>
                {table}
                <Modal ref={e => this.modal = e} />
            </div>;
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearingProgressByLecturer };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);