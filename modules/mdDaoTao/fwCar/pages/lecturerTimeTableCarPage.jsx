import React from 'react';
import { connect } from 'react-redux';
import { getCarOfLecturer } from '../redux';
import LecturerCarView from './lecturerCarView';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';

export class LecturerTimeTablePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/car', () => {
           const  user = this.props.system && this.props.system.user;
           this.props.getCarOfLecturer({ user: user._id}, car => {
               if (car) {
                    this.setState({car: car, filterOn: false, key: false, list: true, calendar: false});
               }
           });
        });
    }

    render() {
        const { car, user, key, calendar, list, filterOn } = this.state;
        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch xe: ',
            breadcrumb: ['Lịch xe'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='pb-3' style={{marginBottom: '25px'}}>
                            <div style={{float: 'right', display: 'flex'}}>
                                {list ? <FormCheckbox ref={e => this.course = e} style={{paddingRight: '12px'}} onChange={value => this.setState({ key: !key, filterOn: value })} label='Hiển thị ngày hiện tại' /> : null}
                                <button style={{border: 'none', outline: 'none', marginRight: '3px', backgroundColor: list ? '#2189CF' : ''}} onClick={() => this.setState({ key: !key, calendar: false, list: true })}><i className='fa fa-bars'></i> Danh sách</button>
                                <button style={{border: 'none', outline: 'none', backgroundColor: calendar ? '#2189CF' : ''}} onClick={() =>this.setState({ key: !key, calendar: true, list: false, filterOn: false})}><i className='fa fa-calendar'></i> Lịch</button>
                            </div>
                        </div>
                        <LecturerCarView key={key} official={true} car={car} filterOn={filterOn} calendar={calendar} list={list} lecturerName={user && user.lastname + ' ' + user.firstname}/>
                    </div>
                </div>),
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getCarOfLecturer };
export default connect(mapStateToProps, mapActionsToProps)(LecturerTimeTablePage);