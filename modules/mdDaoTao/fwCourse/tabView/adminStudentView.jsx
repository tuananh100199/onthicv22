import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll } from 'modules/mdDaoTao/fwStudent/redux';
import { FormTextBox } from 'view/component/AdminPage';

//TODO: Tuấn Anh lấy courseType từ course hiện tại để truyền vào this.props.getPreStudentAll
class AdminStudentView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getPreStudentAll({});
        T.ready();
    }

    render() {
        const list = this.props.student && this.props.student.list ? this.props.student.list : [];
        return (
            <div className='col-md-6' style={{ borderWidth: 1, borderStyle: 'solid', borderColor: '#ddd', borderRadius: 5, padding: 12 }}>
                <FormTextBox ref={e => this.searchBox = e} label='Tìm kiếm học viên' onChange={e => this.props.getPreStudentAll({ searchText: e.target.value })} />
                <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'decimal' }}>
                    {list.map((item, index) => <li key={index}>{item.lastname} {item.firstname}</li>)}
                </ul>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student });
const mapActionsToProps = { getPreStudentAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
