import React from 'react';
import { connect } from 'react-redux';
import { getTeacherLocationPage, deleteTeacherLocation } from './redux';
import { getCourse } from 'modules/mdDaoTao/fwCourse/redux';
import { AdminPage, TableCell, renderTable, AdminModal, TableHeadCell,TableHead } from 'view/component/AdminPage';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

class NoteModal extends AdminModal {
    state = {};
    onShow = (item) => {
        console.log(item);
        const { note, truant } = item.timeTable || { note: '', truant: false };
        this.setState({ note, truant });
    }

    render = () => {
        return this.renderModal({
            title: 'Ghi chú',
            body: <>
                <label className='col-md-12'>Ghi chú của giáo viên: <b>{this.state.note ? this.state.note : 'Chưa có!'}</b></label>
            </>,
        });
    }
}

class MapModal extends AdminModal {
    state = {};
    onShow = (item) => {
        const record = item.record;
        let polyline = [];
        record && record.length && record.forEach(gps => {
            polyline.push([gps.latitude, gps.longtitude]);
          });
        const map = (record ? <div className="w-4/5">
        <MapContainer
          center={{lat: record[0].latitude, lng: record[0].longtitude}}
          zoom={15}
          style={{ height: '60vh', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[10.713056, 106.552550]}>
            <Popup>
              Trụ sở chính
            </Popup>
          </Marker>
          <Polyline pathOptions={{ color: 'lime' }} positions={polyline} />
        </MapContainer>
      </div> : null);
        setTimeout(() => {
            this.setState({ map });
        }, 200);  
    }

    render = () => {
        const { map} = this.state;
        return this.renderModal({
            title: 'Quãng đường dạy',
            size: 'large',
            body: <>
               {map}
            </>,
        });
    }
}

class TeacherHistoryPage extends AdminPage {
    componentDidMount() {
        T.ready('/user/course', () => {
            const params = T.routeMatcher('/user/course/:_id/location').parse(window.location.pathname);
            const user = this.props.system && this.props.system.user;
            const course = this.props.course ? this.props.course.item : null;
            if (course) {
                this.props.getTeacherLocationPage(1,50, {teacher: user._id});
            } else {
                this.props.getCourse(params._id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push('/user/course/' + params._id);
                    } else {
                        this.props.getTeacherLocationPage(1,50, {teacher: user._id});
                    }
                });
            }


        });
        // const user = this.state.system && this.state.system.user;
        // this.props.getTeacherLocationPage(1,50, {});
    }

    delete = (e, item) => e.preventDefault() || T.confirm('Định vị giáo viên', 'Bạn có chắc bạn muốn xoá định vị này?', true, isConfirm =>
        isConfirm && this.props.deleteTeacherLocation(item._id));

    render() {
        const item = this.props.course && this.props.course.item ? this.props.course.item : {};
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.teacherLocation && this.props.teacherLocation.page ?
                this.props.teacherLocation.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
                table = renderTable({
                    getDataSource: () => list, stickyHead: true,autoDisplay:true,
                    renderHead: () => (
                        <TableHead getPage = {this.props.getTeacherLocationPage}>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <TableHeadCell name='fullName' content='Học viên' style={{width:'100%'}}  />
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Bài học</th>
                            <TableHeadCell name='date' sort={true} content='Ngày dạy' style={{ width: 'auto', textAlign: 'center' }} nowrap='true'/>
                            <TableHeadCell name='car' content='Xe' style={{width:'auto'}} nowrap='true' />
                            <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khoá</th>
                            <th style={{ width: 'auto' }} nowrap='true'>Thao tác</th>
                        </TableHead>),
                    renderRow: (item, index) => (
                        <tr key={index}>
                            <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                            <TableCell type='text' content={item.timeTable && item.timeTable.student ? item.timeTable.student.lastname + ' ' + item.timeTable.student.firstname : ''} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.timeTable && item.timeTable.content ? item.timeTable.content : ''} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }} content={item.date && item.timeTable ? T.dateToText(item.date, 'dd/mm/yyyy') + ' ' + item.timeTable.startHour + ':00' : 'Ôn tập chung'} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap'  }} content={item.timeTable && item.timeTable.car && item.timeTable.car.licensePlates} />
                            <TableCell type='text' style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap'  }} content={item.timeTable && item.timeTable.student && item.timeTable.student.course ? item.timeTable.student.course.name : ''} />
                            <TableCell type={'buttons'} style={{ textAlign: 'center' }}>
                                <a className='btn btn-success' href='#' onClick={() => this.modal.show(item)}>
                                    <i className='fa fa-lg fa-eye' />
                                </a>
                                <a className='btn btn-primary' href='#' onClick={() => this.noteModal.show(item)}>
                                    <i className='fa fa-lg fa-comment' />
                                </a>
                                <a className='btn btn-danger' href='#' onClick={(e) => this.delete(e, item)}>
                                    <i className='fa fa-lg fa-trash' />
                                </a>
                            </TableCell> 
                        </tr>),
                });    
        
            const backRoute = `/user/course/${item._id}`;
            return this.renderPage({
            icon: 'fa fa-history',
            title: 'Lịch sử dạy thực hành',
            breadcrumb: [<Link key={0} to='/user/course'>Khóa học</Link>, item._id ? <Link key={0} to={backRoute}>{item.name}</Link> : '', 'Lịch sử dạy thực hành'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div>
                            {table}
                        </div>
                    </div>
                    <Pagination style={{ left: '320px'}} name='pageTeacherLocation' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getTeacherLocationPage} />
                    <MapModal ref={e => this.modal = e} />
                    <NoteModal ref={e => this.noteModal = e} />
                </div>
            ),
            backRoute: backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacherLocation: state.teacher.teacherLocation, course: state.trainning.course });
const mapActionsToProps = { getTeacherLocationPage, deleteTeacherLocation, getCourse};
export default connect(mapStateToProps, mapActionsToProps)(TeacherHistoryPage);
