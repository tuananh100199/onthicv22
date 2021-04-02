import React from 'react';
import { connect } from 'react-redux';
import { getPreStudentAll } from '../../fwStudent/redux';
class AdminStudentView extends React.Component {
    state = {};
    componentDidMount() {
        this.props.getPreStudentAll();
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getPreStudentAll(searchText);
    }

    search = (e) => e.preventDefault() || T.onSearch && T.onSearch(this.searchBox.value);

    render() {
        const list = this.props.student && this.props.student.list ? this.props.student.list : [];
        return (
            <div className='col-md-6 tile'>
                <ul style={{ width: '100%', paddingLeft: 20, margin: 0, listStyle: 'none'}}>
                    <form style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6, marginBottom: 10 }} onSubmit={e => this.search(e)}>
                        <input ref={e => this.searchBox = e} className='app-search__input' id='searchTextBox' type='search' placeholder='Tìm kiếm học viên' />
                        <a href='#' style={{ position: 'absolute', top: 6, right: 9 }} onClick={e => this.search(e)}><i className='fa fa-search' /></a>
                    </form>
                    {list.map((item, index) => (
                        <div key={index}>
                            <li>{index + 1}. {item.lastname} {item.firstname}</li>
                        </div>
                    ))}
                </ul>
            </div>);
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.student });
const mapActionsToProps = { getPreStudentAll };
export default connect(mapStateToProps, mapActionsToProps)(AdminStudentView);
