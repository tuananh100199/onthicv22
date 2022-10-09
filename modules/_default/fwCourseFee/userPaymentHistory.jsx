import React from 'react';
import { connect } from 'react-redux';
import { getStudent } from 'modules/mdDaoTao/fwStudent/redux';
import { getBankByStudent } from 'modules/_default/fwBank/redux';
import { Link } from 'react-router-dom';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';


const previousRoute = '/user';

class UserPaymentHistory extends AdminPage {
    state = { name: '...', soTienThanhToan: 0 };
    componentDidMount() {
        const route = T.routeMatcher('/user/hoc-vien/cong-no/:_id/lich-su'),
            _id = route.parse(window.location.pathname)._id;
        const userId = this.props.system && this.props.system.user && this.props.system.user._id;
        this.setState({ courseTypeId: _id });
        if (_id) {
            T.ready('/user', () => {
                this.props.getStudent({user: userId, courseType: _id}, data => {
                    if (data) {
                        this.setState({student: data});
                    } else {
                        this.props.history.push(previousRoute);
                    }
                });
            });
        } else {
            this.props.history.push(previousRoute);
        }
    }

    onCheck = (value, fee) => {
        if (value) {
            this.setState(prevState => ({
                soTienThanhToan: prevState.soTienThanhToan + fee
            }));
        } else {
            this.setState(prevState => ({
                soTienThanhToan: prevState.soTienThanhToan - fee
            }));
        }
    }

    payment = (e) => e.preventDefault() || console.log('test');

    render() {
        const userPageLink = '/user/hoc-vien/cong-no/' + this.state.courseTypeId;
        const {student, courseTypeId} = this.state;
        let list = [];
        if(student && student.cart && student.cart.lock && student.cart.item.length){
            student.cart.name = 'Thanh toán học phí tăng thêm lần ' + (student.lichSuMuaThemGoi ? student.lichSuMuaThemGoi.length + 1 : 1);
            student.cart.fee =  student.cart.item.reduce((result,item) => result + parseInt(item.fees) , 0);
            list.push(student.cart);
        }
        if(student && student.lichSuDongTien && student.lichSuDongTien.length){
            for(let i = 1; i <= student.lichSuDongTien.length; i++){
                student.lichSuDongTien[i-1].name = 'Thanh toán học phí lần ' + i;
                list.push(student.lichSuDongTien[i-1]);
            }
        }
        if(student && student.lichSuMuaThemGoi && student.lichSuMuaThemGoi.length){
            for(let i = 1; i <= student.lichSuMuaThemGoi.length; i++){
                student.lichSuMuaThemGoi[i-1].name = 'Thanh toán học phí tăng thêm lần ' + i;
                student.lichSuMuaThemGoi[i-1].fee = student.lichSuMuaThemGoi[i-1].item.reduce((result,item) =>result+parseInt(item.fees) ,0);
                list.push(student.lichSuMuaThemGoi[i-1]);
            }
        }

        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }}>Nội dung</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Số tiền</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Ngày thanh toán</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Trạng thái</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>In phiếu thu</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.name} />
                    <TableCell type='number' content={item.fee} />
                    <TableCell type='text' style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.date ? T.dateToText(item.date, 'dd/mm/yyyy') : ''} />
                    <TableCell type={item.date ? 'text' : 'link'} style={{ whiteSpace: 'nowrap', textAlign: 'center' }} content={item.date ? 'Đã thanh toán' : 'Chờ thanh toán'} url={'/user/hoc-vien/cong-no/'+ courseTypeId +'/tang-them'} />
                    <TableCell type='link' onClick={() => console.log('first')} style={{ textAlign: 'center' }} content={item.date ? <i className='fa fa-print' aria-hidden='true'></i> : ''} />
                </tr>),
        });
        return this.renderPage({
            icon: 'fa fa-history',
            title: 'Lịch sử thanh toán: ' + (student && student.courseType && student.courseType.title ? student.courseType.title: ''),
            breadcrumb: [<Link key={0} to={userPageLink}>Theo dõi công nợ</Link>, 'Lịch sử thanh toán'],
            content: (
                <>
                    <div className='tile'>
                        <h3 className='tile-title'>Thanh toán</h3>
                        {table}
                    </div>
                </>
            ),
            backRoute: userPageLink,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, course: state.trainning.course });
const mapActionsToProps = { getStudent, getBankByStudent };
export default connect(mapStateToProps, mapActionsToProps)(UserPaymentHistory);
