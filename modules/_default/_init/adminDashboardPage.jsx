import React from 'react';
import { connect } from 'react-redux';
import { getStatistic, getStatisticStudent } from './redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { AdminPage, FormDatePicker } from 'view/component/AdminPage';


class DashboardIcon extends React.Component {
    componentDidMount() {
        setTimeout(() => {
            const endValue = this.props.value ? parseInt(this.props.value) : 0;
            new CountUp(this.valueElement, 0, endValue, 0, 2, { separator: '.', decimal: ',' }).start();
        }, 100);
    }

    render() {
        const content = (
            <div className={'widget-small coloured-icon ' + this.props.type}>
                <i className={'icon fa fa-3x ' + this.props.icon} />
                <div className='info'>
                    <h4>{this.props.title}</h4>
                    {this.props.value && <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />}
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardPage extends AdminPage {
    state = { isSearching: false, dateStart: '', dateEnd: '' };
    componentDidMount() {
        this.props.getStatistic();
        T.ready();
    }

    handleFilterByTime = () => {
        const dateStart = this.dateStart ? this.dateStart.value() : '';
        const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getStatisticStudent( dateStart, dateEnd , (data) => {
                this.setState({ isSearching: false, dateStart, dateEnd, dataStudent: data && data.list });
            });
        }
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const year = new Date().getFullYear();
        const { numberOfUser = 0, numberOfNews = 0, numberOfCourse = 0, numberOfCar = 0, numberOfRepairCar = 0, numberOfPracticeCar = 0,numberOfLecturer = 0, carData } = this.props.system || {};
        const {dataStudent, dateStart, dateEnd} = this.state;
        let data = {}, dataChartStudent = {};
        if (carData && carData.car) {
            const item = carData.car.split(';');
            const labels = [], dataTotal = [], dataNewCar = [], dataRemoveCar = [];
            item.forEach(year => {
                if (year != '') {
                    const newItem = year.split(':');
                    labels.push(newItem[0]);
                    dataTotal.push(parseInt(newItem[2]));
                    dataNewCar.push(parseInt(newItem[4]));
                    dataRemoveCar.push(parseInt(newItem[6]));
                }
            });
            data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Tổng số xe',
                        backgroundColor: 'rgba(220,220,220,0.2)',
                        borderColor: 'rgba(220,220,220,1)',
                        pointBackgroundColor: 'rgba(220,220,220,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        data: dataTotal
                    },
                    {
                        label: 'Xe đăng ký mới',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: dataNewCar
                    },
                    {
                        label: 'Xe thanh lý',
                        backgroundColor: 'rgba(39, 143, 0,0.2)',
                        borderColor: 'rgba(39, 143, 0,1)',
                        pointBackgroundColor: 'rgba(39, 143, 0,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(39, 143, 0,1)',
                        data: dataRemoveCar
                    }
                ]
            };
        } else {
            data = {
                labels: [year - 4, year - 3, year - 2, year - 1, year],
                datasets: [
                    {
                        label: 'Tổng số xe',
                        backgroundColor: 'rgba(220,220,220,0.2)',
                        borderColor: 'rgba(220,220,220,1)',
                        pointBackgroundColor: 'rgba(220,220,220,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        data: [65, 79, 80, 81, 56]
                    },
                    {
                        label: 'Xe đăng ký mới',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: [28, 48, 40, 19, 15]
                    },
                    {
                        label: 'Xe thanh lý',
                        backgroundColor: 'rgba(39, 143, 0,0.2)',
                        borderColor: 'rgba(39, 143, 0,1)',
                        pointBackgroundColor: 'rgba(39, 143, 0,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(39, 143, 0,1)',
                        data: [12, 15, 15, 14, 17]
                    }
                ]
            };
        }

        if (dataStudent && dataStudent.length && dateStart && dateEnd) {
            const monthStart = dateStart.getMonth() + 1,
            monthEnd = dateEnd.getMonth() + 1;
            const labels = [],dataTotal = [];
            for(let i = monthStart; i<= monthEnd; i++){
                labels.push(i);
                const listStudent = dataStudent.filter(student => (new Date(student.createdDate).getMonth() + 1)  == i);
                dataTotal.push(listStudent.length);
            }
            dataChartStudent = {
                labels: labels,
                datasets: [
                    {
                        label: 'Tổng số học sinh',
                        backgroundColor: 'rgba(220,220,220,0.2)',
                        borderColor: 'rgba(220,220,220,1)',
                        pointBackgroundColor: 'rgba(220,220,220,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        data: dataTotal
                    },
                ]
            };
        }



        const ctxl = $('#lineChartCar') && $('#lineChartCar').get(0) && $('#lineChartCar').get(0).getContext('2d');
        const lineChart = ctxl && new Chart(ctxl, {
            type: 'line',
            data: data,
        });

        const ctxlStudent = $('#lineChartStudent') && $('#lineChartStudent').get(0) && $('#lineChartStudent').get(0).getContext('2d');
        const lineChartStudent = ctxlStudent && new Chart(ctxlStudent, {
            type: 'line',
            data: dataChartStudent,
        });
        console.log(lineChart);
        console.log(lineChartStudent);

        //todayViews = 0, allViews = 0
        const permission = this.getUserPermission('system', ['settings']);
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Dashboard: ',
            breadcrumb: ['Dashboard'],
            content: (
                <div className='row'>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-users' title='Nguời dùng' value={numberOfUser} link='/user/member' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='info' icon='fa-file' title='Tin tức' value={numberOfNews} link='/user/news' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-book' title='Khóa học' value={numberOfCourse} link='/user/course' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê xe hàng năm</h3>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartCar'></canvas>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê học viên theo tháng</h3>
                            <div className='tile-body row'>
                                <FormDatePicker ref={e => this.dateStart = e} label='Thời gian bắt đầu' className='col-md-5' />
                                <FormDatePicker ref={e => this.dateEnd = e} label='Thời gian kết thúc' className='col-md-5' />
                                <div className='m-auto col-md-2'>
                                    <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByTime}>
                                        <i className='fa fa-filter' /> Lọc
                                    </button>
                                </div>
                            </div>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartStudent'></canvas>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-car' title='Xe' value={numberOfCar} link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-wrench' title='Xe đang sửa chữa' value={numberOfRepairCar} link='/user/car/repair' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-road' title='Xe đã đăng ký tập lái' value={numberOfPracticeCar} link='/user/car/practice' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-briefcase' title='Xe đang đi khóa' value={1} link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-user-secret' title='Giáo viên' value={numberOfLecturer} link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-user-secret' title='Giáo viên đi khóa' value={numberOfLecturer} link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-calendar' title='Lịch dạy' link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-star' title='Đánh giá giáo viên' link='/user/car' readOnly={permission.settings} />
                    </div>
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStatistic, getStatisticStudent };
export default connect(mapStateToProps, mapActionsToProps)(DashboardPage);
