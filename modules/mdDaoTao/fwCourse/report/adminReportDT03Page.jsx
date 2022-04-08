import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { exportDT03, getLearningProgressPage, getCourse } from '../redux';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, CirclePageButton } from 'view/component/AdminPage';

class AdminReportDT03Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/thi-het-mon').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getLearningProgressPage(undefined, undefined, { courseId: course._id}, item => this.setState({ listStudent: item.students}));
                    // this.setState({listStudent: })
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            this.props.getLearningProgressPage(undefined, undefined, { courseId: params._id }, item => this.setState({ listStudent: item.students}));
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    exportDT03 = () => {
        const course = this.props.course && this.props.course.item;
        this.props.exportDT03(course._id);
    };

    xepLoai = (diemTB) => {
        if(diemTB < 5) return 'Yếu';
        else if(diemTB < 7 ) return 'Trung bình';
        else if(diemTB < 8) return 'Khá';
        else return 'Giỏi';   
    }

    getPage = (pageNumber, pageSize) => {
        this.props.getLearningProgressPage(pageNumber, pageSize, { courseId: this.state.courseId });
    }

    converNameSubject = (subject) => {
        let title = subject.title;
        if(title.startsWith('Đạo đức') && title.length > 40){
            const titleItem = title.split('và');
            if(titleItem[1]) titleItem[1] = '\nvà ' + titleItem[1];
            title = titleItem.join('');
        } else if(title.startsWith('Hướng dẫn') && title.length > 40){
            const titleItem = title.split('cho');
            if(titleItem[1]) titleItem[1] = '\ncho ' + titleItem[1];
            title = titleItem.join('');
        }
        return title;
    }

    render() {
        const permission = this.getUserPermission('course',['report']);
        if(permission.report){
            permission.write = true;
            permission.delete = true;
        }
        let { pageNumber, pageSize, pageTotal, totalItem } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const students = this.state.listStudent ? this.state.listStudent : [];
        const course = this.props.course && this.props.course.item,
        subjects =course && course.subjects && course.subjects.filter(subject => !subject.monThucHanh);
        const subjectColumns = [];
        (subjects || []).forEach((subject, index) => {
            subjectColumns.push(<th key={index} style={{ width: 'auto', whiteSpace:'pre', textAlign:'center', color: subject.monThucHanh ? 'aqua' : 'coral' }}  >{this.converNameSubject(subject)}</th>);
        });
        const backRoute = `/user/course/${course._id}/report`;
        const table = renderTable({
            getDataSource: () => students, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Năm sinh</th>
                    {subjectColumns}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Điểm TB</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xếp loại</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.birthday ? T.dateToText(item.birthday,'dd/mm/yyyy') : ''} style={{ whiteSpace: 'nowrap' }} />
                    {subjects && subjects.length ? subjects.map((subject, i) => (
                            <TableCell key={i} type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={item.tienDoThiHetMon && item.tienDoThiHetMon[subject._id] && item.tienDoThiHetMon[subject._id].score ? item.tienDoThiHetMon[subject._id].score : ''} />
                        )) : null}
                    <TableCell content={item.diemLyThuyet} />
                    <TableCell content={this.xepLoai(item.diemLyThuyet)} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Bảng điểm thi hết môn (Phụ lục DT03)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Bảng điểm thi hết môn (Phụ lục DT03)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => this.exportDT03()} />
                <Pagination name='adminLearningProgress' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.getPage} style={{ marginLeft: 45 }} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student, course:state.trainning.course});
const mapActionsToProps = { getCourse, updateStudent, getCourseTypeAll, exportDT03, getLearningProgressPage };
export default connect(mapStateToProps, mapActionsToProps)(AdminReportDT03Page);
