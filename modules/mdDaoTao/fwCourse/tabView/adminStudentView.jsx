import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll } from 'modules/mdDaoTao/fwStudent/redux';
import { FormTextBox } from 'view/component/AdminPage';

class AdminStudentView extends React.Component {
   
    componentDidUpdate(prevProps) {
        if (this.props.courseType && this.props.courseType !== prevProps.courseType) {
            this.props.getPreStudentAll({courseType: this.props.courseType._id});
        }
    }

    render() {
        const list = this.props.student && this.props.student.list ? this.props.student.list : [],
        groups = this.props.course && this.props.course.item && this.props.course.item.groups ? this.props.course.item.groups : [];
        
        return (
            <div className='row'>
                <div className='col-md-6' >
                    <div style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                        <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value, courseType: this.props.courseType._id })} />
                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                            {list.map((item, index) => <li key={index}>{item.lastname} {item.firstname}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="col-md-6">
                    {groups.map((item, index) =>
                    <div key={index} style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10}}>
                        <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none' }}>
                            <li>{index + 1}. {item.teacher.lastname} {item.teacher.firstname}</li>
                        </ul>
                    </div>)}
                </div>
                
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student, course: state.course });
const mapActionsToProps = { getPreStudentAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
