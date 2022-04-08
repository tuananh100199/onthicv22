import React from 'react';
import { connect } from 'react-redux';
import { getRevenuePage } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage,FormSelect, TableCell, renderTable } from 'view/component/AdminPage';
import { ajaxSelectCourseByCourseType } from 'modules/mdDaoTao/fwCourse/redux';
import { ajaxSelectCourseType, getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';

const backRoute = '/user/revenue';

class RevenuePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/revenue', () => {
            this.props.getCourseTypeAll(data => {
                const courseTypes = data.map(item => ({ id: item._id, text: item.title }));
                this.courseType.value(courseTypes[0]);
            });
            this.props.getRevenuePage( 1 , 20 , {}, data => {
                console.log(data);
            });
        });
    }

    onSearch = ({ pageNumber, pageSize, course = this.course.value() }, done) => {
        const courseTypeId = this.state.courseTypeId;
        const condition = course == '0' ? {courseTypeId} : { course, courseTypeId };
        this.props.getRevenuePage(pageNumber, pageSize, condition, () => {
            done && done();
        });
    }

    onChangeCourseType = (courseType) => {
        this.setState({ courseTypeId: courseType });
        this.course.value({ id: 0, text: 'Tất cả khóa học' });
        // this.onSearch({ courseType });
    }

    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.revenue && this.props.revenue.page ?
            this.props.revenue.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Học viên</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Khoá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Số tiền</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Hình thức thanh toán</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Người nhận</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian đóng</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.payer ? item.payer.lastname + ' ' + item.payer.firstname : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.course ? item.course.name : ''} />
                    <TableCell content={item.fee ? T.numberDisplay(item.fee) : ''} />
                    <TableCell content={item.type == 'offline' ? 'Thanh toán trực tiếp' : 'Thanh toán online'} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap' }} content={item.receiver ? item.receiver.lastname + ' ' + item.receiver.firstname : ''} />
                    <TableCell style={{ whiteSpace: 'nowrap' }} content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy hh:ss') : ''} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-money',
            title: 'Doanh thu học phí',
            breadcrumb: [<Link key={0} to={backRoute}>Dashboard</Link>, 'Doanh thu học phí'],
            content: <>
            <div className='tile'>
                <div className='row'>
                    <div className='col-auto'>
                        <label className='col-form-label'>Loại khóa học: </label>
                    </div>
                    <FormSelect ref={e => this.courseType = e} data={ajaxSelectCourseType} placeholder='Loại khóa học'
                        onChange={data => this.onChangeCourseType(data.id)} style={{ margin: 0, width: '200px' }} />
                    <div className='col-auto'>
                        <label className='col-form-label'>Khóa học: </label>
                    </div>
                    <FormSelect ref={e => this.course = e} data={ajaxSelectCourseByCourseType(this.state.courseTypeId, true)} placeholder='Khóa học'
                        onChange={data => this.onSearch(data.id)} style={{ margin: 0, width: '200px' }} />
                    </div>
                <div className='pt-3'>{table}</div>
            </div>
            <Pagination style={{ left: '320px'}} pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
            backRoute,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, revenue: state.accountant.revenue });
const mapActionsToProps = { getRevenuePage, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(RevenuePage);