import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getCourse, getLearningProgress } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

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
                this.props.getLearningProgress(this.props.courseId, data => {
                    if (data.error) {
                        T.notify('Lấy tiến độ học tập học viên bị lỗi!', 'danger');
                        this.props.history.push('/user/course/');
                    }
                    this.hide();
                });
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
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.getLearningProgress(course._id);
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.getLearningProgress(params._id);
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    getLearningProgress = (_courseId) => {
        this.props.getLearningProgress(_courseId, data => {
            if (data.error) {
                T.notify('Lấy tiến độ học tập học viên bị lỗi!', 'danger');
                this.props.history.push('/user/course/');
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const students = this.props.course && this.props.course && this.props.course.students ? this.props.course.students : [],
            subjects = this.props.course && this.props.course.subjects ? this.props.course.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh) : [];

        const subjectPoints = [],
            subjectColumns = [];
        (subjects || []).forEach((subject, index) => {
            const diemBaiHoc = item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0,
                soBaiHoc = subject.lessons.length,
                diem = subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemMonHoc : 0}`;

            subjectPoints.push(<TableCell key={index} type='text' style={{ textAlign: 'center' }} content={`${diemBaiHoc} / ${soBaiHoc} ${diem}`} />);
            subjectColumns.push(<th key={index} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>);
        });

        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Tên học viên</th>
                    <th style={{ width: 'auto' }}>CMND/CCCD</th>
                    {subjectColumns}
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm lý thuyết</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm thực hành</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm trung bình</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nhập điểm thực hành</th>
                </tr>),
            renderRow: (item, index) => {
                const student = students[index],
                    diemLyThuyet = item.diemLyThuyet && !isNaN(item.diemLyThuyet) ? Number(item.diemLyThuyet) : 0,
                    diemThucHanh = student && student.diemThucHanh && !isNaN(item.diemThucHanh) ? Number(student.diemThucHanh) : 0;
                return (
                    <tr key={index}>
                        <TableCell type='number' content={index + 1} />
                        <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                        <TableCell type='text' content={item.identityCard} />
                        {subjectPoints}
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemLyThuyet} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={diemThucHanh} />
                        <TableCell type='text' style={{ textAlign: 'center' }} content={((diemLyThuyet + diemThucHanh) / 2).toFixed(1)} />
                        <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} onEdit={this.edit} />
                    </tr>);
            },
        });

        const backRoute = `/user/course/${item._id}`;
        return this.renderPage({
            icon: 'fa fa-line-chart',
            title: 'Tiến độ học tập: ' + item.name,
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Tiến độ học tập'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                        {item._id ? <LearningProgressModal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearningProgress={this.props.getLearningProgress} courseId={item._id} /> : null}
                    </div>
                </div>),
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCourse, getLearningProgress, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);