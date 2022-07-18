import React from 'react';
import { connect } from 'react-redux';
import { getTeacherRatePage,updateUser } from './redux';
import { AdminPage, TableCell, renderTable,TableHead,TableHeadCell,FormTextBox,FormCheckbox, AdminModal } from 'view/component/AdminPage';
import StarRatings from 'react-star-ratings';
import Pagination from 'view/component/Pagination';

const ratingValue = [
    {id:'0',text:'0'},
    {id:'1',text:'từ 1 đến 2'},
    {id:'2',text:'từ 2 đến 3'},
    {id:'3',text:'từ 3 đến 4'},
    {id:'4',text:'từ 4 đến 5'},
    {id:'5',text:'5'},
];

class RateModal extends AdminModal {
    state = {};
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemPublicRatingScore.focus()));
    }

    onShow = (item) => {
        const { _id=null, publicRatingScore=0, publicRating=false } = item || {};
        this.itemPublicRatingScore.value(publicRatingScore);
        this.itemPublicRating.value(publicRating);
        this.setState({ _id });
    }

    onSubmit = () => {
        const changes = {
            publicRatingScore:Number(this.itemPublicRatingScore.value()),
            publicRating:this.itemPublicRating.value()?1:0
        };
        if (isNaN(changes.publicRatingScore)){
            T.notify('Điểm đánh giá phải là số', 'danger');
            this.itemPublicRatingScore.focus();
        } else if(Number(changes.publicRatingScore)<0||Number(changes.publicRatingScore)>5){
            T.notify('Điểm đánh giá phải từ 0 đến 5','danger');
            this.itemPublicRatingScore.focus();
        }else {
            this.state._id ? this.props.update(this.state._id, changes, this.hide) : this.props.create(changes,this.hide);
        }
    }

    render = () => this.renderModal({
        title: 'Đánh giá',
        body: <>
            <FormTextBox type='text' ref={e => this.itemPublicRatingScore = e} label='Điểm công bố' readOnly={this.props.readOnly} />
            <FormCheckbox ref={e => this.itemPublicRating = e} isSwitch={true} label='Công bố' readOnly={this.props.readOnly} />
        </>,
    });
}
class AdminTeacherRatePage extends AdminPage {
    state = {};
    componentDidMount() {
        T.ready( () => {
            this.props.getTeacherRatePage(1,null,{isLecturer:true},{},{});
        });
    }

    update = (_id,data)=>{
        this.props.updateUser(_id,data,()=>{
            this.props.getTeacherRatePage(null,null,{isLecturer:true});
        });
    }

    star = (score, count=0) => {
        return (
            <div className='d-flex align-items-center justify-content-center'>
                <span className='text-primary' style={{ fontSize:'40px', paddingRight: '15px', color:'#ffca08'}}>{Number(score).toFixed(1)+'   '}</span>
                <div>
                    <StarRatings
                        rating={score}
                        starRatedColor={score >=4  ? '#28a745' : (score < 3 ? '#dc3545' : '#ffca08')}
                        numberOfStars={5}
                        name='rating'
                        starDimension='20px'
                    />
                    <p><i className='fa fa-user-o' aria-hidden='true'></i>{'  ' + count}</p>
                </div>
                 
            </div>
        );
    }

    edit = (e, item) => e.preventDefault() || this.userModal.show(item);


    render() {
        const permission = this.getUserPermission('rate');
        let { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.user && this.props.user.page ?
        this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };        
        console.log({list});
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            autoDisplay:true,
            renderHead: () => (
                <TableHead getPage={this.props.getTeacherRatePage}>
                    <TableHeadCell style={{ width: 'auto' }}>#</TableHeadCell>
                    <TableHeadCell style={{ width: '20%' }} name='fullName' sort={true} filter='search'>Giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: '20%',textAlign:'center' }}>Hình ảnh giáo viên</TableHeadCell>
                    <TableHeadCell style={{ width: '60%',textAlign:'center' }} name='ratingScore' sort={true} filter='select' filterData={ratingValue}>Đánh giá từ học viên</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto',textAlign:'center' }} nowrap='true'>Điểm công bố</TableHeadCell>
                    <TableHeadCell style={{ width: 'auto',textAlign:'center' }} nowrap='true'>Công bố</TableHeadCell>
                </TableHead>
                ),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={`${item.lastname} ${item.firstname}`} url={`/user/manage-lecturer/${item._id}/rating`} />
                    <TableCell type='image' height='50px' content={item.image ? item.image : '/img/avatar-default.png'} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={this.star(item.ratingScore||0, item.ratingAmount)} />
                    <TableCell type='link' to = {'#'} onClick = {e=>this.edit(e,item)} style={{ textAlign: 'center' }} content={item.publicRatingScore||0} />
                    <TableCell type='checkbox' content={item.publicRating} permission={permission} onChanged={publicRating => this.update(item._id, { publicRating })} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-star',
            title: 'Đánh giá Giáo viên',
            breadcrumb: ['Đánh giá Giáo viên'],
            content: (
                <div className='tile'>
                    <div className='tile-body'>{table}</div>
                    <Pagination name='teacherRate' pageCondition={{isLecturer:true}} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getTeacherRatePage} />
                    <RateModal ref={e => this.userModal = e} readOnly={!permission.write}
                    update={this.props.updateUser} />
                </div>
            ),
        });
    }
}

const mapStateToProps = state => ({ system: state.system, rate: state.framework.rate,user: state.framework.user, });
const mapActionsToProps = { getTeacherRatePage,updateUser };
export default connect(mapStateToProps, mapActionsToProps)(AdminTeacherRatePage);
