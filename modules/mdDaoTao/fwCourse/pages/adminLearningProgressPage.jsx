import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getLearningProgress } from '../redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage, AdminModal, TableCell, renderTable, FormTextBox } from 'view/component/AdminPage';

class Modal extends AdminModal {
    state = {};
    onShow = (item) => {
        const { _id, student, diemThucHanh } = item || { diemThucHanh: 0 };
        this.itemDiemThucHanh.value(diemThucHanh);

        this.setState({ loading: false, _id, student });
    }

    onSubmit = () => {
        const _id = this.state;
        const changes = {
            diemThucHanh: this.itemDiemThucHanh.value(),
        };
        if (changes.diemThucHanh == '') {
            T.notify('Vui lòng nhập điểm thực hành!', 'danger');
            this.itemDiemThucHanh.focus();
        } else {
            this.props.updateStudent(_id, changes, () => {
                this.props.getLearningProgress(this.props.courseId, data => {
                    if (data.error) {
                        T.notify('Lấy tiến độ học tập học viên bị lỗi!', 'danger');
                        this.props.history.push('/user/course/');
                    }
                });
                this.hide();
            });
        }
    }

    onChangeScore = () => {
        let diemThucHanh = this.itemDiemThucHanh.value();
        if (diemThucHanh) {
            diemThucHanh = Number(diemThucHanh);
            if (diemThucHanh < 0) {
                this.itemDiemThucHanh.value(0);
            } else if (diemThucHanh > 10) {
                this.itemDiemThucHanh.value(diemThucHanh % 100 <= 10 ? diemThucHanh % 100 : diemThucHanh % 10);
            }
        }
    }

    render = () => {
        return this.renderModal({
            title: 'Điểm thực hành',
            body: <>
                <FormTextBox ref={e => this.itemDiemThucHanh = e} label='Nhập điểm' type='number' min='0' max='10' onChange={this.onChangeScore} readOnly={this.props.readOnly} />
            </>,
        });
    }
}

class AdminLearningProgressPage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/learning').parse(window.location.pathname);
            if (params && params._id) {
                this.setState({courseId:  params._id});
                this.props.getLearningProgress(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy tiến độ học tập học viên bị lỗi!', 'danger');
                        this.props.history.push('/user/course/');
                    }
                });
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    edit = (e, item) => e.preventDefault() || this.modal.show(item);

    render() {
        const students = this.props.course && this.props.course.data && this.props.course && this.props.course.data.students ? this.props.course.data.students : [],
            subjects = this.props.course && this.props.course.data && this.props.course.data.subjects.sort((a, b) => a.monThucHanh - b.monThucHanh);
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto' }}  nowrap='true'>Tên học viên</th>
                    <th style={{ width: 'auto' }}>CMND/CCCD</th>
                    {subjects && subjects.length && subjects.map((subject, i) => (<th key={i} style={{ width: 'auto', color: subject.monThucHanh ? 'aqua' : 'coral' }} nowrap='true'>{subject.title}</th>))}
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm lý thuyết</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm thực hành</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Điểm trung bình</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Nhập điểm thực hành</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.lastname + ' ' + item.firstname} />
                    <TableCell type='text' content={item.identityCard} />
                    {subjects && subjects.length && subjects.map((subject, i) => (
                        <TableCell key={i} type='text' style={{ textAlign: 'center' }} content={` 
                            ${item.subject && item.subject[subject._id] && !subject.monThucHanh ? item.subject[subject._id].completedLessons : 0}
                            / ${subject.monThucHanh ? 0 : subject.lessons.length}
                            ${subject.monThucHanh ? '' : `=> ${item.subject && item.subject[subject._id] ? item.subject[subject._id].diemMonHoc : 0}`}
                         ` }
                        />))}
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.diemLyThuyet ? item.diemLyThuyet : 0} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={students[index] && students[index].diemThucHanh ? students[index].diemThucHanh : 0} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={students[index] ? (Number(Number((students[index].diemThucHanh ? students[index].diemThucHanh : 0)) + Number(item.diemLyThuyet ?  item.diemLyThuyet : 0)) / 2).toFixed(1) : 0} />
                    <TableCell type='buttons' style={{ textAlign: 'center' }} content={item} onEdit={this.edit} />

                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-cubes',
            title: 'Tiến độ học tập',
            breadcrumb: [<Link key={0} to={'/user/course/' + this.state.courseId} >Khóa học</Link>, 'Tiến độ học tập'],  // TODO Thầy Tùng
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                        <Modal ref={e => this.modal = e} updateStudent={this.props.updateStudent} getLearningProgress={this.props.getLearningProgress} courseId={this.state.courseId} />
                    </div>
                </div>),
            onBack: () => this.props.history.goBack(),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getLearningProgress, updateStudent };
export default connect(mapStateToProps, mapActionsToProps)(AdminLearningProgressPage);