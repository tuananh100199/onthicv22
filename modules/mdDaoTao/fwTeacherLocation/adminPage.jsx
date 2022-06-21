import React from 'react';
import { connect } from 'react-redux';
import { getTeacherLocationPage, deleteTeacherLocation } from './redux';
import { AdminPage, FormDatePicker, TableCell, renderTable} from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';



class TeacherLocation extends AdminPage {
    componentDidMount() {
        T.ready();
        // this.props.getTeacherLocationPage();
    }

    handleFilterByTime = (item) => {
        this.props.getTeacherLocationPage( 1 , 50, {date: new Date(item)}, data => {
            this.setState({ data });
        });
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Định vị giáo viên', 'Bạn có chắc bạn muốn xoá định vị này?', true, isConfirm =>
        isConfirm && this.props.deleteTeacherLocation(item._id));

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.teacherLocation && this.props.teacherLocation.page ?
                this.props.teacherLocation.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
                table = renderTable({
                    getDataSource: () => list,
                    renderHead: () => (
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Giáo viên</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời gian dạy</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Xe</th>
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khoá</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                        </tr>),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='link' content={item.teacher ? item.teacher.lastname + ' ' + item.teacher.firstname : ''} url={'/user/teacher-location/' + item._id}/>
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.date && item.timeTable ? T.dateToText(item.date, 'dd/mm/yyyy') + ' ' + item.timeTable.startHour + ':00' : 'Ôn tập chung'} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center' }} content={item.car} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center' }} content={item.course} />
                            <TableCell type={'buttons'} style={{ textAlign: 'center' }}>
                                <a className='btn btn-success' href={'/user/teacher-location/' + item._id}>
                                    <i className='fa fa-lg fa-eye' />
                                </a>
                                <a className='btn btn-danger' href='#' onClick={(e) => this.delete(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a>
                            </TableCell> 
                        </tr>),
                });    
        
            return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Định vị giáo viên',
            breadcrumb: ['Định vị giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <FormDatePicker className='col-md-4' ref={e => this.itemNgayLuaChon = e} label='Ngày giảng dạy' onChange={(item) => this.handleFilterByTime(item)} />
                        <div>
                            {table}
                        </div>
                    </div>
                    <Pagination name='pageTeacherLocation' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getTeacherLocationPage} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacherLocation: state.teacher.teacherLocation });
const mapActionsToProps = { getTeacherLocationPage, deleteTeacherLocation};
export default connect(mapStateToProps, mapActionsToProps)(TeacherLocation);
