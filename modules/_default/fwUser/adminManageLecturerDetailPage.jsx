import React from 'react';
import { connect } from 'react-redux';
import { getRatePageByAdmin,createRate,updateRate,deleteRate } from 'modules/_default/fwRate/redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell,FormSelect,AdminModal,FormRichTextBox,FormTextBox } from 'view/component/AdminPage';
const ratingDropDown = [
    {id:1,text:'1'},
    {id:2,text:'2'},
    {id:3,text:'3'},
    {id:4,text:'4'},
    {id:5,text:'5'},
];

class RatingModal extends AdminModal {

    onShow = (item) => {
        const { _id, user, value, note } = item || { _id: null, value:'', note:'' };
        this.itemUser.value(user?`${user.lastname} ${user.firstname}`:'');
        this.itemValue.value(value);
        this.itemNote.value(note);
        this.setState({ _id });
    }

    onSubmit = () => {
        const data = {
            value: this.itemValue.value(),
            note: this.itemNote.value(),
        };
        if (data.value == '') {
            T.notify('Số sao bị trống!', 'danger');
            this.itemValue.focus();
        } else {
            this.state._id ? this.props.update(this.state._id, data, ()=>this.props.getPage(this.hide)) : this.props.create(data,()=> this.props.getPage(this.hide));
        }
    }
    render = () => this.renderModal({
        title: 'Đánh giá giáo viên',
        body: <>
            <FormTextBox ref={e => this.itemUser = e} label='Học viên' readOnly={true}/>
            <FormSelect ref={e => this.itemValue = e}  label='Số sao' data={ratingDropDown} readOnly={this.props.readOnly} />
            <FormRichTextBox rows={2} ref={e => this.itemNote = e}  label='Nội dung đánh giá' readOnly={this.props.readOnly}/>
        </>
    });
}
class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready('/user/manage-lecturer', () => {
            T.showSearchBox();
            T.onSearch = (searchText) => this.onSearch({ searchText });
            const params = T.routeMatcher('/user/manage-lecturer/:_id/rating').parse(window.location.pathname),
                lecturerId = params._id;
            this.props.getRatePageByAdmin(1, 50, { _refId: lecturerId },{},{});
            this.setState({ lecturerId });
        });
    }

    
    onSearch = (done) => {
        this.props.getRatePageByAdmin(null, null, { _refId: this.state.lecturerId },null,null, (page) => {
            done && done(page);
        });
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

    edit = (e, item) => e.preventDefault() || this.modal.show(item);


    delete = (e, item) => e.preventDefault() || T.confirm('Xóa đánh giá', 'Bạn có chắc bạn muốn xóa đánh giá này?', true, isConfirm =>
        isConfirm && this.props.deleteRate(item._id,this.onSearch));

    render() {
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list, lecturer } = this.props.rate && this.props.rate.page ?
            this.props.rate.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0, list: [] };
        const permission = this.getUserPermission('rate');
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
                    <TableHeadCell style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={`${item.user && item.user.lastname} ${item.user && item.user.firstname}`} />
                    <TableCell type='number' content={this.renderRating(item.value)} />
                    <TableCell type='text' content={item.note || ''} />
                    <TableCell type='date' content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={this.edit} onDelete={this.delete}></TableCell>
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
                <RatingModal ref={e => this.modal = e} readOnly={!permission.write} create={this.props.createRate} update={this.props.updateRate} getPage={this.onSearch} />
                </div>
            ),
            backRoute: '/user/rating-teacher',
        });
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate });
const mapActionsToProps = { getRatePageByAdmin,createRate,updateRate,deleteRate };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
