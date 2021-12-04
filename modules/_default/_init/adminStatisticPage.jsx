import React from 'react';
import { connect } from 'react-redux';
import { getStatistic, getStatisticStudent,updateStatisticCar,updateStatisticTeacher } from './redux';
import { AdminPage, FormTextBox } from 'view/component/AdminPage';

class StatisticPage extends AdminPage {
    state = { isSearching: false, dateStart: '', dateEnd: '' };
    componentDidMount() {
        this.props.getStatistic(data => {
            const { numberOfUser = 0, numberOfNews = 0, numberOfCourse = 0, numberOfCar = 0, numberOfRepairCar = 0, numberOfPracticeCar = 0,numberOfLecturer = 0, numberOfCourseCar = 0 } = data || {};
            this.numberOfUser.value(numberOfUser);
            this.numberOfNews.value(numberOfNews);
            this.numberOfCourse.value(numberOfCourse);
            this.numberOfCar.value(numberOfCar);
            this.numberOfCourseCar.value(numberOfCourseCar);
            this.numberOfRepairCar.value(numberOfRepairCar);
            this.numberOfPracticeCar.value(numberOfPracticeCar);
            this.numberOfLecturer.value(numberOfLecturer);
        });
        T.ready();
    }

    handleFilterByTime = () => {
        const dateStart = this.dateStart ? this.dateStart.value() : '';
        const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getStatisticStudent( dateStart, dateEnd , (data) => {
                console.log(data);
                this.setState({ isSearching: false, dateStart, dateEnd, dataStudent: data && data.item });
            });
        }
    }

    updateStatistic = () => {
        this.props.getStatistic(data => {
            const { numberOfUser = 0, numberOfNews = 0, numberOfCourse = 0, numberOfCar = 0, numberOfRepairCar = 0, numberOfPracticeCar = 0,numberOfLecturer = 0, numberOfCourseCar = 0 } = data || {};
            this.numberOfUser.value(numberOfUser);
            this.numberOfNews.value(numberOfNews);
            this.numberOfCourse.value(numberOfCourse);
            this.numberOfCar.value(numberOfCar);
            this.numberOfCourseCar.value(numberOfCourseCar);
            this.numberOfRepairCar.value(numberOfRepairCar);
            this.numberOfPracticeCar.value(numberOfPracticeCar);
            this.numberOfLecturer.value(numberOfLecturer);
            T.notify('Cập nhật dữ liệu thống kê thành công!', 'success');
        });
    }

    render() {
        // eslint-disable-next-line no-unused-vars
        const year = new Date().getFullYear();
        const {  carData, teacherData  } = this.props.system || {};
        let data = {};
        if (carData && carData.car) {
            const item = carData.car.split(';');
            item.sort((a,b) => parseInt(a.split(':')[0]) -  parseInt(b.split(':')[0]));
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
        }
        const ctxl = $('#lineChartCar') && $('#lineChartCar').get(0) && $('#lineChartCar').get(0).getContext('2d');
        const lineChart = ctxl && new Chart(ctxl, {
            type: 'line',
            data: data,
        });

        let teacher = {};
        if (teacherData && teacherData.teacher) {
            const item = teacherData.teacher.split(';');
            item.sort((a,b) => parseInt(a.split(':')[0]) -  parseInt(b.split(':')[0]));
            const labels = [], dataTotal = [], dataNewTeacher = [];
            item.forEach(year => {
                if (year != '') {
                    const newItem = year.split(':');
                    labels.push(newItem[0]);
                    dataTotal.push(parseInt(newItem[2]));
                    dataNewTeacher.push(parseInt(newItem[4]));
                }
            });
            teacher = {
                labels: labels,
                datasets: [
                    {
                        label: 'Tổng số giáo viên',
                        backgroundColor: 'rgba(220,220,220,0.2)',
                        borderColor: 'rgba(220,220,220,1)',
                        pointBackgroundColor: 'rgba(220,220,220,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(220,220,220,1)',
                        data: dataTotal
                    },
                    {
                        label: 'Giáo viên mới',
                        backgroundColor: 'rgba(151,187,205,0.2)',
                        borderColor: 'rgba(151,187,205,1)',
                        pointBackgroundColor: 'rgba(151,187,205,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(151,187,205,1)',
                        data: dataNewTeacher
                    },
                ]
            };
        }
        const ctxlTeacher = $('#lineChartTeacher') && $('#lineChartTeacher').get(0) && $('#lineChartTeacher').get(0).getContext('2d');
        const lineChartTeacher = ctxlTeacher && new Chart(ctxlTeacher, {
            type: 'line',
            data: teacher,
        });

        console.log(lineChart);
        console.log(lineChartTeacher);

        //todayViews = 0, allViews = 0
        //  const permission = this.getUserPermission('system', ['settings']);
        return this.renderPage({
            icon: 'fa fa-bar-chart',
            title: 'Thống kê: ',
            breadcrumb: ['Thống kê'],
            content: (
                <div className='row'>
                    {/* <DashboardIcon  iconBackgroundColor='orange'  icon='fa-users' title='Nguời dùng' value={numberOfUser} link='/user/member' readOnly={permission.settings} />
                    <DashboardIcon iconBackgroundColor='#17a2b8'  icon='fa-file' title='Tin tức' value={numberOfNews} link='/user/news' readOnly={permission.settings} />
                    <DashboardIcon iconBackgroundColor='#1488db'  icon='fa-book' title='Khóa học' value={numberOfCourse} link='/user/course' readOnly={permission.settings} /> */}
                    <div className='col-md-6'>
                        <div className='tile'>
                            <div className='tile-title d-flex justify-content-between'>
                                <h3>Thống kê giáo viên hàng năm</h3>
                                <button className='btn btn-success' onClick={() => this.props.updateStatisticTeacher()}>Cập nhật</button>
                            </div>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartTeacher'></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <div className='col-md-6'>
                        <div className='tile'>
                            <div className='tile-title d-flex justify-content-between'>
                                <h3>Thống kê xe hàng năm</h3>
                                <button className='btn btn-success' onClick={() => this.props.updateStatisticCar()}>Cập nhật</button>
                            </div>
                            <div className='embed-responsive embed-responsive-16by9'>
                                <canvas className='embed-responsive-item' id='lineChartCar'></canvas>
                            </div>
                        </div>
                    </div>

                    <div className='col-md-6'>
                        <div className='tile'>
                            <div className='tile-title d-flex justify-content-between'>
                                <h3>Dữ liệu thống kê</h3>
                                <button className='btn btn-success' onClick={() => this.updateStatistic()}>Cập nhật</button>
                            </div>
                            <div className='row'>
                                <FormTextBox className='col-md-6' ref={e => this.numberOfUser = e} label='Số lượng người dùng' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfCourse = e} label='Số lượng khóa học' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfNews = e} label='Số lượng tin tức' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfLecturer = e} label='Số lượng giáo viên' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfCar = e} label='Số lượng xe' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfCourseCar = e} label='Số lượng xe đi khóa' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfRepairCar = e} label='Số lượng xe sửa chữa' readOnly={true} /> 
                                <FormTextBox className='col-md-6' ref={e => this.numberOfPracticeCar = e} label='Số lượng xe tập lái' readOnly={true} /> 
                            </div>
                        
                        </div>
                    </div>

                    {/* <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thống kê học viên theo tháng</h3>
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
                                <canvas className='embed-responsive-item' id='lineChartStudent'></canvas>
                            </div>
                        </div>
                    </div> */}
                </div>),
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getStatistic, getStatisticStudent,updateStatisticCar, updateStatisticTeacher };
export default connect(mapStateToProps, mapActionsToProps)(StatisticPage);
