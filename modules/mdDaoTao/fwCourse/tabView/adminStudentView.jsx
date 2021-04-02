import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll } from '../redux';
class AdminStudentView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getPreStudentAll();
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getPreStudentAll(searchText);
    }

    render() {
        const list = this.props.course && this.props.course.list ? this.props.course.list : [];

        return (
            <div>
                <ul style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                {list.map((item, index) => (
                    <div key={index}>
                        <li>{index + 1} {item.lastname} {item.firstname}</li>
                    </div>
                ))}
                </ul>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.course });
const mapActionsToProps = { getPreStudentAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
