
import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll, updateStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { updateForm } from 'modules/mdDaoTao/fwDonDeNghiHoc/redux';
import { FormTextBox } from 'view/component/AdminPage';
class AdminStudentView extends React.Component {
    state = {};
    componentDidUpdate(prevProps) {
        if (this.props.courseType && this.props.courseType !== prevProps.courseType) {
            this.props.getPreStudentAll({ courseType: this.props.courseType._id });
        }
    }

    onDragStart = (ev, id) => {
        ev.dataTransfer.setData("id", id);
    }

    onDragOver = (ev) => {
        ev.preventDefault();
    }

    onDrop = (ev, groupId) => {
       let _studentId = ev.dataTransfer.getData("id");
       let groups =  this.props.course.item.groups ? this.props.course.item.groups : [];
       let students = []; 
        groups.map((item, index) => {
            students =  groups && groups[index] && groups[index].student ? groups[index].student : [];
            if (item._id == groupId) {
                students.push(_studentId);
                groups[index].student = students;
            }
        })
       this.props.updateStudent(_studentId, { course: this.props.course.item._id }, (error) => {
           if(!error) {
            this.props.updateCourse( this.props.course.item._id, { groups }, () => {
                this.props.updateForm(this.props.donDeNghiHoc.item._id, { status: 'approved' });
            });
            this.props.getPreStudentAll({ courseType: this.props.courseType._id });
           }
       });
    }

    render() {
        const list = this.props.student && this.props.student.list ? this.props.student.list : [],
            groups = this.props.course && this.props.course.item && this.props.course.item.groups ? this.props.course.item.groups : [];
        let students = list.map((item, index) => {
           return (
                <div key={index} 
                    onDragStart = {(e) => this.onDragStart(e, item._id)}
                    draggable
                >
                {index + 1}. {item.lastname} {item.firstname}
            </div>
           )} 
        );

        return (
            <div className='row'>
                <div className='col-md-6' >
                    <h3 className='tile-title'>Ứng viên</h3>
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value, courseType: this.props.courseType._id })} />
                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                            <div> 
                                {students}
                            </div>                  
                        </ul>
                    </div>
                </div>
                <div className='col-md-6'>
                    <h3 className='tile-title'>Nhóm học viên</h3>
                    {groups.map((item, index) =>
                        <div key={index} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10 }}
                             onDrop={(e)=>{this.onDrop(e, item._id)}}
                             onDragOver={(e)=>this.onDragOver(e)} >
                            <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                                {item.teacher ? (
                                    <li><span style={{fontWeight: 'bold'}}>Giáo viên: </span> {item.teacher.lastname} {item.teacher.firstname}</li>
                                )
                                    :'Không có thông tin giáo viên'
                                }
                                <li><span style={{fontWeight: 'bold'}}>Danh sách học viên: </span></li>
                                {item.student ? item.student.map((student, index) => (
                                    <li  key={index}>{index+ 1}. {student.lastname} {student.firstname}</li>
                                    )) :'Không có thông tin học viên' }
                               
                            </ul>
                    </div>)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { getPreStudentAll, updateStudent, updateForm };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
