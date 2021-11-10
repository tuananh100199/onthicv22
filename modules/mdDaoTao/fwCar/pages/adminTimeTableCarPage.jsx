import React from 'react';
import { connect } from 'react-redux';
import { AdminPage, FormCheckbox } from 'view/component/AdminPage';
import { getAllCars, getCar } from '../redux';
import LecturerCarView from './lecturerCarView';
import 'modules/mdDaoTao/fwTimeTable/timeTable.scss';


export class AdminTimeTableCarPage extends AdminPage {
    state = { searchText: '', isSearching: false };

    componentDidMount() {
        T.ready('/user/car', () => T.showSearchBox());
        // const permission = this.getUserPermission('car'),
        //     user = this.props.system && this.props.system.user;
        // permission.delete ? this.props.getCarPage(1, 50, undefined) : this.props.getCarPage(1, 50, { user: user._id });
        T.onSearch = (searchText) => this.props.getCarPage(undefined, undefined, searchText ? { searchText } : {}, () => {
            this.setState({ searchText, isSearching: searchText != '' });
        });

        this.props.getAllCars({}, listCar => {
            console.log('listCar', listCar);
            this.setState({ currentLecturer: listCar[0].user, currentCar: listCar[0], listCar, filterOn: false, key: listCar[0], list: true, calendar: false});
        });
    }

    onChange = (value) => {
        this.setState({ filterOn: value , key: !this.state.key});
        this.forceUpdate();
    }

    selectCar = (car) => {
        this.setState({ currentLecturer: car.user, currentCar: car, key: !this.state.key});
    }
    render() {
        const { currentLecturer, currentCar, listCar, filterOn, key, calendar, list } = this.state;
        const inboxTimeTable = listCar && listCar.length && listCar.map((car, index) => {
            const isSelectedCar = currentCar && currentCar._id ==  car._id;
            return (
                <div key={index} className={'lecturer_list' + (isSelectedCar ? ' active_lecturer' : '')} style={{ cursor: 'pointer' }} onClick={e => e.preventDefault() || this.selectCar(car)}>
                    <div className='lecturer'>
                        <div className='lecturer_info'>
                            <h6>{car.licensePlates}</h6>
                        </div>
                    </div>
                </div>);
        });

        return this.renderPage({
            icon: 'fa fa-calendar',
            title: 'Lịch xe',
            breadcrumb: ['Lịch xe'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='box_time_table row' >
                            <div className='box_people col-sm-3'>
                                <div className='headind_srch'>
                                    <div className='recent_heading'>
                                        <h4>Danh sách xe</h4>
                                    </div>
                                </div>
                                <div>
                                    {inboxTimeTable}
                                </div>
                            </div>
                            <div className='col-sm-9' >
                                <div className='recent_heading pb-3' style={{ marginBottom: '25px'}}>
                                    <h4 style={{float: 'left'}}>{currentCar && currentCar.licensePlates}</h4>
                                    <div style={{float: 'right', display: 'flex'}}>
                                        {list ? <FormCheckbox ref={e => this.course = e} style={{paddingRight: '12px'}} onChange={value => this.onChange(value)} label='Hiển thị ngày hiện tại' /> : null}
                                        <button style={{border: 'none', outline: 'none', marginRight: '3px', backgroundColor: list ? '#2189CF' : ''}} onClick={() => this.setState({key: !key, calendar: false, list: true})}><i className='fa fa-bars'></i> Danh sách</button>
                                        <button style={{border: 'none', outline: 'none', backgroundColor: calendar ? '#2189CF' : ''}} onClick={() =>this.setState({key: !key, calendar: true, list: false, filterOn: false})}><i className='fa fa-calendar'></i> Lịch</button>
                                    </div>
                                </div>
                                {currentCar ? <LecturerCarView key={key} official={true} car={currentCar} filterOn={filterOn} list={list} calendar={calendar} lecturerName={currentLecturer ? currentLecturer.lastname + ' ' + currentLecturer.firstname : ''} /> : null}
                            </div>
                        </div>
                    </div>
                </div>),
            backRoute: '/user/car',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getAllCars,getCar };
export default connect(mapStateToProps, mapActionsToProps)(AdminTimeTableCarPage);