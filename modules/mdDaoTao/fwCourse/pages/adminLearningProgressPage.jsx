import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage, exportLearningProgressToExcel, exportFinalExam } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, CirclePageButton, TableCell, renderTable, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';
import FileSaver from 'file-saver';
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

class ShowColModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready();
    }

    onShow = () => {
        const {totalColumns, course} = this.props;
        const listShow = T.cookie('showColLearningProgress/' + course) ? T.cookie('showColLearningProgress/' + course) : [];  
        totalColumns.map(column => {
            if(listShow.length) this['showColumns'+ column.id].value(listShow.indexOf(column.id) != -1);
            else this['showColumns'+ column.id].value(false);
        });
    }

    onSubmit = () => {
        const {totalColumns, course, filter} = this.props;
        let listShow =[];
        totalColumns.map(column => {
            if(this['showColumns'+ column.id].value()){
                listShow.push(column.id);
            }
        });
        T.cookie('showColLearningProgress/' + course, listShow);
        this.setState({listShow});
        this.props.getLearningProgressPage(undefined, undefined, { courseId: course, filter: filter }, () => {
            T.notify('Lưu danh sách cột hiển thị thành công!', 'success');
            this.hide();
        }); 
    }

    render = () => {
        const totalColumns = this.props.totalColumns;
        const content = (
            <>
                {totalColumns.map((column,index) => <FormCheckbox key={index} ref={e => this['showColumns'+ column.id] = e} label={column.text} />)}
            </> 
        );
        return this.renderModal({
            title: 'Cột hiển thị',
            body: content
        });
    }
}

class CourseAdminModal extends AdminModal {
    state = { isLoading: true };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.diemThucHanh.focus()));
    }

    onShow = (item) => {
        const { _id, diemThucHanh, diemThiHetMon, diemThiTotNghiep } = item || { diemThucHanh: 0 };
        diemThiTotNghiep && diemThiTotNghiep.length && diemThiTotNghiep.forEach((monThi) => {
            this[monThi.monThiTotNghiep] && this[monThi.monThiTotNghiep].value(monThi.point);
            this['Liet' + monThi.monThiTotNghiep] && this['Liet' + monThi.monThiTotNghiep].value(monThi.diemLiet);
        });
        diemThiHetMon && diemThiHetMon.length && diemThiHetMon.forEach((monThi) => {
            this[monThi.subject] && this[monThi.subject].value(monThi.point);
        });
        this.diemThucHanh.value(diemThucHanh);
        this.setState({
            _id,
            diemThiHetMon,
            diemThiTotNghiep
        });
    }

    onSubmit = () => {
        const { diemThiHetMon, diemThiTotNghiep } = this.state;
        let isUpdate = true, totNghiep = true;
        for (let i = 0; i < diemThiHetMon.length; i++) {
            if (this[diemThiHetMon[i].subject].value() == '') {
                T.notify('Vui lòng nhập điểm thi hết môn!', 'danger');
                this[diemThiHetMon[i].subject].focus();
                isUpdate = false;
                break;
            } else {
                diemThiHetMon[i].point = parseInt(this[diemThiHetMon[i].subject].value());
            }
        }
        for (let i = 0; i < diemThiTotNghiep.length; i++) {
            if (this[diemThiTotNghiep[i].monThiTotNghiep].value() == '') {
                T.notify('Vui lòng nhập điểm thi tốt nghiệp!', 'danger');
                this[diemThiTotNghiep[i].monThiTotNghiep].focus();
                isUpdate = false;
                break;
            } else {
                diemThiTotNghiep[i].point = parseInt(this[diemThiTotNghiep[i].monThiTotNghiep].value());
                diemThiTotNghiep[i].diemLiet = this['Liet' + diemThiTotNghiep[i].monThiTotNghiep].value();
                if (diemThiTotNghiep[i].diemLiet || diemThiTotNghiep[i].point < diemThiTotNghiep[i].monThiTotNghiep.score) totNghiep = false;
            }
        }
        const changes = {
            diemThucHanh: this.diemThucHanh.value(),
            diemThiHetMon,
            diemThiTotNghiep,
            totNghiep
        };
        if (changes.diemThucHanh == '') {
            T.notify('Vui lòng nhập điểm thực hành!', 'danger');
            this.diemThucHanh.focus();
        } else if (isUpdate) {
            this.props.updateStudent(this.state._id, changes, () => {
                this.props.getLearningProgressPage(undefined, undefined, { courseId: this.props.course._id, filter: this.props.filter }, () => this.hide());
            });
        }
    }

    render = () => {
        const { monThiTotNghiep, subjects } = this.props.course;
        return this.renderModal({
            title: 'Bảng điểm tổng hợp',
            size: 'large',
            body:
                <div className='row'>
                    {monThiTotNghiep && monThiTotNghiep.length ? monThiTotNghiep.map((monThi, index) => (
                        <div className='col-md-3' key={index}>
                            <FormTextBox ref={e => this[monThi._id] = e} type='number' min='0' label={monThi.title} />
                            <FormCheckbox ref={e => this['Liet' + monThi._id] = e} label={'Điểm liệt: ' + monThi.title} />
                        </div>
                    )) : null}
                    {subjects && subjects.length ? subjects.map((monThi, index) => (
                        <FormTextBox key={index} className='col-md-3' ref={e => this[monThi._id] = e} type='number' min='0' label={monThi.title} />
                    )) : null}
                    <FormTextBox className='col-md-3' ref={e => this.diemThucHanh = e} label='Điểm thực hành' type='number' min='0' max='10' />
                </div>

        });
    }
}



class AdminLearningProgressPage extends AdminPage {
    state = { filter: 'all', listShow: [] };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null,
                    user = this.props.system && this.props.system.user,
                    listShow = T.cookie('showColLearningProgress/' + params._id) ? T.cookie('showColLearningProgress/' + params._id) : [];
                this.setState({ courseId: params._id, listShow });
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
                user.isCourseAdmin && this.filter.value('all');
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getPage = (pageNumber, pageSize, data) => {
        const filter = data ? data : this.state.filter;
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

    exportFinal = (e, item, diemThi) => {
        e.preventDefault();
        if(item && item.tienDoThiHetMon && item.tienDoThiHetMon[diemThi._id]){
            this.props.exportFinalExam(diemThi._id, item._id, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'KTLX.docx');
            });
        } else T.notify('Học viên chưa làm bài kiểm tra của môn học này!', 'danger');
    };

    render() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer, isCourseAdmin } = user,
            item = this.props.course && this.props.course.item ? this.props.course.item : {},
            students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
            subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [],
            monThiTotNghiep = item && item.monThiTotNghiep ? item.monThiTotNghiep : [],
            totalColumns = [{id: 'diemLyThuyet', text: 'Điểm lý thuyết'}, {id:'diemThucHanh', text: 'Điểm thực hành'} ,{id:'diemTrungBinh', text:'Điểm trung bình'}  ,{id:'diemTrungBinhHetMon', text: 'Điểm trung bình thi hết môn'}, {id:'datSatHach', text:'Đạt sát hạch'}],
            listShow = (this.showColModal && this.showColModal.state && this.showColModal.state.listShow) ? this.showColModal.state.listShow : (this.state.listShow || []),
            dataSelectCourseAdmin = [
                { id: 'all', text: 'Tất cả học viên' },
                { id: 'thiHetMon', text: 'Học viên đủ điều kiện thi hết môn' },
                { id: 'thiTotNghiep', text: 'Học viên đủ điều kiện thi tốt nghiệp' },
                { id: 'totNghiep', text: 'Học viên đủ điều kiện thi sát hạch' },
                { id: 'satHach', text: 'Học viên đã đạt sát hạch' },
            ];
        const convertTime = (time) => {
                let hours = parseInt( time / 3600 ) % 24 ;
                let minutes = parseInt( time / 60 ) % 60 ;
                let seconds = time % 60;
                return (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds  < 10 ? '0' + seconds : seconds);
            };
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const subjectColumns = [];
        (subjects || []).forEach((subject, index) => {
            totalColumns.push({id: subject._id, text: subject.title});
            (!listShow.length || (listShow.length && listShow.indexOf(subject._id) != -1)) && subjectColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>);
        });

        const finalScoreColumns = [];
        (subjects || []).forEach((subject, index) => {
            totalColumns.push({id: 'final' + subject._id, text: 'Điểm thi ' + subject.title});
            (!listShow.length || (listShow.length && listShow.indexOf('final' + subject._id) != -1)) && finalScoreColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{'Điểm thi ' + subject.title}</th>);
        });

        const monThiTotNghiepColumns = [];
        (monThiTotNghiep || []).forEach((monThi, index) => {
            totalColumns.push({id: monThi._id, text: monThi.title});
            (!listShow.length || (listShow.length && listShow.indexOf(monThi._id) != -1)) && monThiTotNghiepColumns.push(<th key={index} style={{ width: 'auto' }} nowrap='true'>{monThi.title}</th>);
        });
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên học viên</th>
                    {subjectColumns}
                    {(!listShow.length || (listShow.length && listShow.indexOf('diemLyThuyet') != -1)) && <th style={{ width: 'auto', color: 'coral' }} nowrap='true'>Điểm lý thuyết</th>}
                    {(!listShow.length || (listShow.length &&  listShow.indexOf('diemThucHanh') != -1)) && <th style={{ width: 'auto', color: 'aqua' }} nowrap='true'>Điểm thực hành</th>}
                    {(!listShow.length || (listShow.length && listShow.indexOf('diemTrungBinh') != -1)) && <th style={{ width: 'auto', color: 'red' }} nowrap='true'>Điểm trung bình</th>}
                    {isCourseAdmin && finalScoreColumns}
                    {(!listShow.length || (listShow.length && listShow.indexOf('diemTrungBinhHetMon') != -1)) && isCourseAdmin && <th style={{ width: 'auto', color: 'red' }} nowrap='true'>Điểm trung bình thi hết môn</th>}
                    {isCourseAdmin && monThiTotNghiepColumns}
                    {(!listShow.length || (listShow.length && listShow.indexOf('datSatHach') != -1)) && isCourseAdmin && <th style={{ width: 'auto' }} nowrap='true'>Đạt sát hạch</th>}
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
                        {subjects && subjects.length ? subjects.map((subject, i) => (
                            (!listShow.length || (listShow.length && listShow.indexOf(subject._id) != -1)) ? <TableCell key={i} type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={<p>{` 
                            ${item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0}
                            / ${subject.monThucHanh ? 0 : subject.lessons.length}
                            ${subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemMonHoc : 0}`}`} <br />
                            Thời gian học : {item.subject[subject._id].thoiGianHoc ? convertTime(item.subject[subject._id].thoiGianHoc) : convertTime(0)}
                            </p>} /> : null
                            )) : null}
                        {(!listShow.length || (listShow.length && listShow.indexOf('diemLyThuyet') != -1)) && <TableCell type='text' style={{ textAlign: 'center' }} content={diemLyThuyet} />}
                        {(!listShow.length || (listShow.length && listShow.indexOf('diemThucHanh') != -1)) && <TableCell type='link' style={{ textAlign: 'center' }} content={<>{diemThucHanh}<i className='fa fa-lg fa-edit' /></>} className='practicePoint' onClick={e => this.edit(e, item)}/> }
                        {(!listShow.length || (listShow.length && listShow.indexOf('diemTrungBinh') != -1)) && <TableCell type='text' style={{ textAlign: 'center' }} content={diemTB} /> }
                        {isCourseAdmin && subjects && subjects.length ? subjects.map((diemThi, i) => (
                            (!listShow.length || (listShow.length && listShow.indexOf('final' + diemThi._id) != -1)) ? <TableCell key={i} type='link' style={{ textAlign: 'center' }} className='practicePoint'    
                            content={
                                <> {students && students[index] && students[index].diemThiHetMon && students[index].diemThiHetMon[i] && students[index].diemThiHetMon[i].point}<i className='fa fa-lg fa-download' /></>   
                                } onClick={e => this.exportFinal(e, item, diemThi)} />: null)) : null}
                        {(!listShow.length || (listShow.length && listShow.indexOf('diemTrungBinhHetMon') != -1)) && isCourseAdmin && <TableCell type='text' style={{ textAlign: 'center' }} content={students && students[index] && students[index].diemTrungBinhThiHetMon} />}
                        {isCourseAdmin && monThiTotNghiep && monThiTotNghiep.length ? monThiTotNghiep.map((diemThi, i) => (
                            (!listShow.length || (listShow.length && listShow.indexOf(diemThi._id) != -1))  ? <TableCell key={i} type='text' style={{ textAlign: 'center' }} className={students && students[index] && students[index].diemThiTotNghiep && students[index].diemThiTotNghiep[i] && students[index].diemThiTotNghiep[i].diemLiet ? 'text-danger' : ''}
                                content={
                                    students && students[index] && students[index].diemThiTotNghiep && students[index].diemThiTotNghiep[i] && students[index].diemThiTotNghiep[i].point
                                } />: null)) : null}
                        {(!listShow.length || (listShow.length && listShow.indexOf('datSatHach') != -1)) && isCourseAdmin && <TableCell type='text' style={{ textAlign: 'center' }} content={students && students[index] && students[index].datSatHach ? 'X' : ''} />}
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
                                {isCourseAdmin ? <FormSelect ref={e => this.filter = e} data={dataSelectCourseAdmin} onChange={data => this.getPage(undefined, undefined, data.id)} style={{ marginBottom: '10px', width: '300px' }} /> :
                                    <FormCheckbox ref={e => this.course = e} onChange={value => { const data = value ? 'thiHetMon' : 'all'; this.getPage(undefined, undefined, data); }} label='Học viên đủ điều kiện thi hết môn' />
                                }
                            </div>
                            {isCourseAdmin && !item.lock &&  <Link style={{ textAlign: 'right' }} className='col-md-3' to={`${backRoute}/import-final-score`}><button className='btn btn-primary'> Nhập điểm thi hết môn </button></Link>}
                            {isCourseAdmin && !item.lock && <Link  to={'/user/course/' + item._id + '/import-graduation-exam-score'} className='col-md-3'><button className='btn btn-primary'>Nhập điểm thi tốt nghiệp</button></Link>}
                        </div>
                        {table}
                        {!isLecturer ? <Pagination name='adminLearningProgress' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} style={{ marginLeft: 45 }} /> : null}
                        {item._id ? <LearningProgressModal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearningProgressPage={this.props.getLearningProgressPage} courseId={item._id} filter={this.state.filter} /> : null}
                        {<ShowColModal ref={e => this.showColModal = e} totalColumns={totalColumns} course={item._id} filter={this.state.filter} getLearningProgressPage={this.props.getLearningProgressPage} />}
                        {item._id ? <CourseAdminModal ref={e => this.courseAdmiModal = e} updateStudent={this.props.updateStudent} getLearningProgressPage={this.props.getLearningProgressPage} monThiTotNghiep={monThiTotNghiep} subjects={subjects} course={item} filter={this.state.filter} /> : null}
                        {isCourseAdmin && <CirclePageButton type='export' onClick={() => exportLearningProgressToExcel(item._id, this.state.filter)} />}
                        {isCourseAdmin && <CirclePageButton type='custom' customClassName='btn-warning' customIcon='fa-pencil-square-o' style={{right: '75px'}} onClick={() => this.showColModal.show()} />}
                    </div>
                </div>
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent, exportFinalExam };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);