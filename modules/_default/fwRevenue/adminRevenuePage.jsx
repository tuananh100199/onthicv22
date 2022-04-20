import React from 'react';
import { connect } from 'react-redux';
import { getStatistic, getStatisticStudent, updateStatisticTeacher } from 'modules/_default/_init/redux';
import { getRevenueByMonth, getStatisticRevenue, getRevenueByDate } from './redux';
import { AdminPage, FormDatePicker, PageIcon } from 'view/component/AdminPage';

class RevenuePage extends AdminPage {
    state = { isSearching: false, dateStart: '', dateEnd: '', dateStartDate: '', dateEndDate: '' };
    componentDidMount() {
        this.props.getStatistic();
        this.props.getStatisticRevenue(data => this.setState({revenueData: data && data.item}));
        T.ready();
    }

    handleFilterByTime = () => {
        const dateStart = this.dateStart ? this.dateStart.value() : '';
        const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getRevenueByMonth(dateStart, dateEnd, data => {
                this.setState({ isSearching: false, dateStart, dateEnd, dataRevenueByMonth: data && data.item });
            });
        }
    }

    handleFilterByDate = () => {
        const dateStart = this.dateStartDate ? this.dateStartDate.value() : '';
        const dateEnd = this.dateEndDate ? this.dateEndDate.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getRevenueByDate(dateStart, dateEnd, data => {
                this.setState({ isSearching: false, dateStartDate: dateStart, dateEndDate: dateEnd, dataRevenueByDate: data && data.item });
            });
        }
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const { dataRevenueByMonth, dateStart, dateEnd, dataRevenueByDate, dateStartDate, dateEndDate, revenueData } = this.state;
        let data = {}, dataChartByMonth = {}, dataChartByDate = {};
        if (revenueData && revenueData.revenue) {
            const item = revenueData.revenue.split(';');
            const labels = [], dataTotal = [];
            item.forEach(year => {
                if (year != '') {
                    const newItem = year.split(':');
                    labels.push(newItem[0]);
                    dataTotal.push(parseInt(newItem[2]));
                }
            });
            data = {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu hàng năm',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: dataTotal
                    },
                ]
            };
        }

        if (dataRevenueByMonth && dataRevenueByMonth.length && dateStart && dateEnd) {
            const labels = [], dataTotal = [];
            const yearStart = dateStart.getFullYear(),
                yearEnd = dateEnd.getFullYear();
                dataRevenueByMonth.forEach(month => {
                const date = Object.keys(month) && Object.keys(month)[0].split('/');
                labels.push(yearStart == yearEnd ? (parseInt(date[0]) + 1) : (parseInt(date[0]) + 1 + '/' + parseInt(date[1])));
                dataTotal.push(Object.values(month) && Object.values(month)[0]);
            });

            dataChartByMonth = {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu theo tháng',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: dataTotal
                    },
                ]
            };
        }

        if (dataRevenueByDate && dataRevenueByDate.length && dateStartDate && dateEndDate) {
            const labels = [], dataTotalDate = [];
            const yearStart = dateStartDate.getFullYear(),
                yearEnd = dateEndDate.getFullYear();
                dataRevenueByDate.forEach(day => {
                    const date = Object.keys(day) && Object.keys(day)[0].split('/');
                    console.log(date);
                    labels.push(yearStart == yearEnd ? (parseInt(date[0]) + '/' + (parseInt(date[1]) + 1)) : (parseInt(date[0]) + '/' + (parseInt(date[1]) + 1) + '/' + parseInt(date[2])));
                    dataTotalDate.push(Object.values(day) && Object.values(day)[0]);
                });

            dataChartByDate = {
                labels: labels,
                datasets: [
                    {
                        label: 'Doanh thu theo ngày',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: dataTotalDate
                    },
                ]
            };
        }



        const ctxl = $('lineChartRevenue') && $('#lineChartRevenue').get(0) && $('#lineChartRevenue').get(0).getContext('2d');
        const lineChart = ctxl && new Chart(ctxl, {
            type: 'line',
            data: data,
        });

        const ctxlDate = $('#lineChartByMonth') && $('#lineChartByMonth').get(0) && $('#lineChartByMonth').get(0).getContext('2d');
        const lineChartByMonth = ctxlDate && new Chart(ctxlDate, {
            type: 'line',
            data: dataChartByMonth,
        });
        const ctxlByDate = $('#lineChartByDay') && $('#lineChartByDay').get(0) && $('#lineChartByDay').get(0).getContext('2d');
        const lineChartByDay = ctxlByDate && new Chart(ctxlByDate, {
            type: 'line',
            data: dataChartByDate,
        });

        console.log(lineChart);
        console.log(lineChartByMonth);
        console.log(lineChartByDay);

        //todayViews = 0, allViews = 0
        return this.renderPage({
            icon: 'fa fa-dashboard',
            title: 'Dashboard: ',
            breadcrumb: ['Dashboard'],
            content: (
                <div className='row'>
                    <PageIcon to={'/user/revenue/info'} icon='fa-line-chart' iconBackgroundColor='#69f0ae' text='Tổng quan doanh thu' />
                    <PageIcon to={'/user/revenue/debt'} icon='fa-line-chart' iconBackgroundColor='teal' text='Tổng quan công nợ' />
                    <PageIcon to={'/user/revenue/tracking'} icon='fa-line-chart' iconBackgroundColor='#900' text='Thống kê doanh thu' />
                    
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê doanh thu hàng năm</h3>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartRevenue'></canvas>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'></div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê doanh thu theo tháng</h3>
                            <div className='tile-body row'>
                                <FormDatePicker ref={e => this.dateStart = e} label='Thời gian bắt đầu (mm/yyyy)' className='col-md-5' type='month-mask' />
                                <FormDatePicker ref={e => this.dateEnd = e} label='Thời gian kết thúc (mm/yyyy)' className='col-md-5' type='month-mask' />
                                <div className='m-auto col-md-2'>
                                    <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByTime}>
                                        <i className='fa fa-filter' /> Lọc
                                    </button>
                                </div>
                            </div>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartByMonth'></canvas>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê doanh thu theo ngày</h3>
                            <div className='tile-body row'>
                                <FormDatePicker ref={e => this.dateStartDate = e} label='Thời gian bắt đầu (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                                <FormDatePicker ref={e => this.dateEndDate = e} label='Thời gian kết thúc (dd/mm/yyyy)' className='col-md-5' type='date-mask' />
                                <div className='m-auto col-md-2'>
                                    <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilterByDate}>
                                        <i className='fa fa-filter' /> Lọc
                                    </button>
                                </div>
                            </div>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartByDay'></canvas>
                            </div>
                        </div>
                    </div>
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getRevenueByMonth, getStatisticRevenue, getRevenueByDate, getStatistic, getStatisticStudent, updateStatisticTeacher };
export default connect(mapStateToProps, mapActionsToProps)(RevenuePage);
