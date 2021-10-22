import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgressPage, exportLearningProgressToExcel } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, CirclePageButton, TableCell, renderTable, FormTextBox, FormCheckbox } from 'view/component/AdminPage';
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
                this.props.getLearningProgressPage(undefined, undefined, { courseId: this.props.courseId, filterOn: this.props.filterOn }, () => this.hide());
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

class AdminLearningProgressPage extends AdminPage {
    state = { filterOn: false };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                this.setState({ courseId: params._id });
                if (course) {
                    this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id, filterOn: this.state.filterOn });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getLearningProgressPage(undefined, undefined, { courseId: params._id, filterOn: this.state.filterOn });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getPage = (pageNumber, pageSize) => {
        this.props.getLearningProgressPage(pageNumber, pageSize, { courseId: this.state.courseId, filterOn: this.state.filterOn });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    onChange = (value) => {
        this.setState({ filterOn: value });
        this.props.getLearningProgressPage(undefined, undefined, { courseId: this.state.courseId, filterOn: value });
    }

    render() {
        const user = this.props.system ? this.props.system.user : null,
            { isLecturer } = user;
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
            subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [];
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.course && this.props.course.page ?
            this.props.course.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };

        const subjectColumns = [];
        (subjects || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>);
        });

        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Tên học viên</th>
                    <th style={{ width: 'auto' }}>CMND/CCCD</th>
                    {subjectColumns}
                    <th style={{ width: 'auto', color: 'coral' }} nowrap='true'>Điểm lý thuyết</th>
                    <th style={{ width: 'auto', color: 'aqua' }} nowrap='true'>Điểm thực hành</th>
                    <th style={{ width: 'auto', color: 'red' }} nowrap='true'>Điểm trung bình</th>
                </tr>),
            renderRow: (item, index) => {
                const student = students[index],
                    diemLyThuyet = item.diemLyThuyet && !isNaN(item.diemLyThuyet) ? Number(item.diemLyThuyet) : 0,
                    diemThucHanh = student && student.diemThucHanh && !isNaN(item.diemThucHanh) ? Number(student.diemThucHanh) : 0,
                    diemTB = ((diemLyThuyet + diemThucHanh) / 2).toFixed(1);
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.lastname + ' ' + item.firstname} />
                        <TableCell type='text' content={item.identityCard} />
                        {subjects && subjects.length && subjects.map((subject, i) => (
                            <TableCell key={i} type='text' style={{ textAlign: 'center' }} content={` 
                            ${item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0}
                            / ${subject.monThucHanh ? 0 : subject.lessons.length}
                            ${subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemMonHoc : 0}`}`} />))}
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemLyThuyet} />
                        <TableCell type='link' style={{ textAlign: 'center' }} content={<>{diemThucHanh}<i className='fa fa-lg fa-edit' /></>} className='practicePoint' onClick={e => this.edit(e, item)} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemTB} />
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
                            <FormCheckbox className='col-md-9' ref={e => this.course = e} onChange={value => this.onChange(value)} label='Học viên đủ điều kiện thi hết môn' />
                            <Link className='col-md-3' to={`${backRoute}/import-final-score`}><button className='btn'> Nhập điểm thi hết môn </button></Link>
                        </div>
                        {table}
                        {!isLecturer ? <Pagination name='adminLearningProgress' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} style={{ marginLeft: 45 }} /> : null}
                        {item._id ? <LearningProgressModal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearningProgressPage={this.props.getLearningProgressPage} courseId={item._id} filterOn={this.state.filterOn} /> : null}
                        <CirclePageButton type='export' onClick={() => exportLearningProgressToExcel()} />
                    </div>
                </div>
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgressPage, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);