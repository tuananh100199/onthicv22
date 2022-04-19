import React from 'react';
import { connect } from 'react-redux';
import { getRatePageByAdmin } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell } from 'view/component/AdminPage';

const ratingDropDown = [
    {id:1,text:'1'},
    {id:2,text:'2'},
    {id:3,text:'3'},
    {id:4,text:'4'},
    {id:5,text:'5'},
];
class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/manage-lecturer', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            const params = T.routeMatcher('/user/manage-lecturer/:_id/rating').parse(window.location.pathname),
                lecturerId = params._id;
            this.props.getRatePageByAdmin(1, 50, { _refId: lecturerId });
            this.setState({ lecturerId });
        });
    }

    
    onSearch = ({ pageNumber, pageSize, searchText, userType }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        this.setState({ isSearching: true }, () => this.props.getRatePageByAdmin(pageNumber, pageSize, { searchText, _refId: this.state.lecturerId }, (page) => {
            this.setState({ searchText, userType, isSearching: false });
            done && done(page);
        }));
    }

    renderRating = (value)=>{
        const valueToStyle = {
            1:'text-danger',
            2:'text-warning',
            3:'text-primary',
            4:'text-info',
            5:'text-success',
        };
        return <span className={`text ${valueToStyle[value]}`}>{value}</span>;
    }

    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list, lecturer } = this.props.rate && this.props.rate.page ?
            this.props.rate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,autoDisplay:true,
            renderHead: () => (
                // <tr>
                //     <th style={{ width: 'auto' }}>#</th>
                //     <th style={{ width: 'auto' }} nowrap='true'>Học viên đánh giá</th>
                //     <th style={{ width: 'auto' }} nowrap='true'>Số sao</th>
                //     <th style={{ width: '80%' }}>Nội dung đánh giá</th>
                //     <th style={{ width: '20%' }}>Ngày đánh giá</th>
                // </tr>
                <TableHead getPage={this.props.getRatePageByAdmin}>
                    <TableHeadCell style={{ width: 'auto' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto' }} nowrap='true'>Học viên đánh giá</TableHeadCell>
                    <TableHeadCell name='value' filter='select' filterData={ratingDropDown} sort={true} style={{ width: 'auto' }} nowrap='true'>Số sao</TableHeadCell>
                    <TableHeadCell style={{ width: '80%' }}>Nội dung đánh giá</TableHeadCell>
                    <TableHeadCell name='createdDate' sort={true} style={{ width: '20%' }}>Ngày đánh giá</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user && item.user.lastname} ${item.user && item.user.firstname}`} />
                    <TableCell type='number' content={this.renderRating(item.value)} />
                    <TableCell type='text' content={item.note || ''} />
                    <TableCell type='date' content={new Date(item.createdDate).getShortText()} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-star',
            title: `Đánh giá giáo viên: ${lecturer ? (lecturer.lastname + ' ' + lecturer.firstname):'...'}`,
            breadcrumb: [<Link key={0} to='/user/rating-teacher'>Giáo viên</Link>, 'Đánh giá giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} style={{ left: 320 }}
                        getPage={this.props.getRatePageByAdmin} />
                </div>
            ),
            backRoute: '/user/rating-teacher',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate });
const mapActionsToProps = { getRatePageByAdmin };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
