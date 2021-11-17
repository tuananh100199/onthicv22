import React from 'react';
import { connect } from 'react-redux';
import { getStatistic } from './redux';
import CountUp from 'view/js/countUp';
import { Link } from 'react-router-dom';
import { AdminPage } from 'view/component/AdminPage';


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
                    <p style={{ fontWeight: 'bold' }} ref={e => this.valueElement = e} />
                </div>
            </div>
        );
        return this.props.link ? <Link to={this.props.link} style={{ textDecoration: 'none' }}>{content}</Link> : content;
    }
}

class DashboardPage extends AdminPage {
    componentDidMount() {
        this.props.getStatistic();
        T.ready();
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const year = new Date().getFullYear();
        const { numberOfUser = 0, numberOfNews = 0, numberOfCourse = 0, numberOfCar = 0, carData } = this.props.system || {};
        let data = {};
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
            console.log(labels);
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


        const ctxl = $('#lineChartDemo') && $('#lineChartDemo').get(0) && $('#lineChartDemo').get(0).getContext('2d');
        const lineChart = ctxl && new Chart(ctxl, {
            type: 'line',
            data: data,
        });
        console.log(lineChart);

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
                    <div className='col-md-6 col-lg-3'>
                        <DashboardIcon type='primary' icon='fa-car' title='Xe' value={numberOfCar} link='/user/car' readOnly={permission.settings} />
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê xe hàng năm</h3>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartDemo'></canvas>
                            </div>
                        </div>
                    </div>
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStatistic };
export default connect(mapStateToProps, mapActionsToProps)(DashboardPage);
