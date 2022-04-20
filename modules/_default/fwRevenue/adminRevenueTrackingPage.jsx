import React from 'react';
import { connect } from 'react-redux';
import { getRevenueByMonth, getStatisticRevenue, getRevenueByDate } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage,FormSelect, FormDatePicker, TableCell, renderTable } from 'view/component/AdminPage';

const backRoute = '/user/revenue';

const dataThongKe = [
    {   id: 0, text: 'Thống kê theo năm'    },
    {   id: 1, text: 'Thống kê theo tháng'  },
    {   id: 2, text: 'Thống kê theo ngày'   },
];

class RevenuePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/revenue', () => {
            this.type.value(0);
            this.props.getStatisticRevenue(data => {
                const list = [];
                const item = data && data.item && data.item.revenue.split(';');
                item.forEach(year => {
                    if (year != '') {
                        let obj = {};
                        const newItem = year.split(':');
                        obj[newItem[0]] = newItem[2];
                        list.push(obj);
             }
        });
                this.setState({revenueData: list});
            });
        });
    }

    onChangeType = (type) => {
        this.setState({ typeId: type });
        if(type == 0) this.handleFilter();
    }

    handleFilter = () => {
        const dateStart = this.dateStart ? this.dateStart.value() : '';
        const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            if(this.type){
                if(this.type.value() == 0) {
                    this.props.getStatisticRevenue(data => {
                        const list = [];
                        const item = data && data.item && data.item.revenue.split(';');
                        item.forEach(year => {
                            if (year != '') {
                                let obj = {};
                                const newItem = year.split(':');
                                obj[newItem[0]] = newItem[2];
                                list.push(obj);
                     }
                });
                        this.setState({revenueData: list});
                    });
                } else if(this.type.value() == 1) {
                    this.props.getRevenueByMonth(dateStart, dateEnd, data => {
                        this.setState({ isSearching: false, dateStart, dateEnd, revenueData: data && data.item });
                    });
                } else if(this.type.value() == 2) {
                    this.props.getRevenueByDate(dateStart, dateEnd, data => {
                        const list = [];
                        const item = data && data.item;
                        item.forEach(day => {
                            let obj = {};
                            const date = Object.keys(day) && Object.keys(day)[0].split('/');
                            const key = (parseInt(date[0]) + '/' + (parseInt(date[1]) + 1) + '/' + parseInt(date[2]));
                            obj[key] = Object.values(day) && Object.values(day)[0];
                            list.push(obj);
                        });
                        this.setState({ isSearching: false, dateStart, dateEnd, revenueData: list });
                    });
                }
            }
        }
    }

    render() {
        const list = this.state.revenueData ? this.state.revenueData : [];
        let total =  0;
        list && list.length ? list.forEach(item => total = total + parseInt(Object.values(item)[0])) : 0;
            const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto%', textAlign: 'center' }} nowrap='true'>Thời gian lọc</th>
                    <th style={{ width: '100%', textAlign: 'center' }}>Số tiền</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='text' content={item ? Object.keys(item)[0] : ''} />
                    <TableCell type='text' style={{textAlign: 'right'}} content={item ? Object.values(item)? T.numberDisplay(Object.values(item)[0]) + ' đồng': ''  : ''} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Thống kê doanh thu',
            breadcrumb: [<Link key={0} to={backRoute}>Dashboard</Link>, 'Thống kê doanh thu'],
            content: <>
            <div className='tile'>
                <div className='row'>
                    <div className='col-auto'>
                        <label className='col-form-label'>Loại thống kê: </label>
                    </div>
                    <FormSelect ref={e => this.type = e} data={dataThongKe} placeholder='Loại thống kê'
                        onChange={data => this.onChangeType(data.id)} style={{ margin: 0, width: '200px' }} />
                    </div>
                    <h3 className='tile-title pt-3'>{dataThongKe[this.type ? this.type.value() : 0].text}</h3>
                        {(this.type && this.type.value() != 0) ? (
                        <div className='tile-body row'>
                            <FormDatePicker ref={e => this.dateStart = e} label={'Thời gian bắt đầu ' + (this.type.value() == 1 ? '(mm/yyyy)' : '(dd/mm/yyyy)')} className='col-md-5' type={this.type.value() == 1 ? 'month-mask' : 'date-mask'} />
                            <FormDatePicker ref={e => this.dateEnd = e} label={'Thời gian kết thúc ' + (this.type.value() == 1 ? '(mm/yyyy)' : '(dd/mm/yyyy)')} className='col-md-5' type={this.type.value() == 1 ? 'month-mask' : 'date-mask'} />
                            <div className='m-auto col-md-2'>
                                <button className='btn btn-success' style={{ marginTop: '11px' }} type='button' onClick={this.handleFilter}>
                                    <i className='fa fa-filter' /> Lọc
                                </button>
                            </div>
                        </div>) : null}
                <div className='pt-3'>Tổng số tiền: {T.numberDisplay(total) + ' đồng'}</div>
                <div className='pt-3'>{table}</div>
                
            </div>
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, revenue: state.accountant.revenue });
const mapActionsToProps = { getRevenueByMonth, getStatisticRevenue, getRevenueByDate };
export default connect(mapStateToProps, mapActionsToProps)(RevenuePage);