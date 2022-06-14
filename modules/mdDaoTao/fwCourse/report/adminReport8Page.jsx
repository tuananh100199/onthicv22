import React from 'react';
import { connect } from 'react-redux';
import {  getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import { getCarPage, updateCar } from 'modules/mdDaoTao/fwCar/redux';
import { export8, getCourse } from '../redux';
import FileSaver from 'file-saver';
import Pagination from 'view/component/Pagination';
import { Link } from 'react-router-dom';
import { AdminPage, renderTable, TableCell, CirclePageButton } from 'view/component/AdminPage';

class AdminReport8Page extends AdminPage {
    state = { searchText: '' };
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/report/xe-tap-lai').parse(window.location.pathname);
            if (params && params._id) {
                const course = this.props.course ? this.props.course.item : null;
                if (course) {
                    this.props.getCarPage(undefined, undefined, { courseId: course._id, totNghiep: 'true', datSatHach: 'false' }, (data) => {
                        this.setState({listStudent: data.list, courseId: params._id});
                    });
                } else {
                    this.props.getCourse(params._id, data => {
                        if (data.error) {
                            T.notify('Lấy khóa học bị lỗi!', 'danger');
                            this.props.history.push('/user/course/' + params._id);
                        } else {
                            const teacherGroups = data && data.item && data.item.teacherGroups || [];
                            let listTeacher = [];
                            teacherGroups.forEach(group =>listTeacher.push(group.teacher._id));
                            this.props.getCarPage(undefined, undefined, { user: {$in: listTeacher}, courseType: data.item.courseType._id }, (data) => {
                                console.log(data);
                                this.setState({listCar: data && data.list, courseId: params._id});
                            });
                        }
                    });
                }
            } else {
                this.props.history.push('/user/course/');
            }
        });
    }

    export8 = () => {
        const list  = this.props.car && this.props.car.page && this.props.car.page.list;
        const listCar = this.state.listCar;
        let listId = listCar.map(car => car._id);
        if(list && list.length){
            this.props.export8(listId, (data) => {
                FileSaver.saveAs(new Blob([new Uint8Array(data.buf.data)]), 'Phu_Luc_8.docx');
            });
        } else{
            T.notify('Danh sách xe trống!', 'danger');
        }
    };

    delete = (e, item) => {
        e.preventDefault();
        T.confirm('Xoá xe', 'Bạn có chắc muốn xoá xe ' + item.licensePlates, true, isConfirm =>
            isConfirm && this.setState({listCar: this.state.listCar.filter((car) => car._id != item._id)}));
    };

    // updateState = (newState) => {
    //     this.setState(newState);
    // }

    render() {
        const permission = this.getUserPermission('car', ['read']);
        permission.delete = true;
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem } = this.props.car && this.props.car.page ?
            this.props.car.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const listCar = this.state.listCar;
        const backRoute = `/user/course/${this.state.courseId}/report`;
        const table = renderTable({
            getDataSource: () => listCar, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Biển số đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Cơ sở</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Nhãn hiệu</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại xe</th>
                    {/* <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số động cơ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số khung</th> */}
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày đăng ký</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày hết hạn</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>

                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={item.licensePlates} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.division.title} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.brand && item.brand.title} />
                    <TableCell content={item.type && item.type.title} />
                    {/* <TableCell content={'123'} />
                    <TableCell content={'123'} /> */}
                    <TableCell content={T.dateToText(item.ngayDangKy,'dd/mm/yyyy')} />
                    <TableCell content={T.dateToText(item.ngayHetHanXeTapLai,'dd/mm/yyyy')} />
                    <TableCell type='buttons' content={item} permission={permission} onDelete={this.delete} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Danh sách xe tập lái khoá (Phụ lục 8)',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>,<Link key={1} to={'/user/course/' + this.state.courseId + '/report'}>Báo cáo</Link>,'Danh sách xe tập lái khoá (Phụ lục 8)'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        {table}
                    </div>
                </div>
                <CirclePageButton type='export' onClick={() => this.export8()} />
                <Pagination name='pageCourse' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} pageCondition={pageCondition} style={{ left: 320 }}
                    getPage={(pageNumber, pageSize) => this.props.getStudentPage(pageNumber, pageSize, { courseId: this.state.courseId, totNghiep: 'true', datSatHach: 'false' })} />
            </>,
            backRoute
        });
    }
}

const mapStateToProps = state => ({ system: state.system, car: state.trainning.car});
const mapActionsToProps = { getCarPage, updateCar, getCourseTypeAll, export8, getCourse };
export default connect(mapStateToProps, mapActionsToProps)(AdminReport8Page);
