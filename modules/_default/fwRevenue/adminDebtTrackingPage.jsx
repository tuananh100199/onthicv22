import React from 'react';
import { connect } from 'react-redux';
import { getDebtStudentPage } from 'modules/mdDaoTao/fwStudent/redux';
import { AdminPage,FormSelect, renderTable, TableCell } from 'view/component/AdminPage';
import { ajaxSelectCourseByCourseType } from 'modules/mdDaoTao/fwCourse/redux';
import { ajaxSelectCourseType, getCourseTypeAll } from 'modules/mdDaoTao/fwCourseType/redux';
import Pagination from 'view/component/Pagination';
class DebtTrackingPage extends AdminPage {
    state = { isSearching: false, searchText: '' };
    componentDidMount() {
        T.ready('/user/revenue',() => {
            T.onSearch = (searchText) => this.onSearch({ searchText });
        });
        this.props.getDebtStudentPage(1,50,{});
        this.props.getCourseTypeAll(data => {
            const courseTypes = data.map(item => ({ id: item._id, text: item.title }));
            this.courseType.value(courseTypes[0]);
        });
    }

    onSearch = ({ pageNumber, pageSize, course = this.course.value() }, done) => {
        const courseTypeId = this.state.courseTypeId;
        const condition = course == '0' ? {courseTypeId} : { course, courseTypeId };
        this.props.getDebtStudentPage(pageNumber, pageSize, condition, () => {
            done && done();
        });
    }

    onChangeCourseType = (courseType) => {
        this.setState({ courseTypeId: courseType });
        this.course.value({ id: 0, text: 'Tất cả khóa học' });
        // this.onSearch({ courseType });
    }


    renderLichSuDongTien = (lichSuDongTien, type) => {
        let text = '';
        if (lichSuDongTien.length) {
            lichSuDongTien.forEach((item, index) => {
                let i = index + 1;
                if (type == 'fee') text = text + 'Lần ' + i + ': ' + item.fee + '\n';
                else if (type == 'isOnline') text = text + 'Lần ' + i + ': ' + (item.isOnlinePayment ? 'Thanh toán online' : 'Thanh toán trực tiếp') + '\n';
                else if (type == 'sum') text = parseInt(text + item.fee);
            });
            return type == 'sum' ? <>{ T.numberDisplay(text)}</> : <pre>{text}</pre>;
        } else return text;
    }

    chechHocPhiConLai = (item) => {
        const lichSuDongTien = item && item.lichSuDongTien;
        let fee = item && item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : 0;
        let soTienDaDong = 0;
        lichSuDongTien && lichSuDongTien.length ? lichSuDongTien.forEach(item => {
            soTienDaDong = parseInt(soTienDaDong + item.fee);
        }) : 0;
        return fee - soTienDaDong;
    }

    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.student && this.props.student.page ?
            this.props.student.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };

        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Họ và tên</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Khóa học</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Loại gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền gói</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Giảm giá</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền phải đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số lần thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Hình thức thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thông tin đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền đã đóng</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền còn nợ</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thời hạn đóng</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell content={<>{`${item.lastname} ${item.firstname}`}<br />{item.identityCard}</>} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell content={item.course && item.course.name} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={item.courseFee ? item.courseFee.name : ''} />
                    <TableCell type='number' content={item.courseFee ? item.courseFee.fee : ''} />
                    <TableCell type='number' content={item.discount ? item.discount.fee : ''} />
                    <TableCell type='number' content={item.courseFee ? item.courseFee.fee - (item.discount ? item.discount.fee : 0) : ''} />
                    <TableCell type='number' content={item.coursePayment ? item.coursePayment.numOfPayments : ''} />
                    <TableCell type='text' content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'fee') : ''} />
                    <TableCell type='number' content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'isOnline') : ''} />
                    <TableCell type='number' content={''} />
                    <TableCell type='number' content={item.lichSuDongTien ? this.renderLichSuDongTien(item.lichSuDongTien, 'sum') : ''} />
                    <TableCell type='number' content={this.chechHocPhiConLai(item) ? T.numberDisplay(this.chechHocPhiConLai(item)) : ''} />
                    <TableCell type='number' content={item.ngayHetHanNopHocPhi ? T.dateToText(item.ngayHetHanNopHocPhi, 'dd/mm/yyyy') : ''} />
                </tr>)
        });
        return this.renderPage({
            icon: 'fa fa-users', // select icon
            title: 'Theo dõi công nợ',
            breadcrumb: ['Theo dõi công nợ'],
            content: <>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='row pb-3'>
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
                        
                        {table}
                    </div>
                </div>
                <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, student: state.trainning.student });
const mapActionsToProps = { getDebtStudentPage, getCourseTypeAll };
export default connect(mapStateToProps, mapActionsToProps)(DebtTrackingPage);
