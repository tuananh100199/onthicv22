import React from 'react';
import { connect } from 'react-redux';
import { getDiscountCodePage, getDiscountCode , updateDiscountCode } from 'modules/_default/fwDiscountCode/redux';
import { AdminPage, TableCell, renderTable, CirclePageButton, FormCheckbox } from 'view/component/AdminPage';
import Pagination from 'view/component/Pagination';
import { getCourseByStudent } from 'modules/mdDaoTao/fwCourse/redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';

class  DiscountCodePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready();
        const route = T.routeMatcher('/user/hoc-vien/khoa-hoc/:_id/cong-no/giam-gia'),
            _id = route.parse(window.location.pathname)._id;
        const previousRoute = '/user/hoc-vien/khoa-hoc';
        if (_id) {
            T.ready('/user/hoc-vien/khoa-hoc/' + _id, () => {
                this.props.getCourseByStudent(_id, data => {
                    if (data.error) {
                        T.notify('Lấy khóa học bị lỗi!', 'danger');
                        this.props.history.push(previousRoute);
                    } else if (data.notify) {
                        T.alert(data.notify, 'error', false, 2000);
                        this.props.history.push(previousRoute);
                    } else if (data.item && data.student) {
                        this.props.getDiscountCodePage(1,50,{endDate: {$gte: new Date()}, user: data.student._id});
                        this.setState({ studentId:  data.student._id, courseId: data.item._id});
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
        
    }

    onChange = (value) => {
        if(value) this.props.getDiscountCodePage(1,50,{user: this.state.studentId});
        else this.props.getDiscountCodePage(1,50,{endDate: {$gte: new Date()}, user: this.state.studentId});
    }

    render() {
        const userPageLink = '/user/hoc-vien/khoa-hoc/' + this.state.courseId + '/cong-no';
        const permission = this.getUserPermission('discountCode'),
            { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.discountCode && this.props.discountCode.page ?
                this.props.discountCode.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] },
            table = renderTable({
                getDataSource: () => list,
                renderHead: () => (
                    <tr>
                        <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                        <th style={{ width: '100%' }}>Mã code</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền giảm (VNĐ)</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày hết hạn</th>
                        <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                    </tr>),
                renderRow: (item, index) => (
                    <tr key={index}>
                        <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                        <TableCell type='text' content={item.code} />
                        <TableCell type='number' content={item.fee} />
                        <TableCell type='number' content={item.endDate ? T.dateToText(item.endDate, 'dd/mm/yyyy') : ''} />
                        <TableCell type='buttons' content={item} style={{ textAlign: 'center' }}>
                        <CopyToClipboard text={item.code}
                            onCopy={() => T.notify('Đã copy', 'success')}>
                            <span><i className='fa fa-clone'></i></span>
                        </CopyToClipboard>
                    </TableCell>
                    </tr>),
            });
        return this.renderPage({
            icon: 'fa fa-sort-amount-desc',
            title: 'Mã giảm giá',
            breadcrumb: ['Mã giảm giá'],
            content: <>
                <div className='tile'>
                    <FormCheckbox ref={e => this.check = e} style={{ paddingRight: '12px' }} onChange={value => this.onChange(value)} label='Hiển thị code hết hạn' />
                    {/* <FormSelect ref={e => this.itemCourseType = e} className='col-md-4' label='Loại khóa học' data={ajaxSelectCourseType} readOnly={!permission.write} /> */}
                    {table}
                </div>
                {/* <DiscountCodeModal ref={e => this.modal = e} getDiscountCode={this.props.getDiscountCode} readOnly={!permission.write} create={this.props.createDiscountCode} update={this.props.updateDiscountCode} /> */}
                <Pagination name='pageDiscount' style={{left: '320px'}} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getDiscountCodePage} />
                {/* <NotificationModal readOnly={!permission.write} ref={e => this.notiModal = e} create={this.props.createNotification} getUserChatToken={this.props.getUserChatToken} data={this.state.data} /> */}
                {permission.write ? <CirclePageButton type='create' onClick={this.create} /> : null}
            </>,
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, discountCode: state.accountant.discountCode });
const mapActionsToProps = { getDiscountCodePage, getDiscountCode, updateDiscountCode, getCourseByStudent};
export default connect(mapStateToProps, mapActionsToProps)( DiscountCodePage);
