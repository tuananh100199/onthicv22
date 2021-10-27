import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage, exportLearningProgressToExcel } from '../redux';
import { updateStudent, getStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, CirclePageButton, TableCell, renderTable, FormTextBox, FormSelect } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import './style.scss';

class LearningProgressModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.diemThucHanh.focus()));
    }

    onShow = (item) => {
        const { _id, diemThucHanh } = item || { diemThucHanh: 0 };
        this.diemThucHanh.value(diemThucHanh);
        this.setState({ _id });
    }

    onSubmit = () => {
        const changes = {
            diemThucHanh: this.diemThucHanh.value(),
        };
        if (changes.diemThucHanh == '') {
            T.notify('Vui lòng nhập điểm thực hành!', 'danger');
            this.diemThucHanh.focus();
        } else {
            this.props.updateStudent(this.state._id, changes, () => {
                this.props.getLearningProgressPage(undefined, undefined, { courseId: this.props.courseId, filter: this.props.filter }, () => this.hide());
            });
        }
    }

    onChangeScore = () => {
        let diemThucHanh = this.diemThucHanh.value();
        if (diemThucHanh) {
            diemThucHanh = Number(diemThucHanh);
            if (diemThucHanh < 0) {
                this.diemThucHanh.value(0);
            } else if (diemThucHanh > 10) {
                this.diemThucHanh.value(diemThucHanh % 100 <= 10 ? diemThucHanh % 100 : diemThucHanh % 10);
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm thực hành',
            body: <FormTextBox ref={e => this.diemThucHanh = e} label='Nhập điểm' type='number' min='0' max='10' onChange={this.onChangeScore} />
        });
    }
}

class CourseAdminModal extends AdminModal {
    state = { isLoading: true };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.diemThucHanh.focus()));
        const { monThiTotNghiep, subjects } = this.props;
        monThiTotNghiep && monThiTotNghiep.forEach((monThi) => {
            this[monThi._id] && this[monThi._id].value(0);
        });
        subjects && subjects.forEach((monThi) => {
            this[monThi._id] && this[monThi._id].value(0);
        });
    }

    onShow = (item) => {
        const { _id, diemThucHanh, diemThiHetMon, diemThiTotNghiep } = item || { diemThucHanh: 0 },
            { monThiTotNghiep } = this.props.course;
        diemThiTotNghiep && diemThiTotNghiep.length && diemThiTotNghiep.forEach((monThi) => {
            this[monThi._id] && this[monThi._id].value(monThi.point);
        });
        diemThiHetMon && diemThiHetMon.length && diemThiHetMon.forEach((monThi) => {
            this[monThi._id] && this[monThi._id].value(monThi.point);
        });
        this.diemThucHanh.value(diemThucHanh);
        this.setState({
            _id,
            diemThiHetMon,
            diemThiTotNghiep,
            monThiTotNghiep,
        });
    }

    onSubmit = () => {
        const changes = {
            diemThucHanh: this.diemThucHanh.value(),

        };
        if (changes.diemThucHanh == '') {
            T.notify('Vui lòng nhập điểm thực hành!', 'danger');
            this.diemThucHanh.focus();
        } else {
            this.props.updateStudent(this.state._id, changes, () => {
                this.props.getLearningProgressPage(undefined, undefined, { courseId: this.props.course._id, filter: this.props.filter }, () => this.hide());
            });
        }
    }

    onChangeScore = () => {
        let diemThucHanh = this.diemThucHanh.value();
        if (diemThucHanh) {
            diemThucHanh = Number(diemThucHanh);
            if (diemThucHanh < 0) {
                this.diemThucHanh.value(0);
            } else if (diemThucHanh > 10) {
                this.diemThucHanh.value(diemThucHanh % 100 <= 10 ? diemThucHanh % 100 : diemThucHanh % 10);
            }
        }
    }

    render = () => {
        const { diemThiHetMon, diemThiTotNghiep, monThiTotNghiep } = this.state,
            course = this.props.course;
        return this.renderModal({
            title: 'Bảng điểm tổng hợp',
            size: 'large',
            body:
                <div className='row'>
                    {diemThiTotNghiep && diemThiTotNghiep.length && diemThiTotNghiep.map((monThi, index) => (
                        <FormTextBox key={index} className='col-md-3' ref={e => this[monThi._id] = e} type='number' min='0' label={monThiTotNghiep[index].title} />
                    ))}
                    {diemThiHetMon && diemThiHetMon.length && diemThiHetMon.map((monThi, index) => (
                        <FormTextBox key={index} className='col-md-3' ref={e => this[monThi._id] = e} type='number' min='0' label={course.subjects[index].title} />
                    ))}
                    <FormTextBox className='col-md-3' ref={e => this.diemThucHanh = e} label='Điểm thực hành' type='number' min='0' max='10' onChange={this.onChangeScore} />
                </div>

        });
    }
}



class AdminLearningProgressPage extends AdminPage {
    state = { filter: 'all' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({ courseId: params._id });
                if (course) {
                    this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id, filter: this.state.filter });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getLearningProgressPage(undefined, undefined, { courseId: params._id, filter: this.state.filter });
                        }
                    });
                }
                this.filter.value('all');
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getPage = (pageNumber, pageSize, data) => {
        const filter = data ? data.id : this.state.filter;
        this.setState({ filter });
        this.props.getLearningProgressPage(pageNumber, pageSize, { courseId: this.state.courseId, filter });
    }

    edit = (e, item) => {
        const user = this.props.system ? this.props.system.user : null,
            { isCourseAdmin } = user;
        e.preventDefault();
        isCourseAdmin ?
            this.courseAdmiModal.show(item) :
            this.modal.show(item);
    };

    render() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user,
            item = this.props.course && this.props.course.item ? this.props.course.item : {},
            students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
            subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [],
            monThiTotNghiep = item && item.monThiTotNghiep ? item.monThiTotNghiep : [],
            dataSelectCourseAdmin = [
                { id: 'all', text: 'Tất cả học viên' },
                { id: 'thiHetMon', text: 'Học viên đủ điều kiện thi hết môn' },
                { id: 'thiTotNghiep', text: 'Học viên đủ điều kiện thi tốt nghiệp' },
                { id: 'totNghiep', text: 'Học viên đủ điều kiện tốt nghiệp' },
            ],
            dataSelectLecturer = [
                { id: 'all', text: 'Tất cả học viên' },
                { id: 'thiHetMon', text: 'Học viên đủ điều kiện thi hết môn' },
            ];
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const subjectColumns = [];
        (subjects || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>);
        });

        const finalScoreColumns = [];
        (subjects || []).forEach((subject, index) => {
            finalScoreColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{'Điểm thi ' + subject.title}</th>);
        });

        const monThiTotNghiepColumns = [];
        (monThiTotNghiep || []).forEach((monThi, index) => {
            monThiTotNghiepColumns.push(<th key={index} style={{ width: 'auto' }} nowrap='true'>{monThi.title}</th>);
        });


        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên học viên</th>
                    {subjectColumns}
                    <th style={{ width: 'auto', color: 'coral' }} nowrap='true'>Điểm lý thuyết</th>
                    <th style={{ width: 'auto', color: 'aqua' }} nowrap='true'>Điểm thực hành</th>
                    <th style={{ width: 'auto', color: 'red' }} nowrap='true'>Điểm trung bình</th>
                    {isCourseAdmin && finalScoreColumns}
                    {isCourseAdmin && <th style={{ width: 'auto', color: 'red' }} nowrap='true'>Điểm trung bình thi hết môn</th>}
                    {isCourseAdmin && monThiTotNghiepColumns}
                    {isCourseAdmin && <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>}
                </tr>),
            renderRow: (item, index) => {
                const student = students[index],
                    diemLyThuyet = item.diemLyThuyet && !isNaN(item.diemLyThuyet) ? Number(item.diemLyThuyet) : 0,
                    diemThucHanh = student && student.diemThucHanh && !isNaN(item.diemThucHanh) ? Number(student.diemThucHanh) : 0,
                    diemTB = ((diemLyThuyet + diemThucHanh) / 2).toFixed(1);
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={<p>{item.lastname + ' ' + item.firstname} <br /> {item.identityCard}</p>} />
                        {subjects && subjects.length && subjects.map((subject, i) => (
                            <TableCell key={i} type='text' style={{ textAlign: 'center' }} content={` 
                            ${item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0}
                            / ${subject.monThucHanh ? 0 : subject.lessons.length}
                            ${subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemMonHoc : 0}`}`} />))}
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemLyThuyet} />
                        <TableCell type='link' style={{ textAlign: 'center' }} content={<>{diemThucHanh}<i className='fa fa-lg fa-edit' /></>} className='practicePoint' onClick={e => this.edit(e, item)} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemTB} />
                        {isCourseAdmin && subjects && subjects.length && subjects.map((diemThi, i) => (
                            <TableCell key={i} type='text' style={{ textAlign: 'center' }}
                                content={
                                    students && students[index] && students[index].diemThiHetMon && students[index].diemThiHetMon[i] && students[index].diemThiHetMon[i].point
                                } />))}
                        {isCourseAdmin && <TableCell key={index} type='text' style={{ textAlign: 'center' }} content={students && students[index] && students[index].diemTrungBinhThiHetMon} />}
                        {isCourseAdmin && monThiTotNghiep && monThiTotNghiep.length ? monThiTotNghiep.map((diemThi, i) => (
                            <TableCell key={i} type='text' style={{ textAlign: 'center' }} className={students && students[index] && students[index].diemThiTotNghiep && students[index].diemThiTotNghiep[i] && students[index].diemThiTotNghiep[i].diemLiet ? 'text-danger' : ''}
                                content={
                                    students && students[index] && students[index].diemThiTotNghiep && students[index].diemThiTotNghiep[i] && students[index].diemThiTotNghiep[i].point
                                } />)) : null}
                        {isCourseAdmin && (
                            <TableCell type='buttons' content={item} permission={{ write: true, delete: true }} onEdit={e => this.edit(e, item)} />
                        )}
                    </tr>);
            },
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Tiến độ học tập: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Tiến độ học tập'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row'>
                            <div className='col-md-6'>
                                <FormSelect ref={e => this.filter = e} data={isCourseAdmin ? dataSelectCourseAdmin : dataSelectLecturer} onChange={data => this.getPage(undefined, undefined, data)} style={{ marginBottom: '10px', width: '300px' }} />
                            </div>
                            {isCourseAdmin && <Link style={{ textAlign: 'right' }} className='col-md-3' to={`${backRoute}/import-final-score`}><button className='btn btn-primary'> Nhập điểm thi hết môn </button></Link>}
                            {isCourseAdmin && <Link to={'/user/course/' + item._id + '/import-graduation-exam-score'} className='col-md-3'><button className='btn btn-primary'>Nhập điểm thi tốt nghiệp</button></Link>}
                        </div>
                        {table}
                        {!isLecturer ? <Pagination name='adminLearningProgress' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} style={{ marginLeft: 45 }} /> : null}
                        {item._id ? <LearningProgressModal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearningProgressPage={this.props.getLearningProgressPage} courseId={item._id} filter={this.state.filter} /> : null}
                        {item._id ? <CourseAdminModal ref={e => this.courseAdmiModal = e} updateStudent={this.props.updateStudent} getLearningProgressPage={this.props.getLearningProgressPage} monThiTotNghiep={monThiTotNghiep} subjects={subjects} course={item} filter={this.state.filter} /> : null}
                        {isCourseAdmin && <CirclePageButton type='export' onClick={() => exportLearningProgressToExcel(this.state.filter)} />}
                    </div>
                </div>
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent, getStudentPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);