import React from 'react';
import { connect } from 'react-redux';
import { getTeacherLocation, createTeacherLocation, updateTeacherLocation, deleteTeacherLocation, swapTeacherLocation } from './redux';
import { AdminPage} from 'view/component/AdminPage';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';


class TeacherLocation extends AdminPage {
  state={};
    componentDidMount() {
      T.ready('/user/teacher-location', () => {
        const params = T.routeMatcher('/user/teacher-location/:_id').parse(window.location.pathname);
        if (params && params._id) {
            this.props.getTeacherLocation(params._id, data => {
                if (data.error) {
                    T.notify('Lấy định vị giáo viên bị lỗi!', 'danger');
                    this.props.history.push('/user/teacher-location');
                } else if (data) {
                    this.setState({ data});
                } else {
                    this.props.history.push('/user/teacher-location');
                }
            });
        } else {
            this.props.history.push('/user/teacher-location');
        }
      });
    }
    render() {
      const teacherLocation = this.props.teacherLocation ? this.props.teacherLocation.item : {};
      const previousRoute = '/user/teacher-location';
      const data = this.state.data;
      let polyline = [];
      teacherLocation && teacherLocation.record && teacherLocation.record.forEach(gps => {
        polyline.push([gps.latitude, gps.longtitude]);
      });

        return this.renderPage({
            icon: 'fa fa-folder',
            title: 'Định vị giáo viên: ' + (teacherLocation && teacherLocation.teacher ? teacherLocation.teacher.lastname + ' ' + teacherLocation.teacher.firstname : '...'),
            breadcrumb: ['Định vị giáo viên'],
            content: 
              <div className='tile'>
                <div className="flex ml-auto">
                  {teacherLocation && teacherLocation.timeTable && <h5>Buổi học ngày: {T.dateToText(teacherLocation.date,'dd/mm/yyyy')} {teacherLocation.timeTable.startHour}:00</h5>}
                  {data && data.record ? <div className="w-4/5">
                    <MapContainer
                      center={{lat: data.record[0].latitude, lng:data.record[0].longtitude}}
                      zoom={15}
                      style={{ height: '60vh', width: '50%' }}
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
                  </div> : null}
                </div>
              </div>,
            backRoute: previousRoute,
            
        });
    }
}

const mapStateToProps = state => ({ system: state.system, teacherLocation: state.teacher.teacherLocation });
const mapActionsToProps = { getTeacherLocation, createTeacherLocation, updateTeacherLocation, deleteTeacherLocation, swapTeacherLocation };
export default connect(mapStateToProps, mapActionsToProps)(TeacherLocation);
