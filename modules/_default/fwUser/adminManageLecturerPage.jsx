import React from 'react';
import { connect } from 'react-redux';
import { getUserPage } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class UserPage extends AdminPage {
    state = { isSearching: false, searchText: '', userType: 'isLecturer', dateStart: '', dateEnd: '' };

    componentDidMount() {
        T.ready(() => {
            T.showSearchBox(() => this.setState({ dateStart: '', dateEnd: '' }));
            T.onSearch = (searchText) => this.onSearch({ searchText });
        });
        this.onSearch({});
    }

    onSearch = ({ pageNumber, pageSize, searchText, userType }, done) => {
        if (searchText == undefined) searchText = this.state.searchText;
        if (userType == undefined) userType = this.state.userType;
        const dateStart = this.state.dateStart, dateEnd = this.state.dateEnd;
        this.setState({ isSearching: true }, () => this.props.getUserPage(pageNumber, pageSize, { searchText: 'teacherPage'.concat(searchText), userType, dateStart, dateEnd }, (page) => {
            this.setState({ searchText, userType, isSearching: false, dateStart, dateEnd });
            done && done(page);
        }));
    }

    handleFilterByTime = () => {
        const searchText = this.state.searchText, userType = this.state.userType;
        const dateStart = this.dateStart ? this.dateStart.value() : '';
        const dateEnd = this.dateEnd ? this.dateEnd.value() : '';
        if (dateStart > dateEnd) {
            T.notify('Ngày bắt đầu phải nhỏ hơn ngày kết thúc !', 'danger');
        } else {
            this.props.getUserPage(undefined, undefined, { searchText, userType, dateStart, dateEnd }, () => {
                this.setState({ searchText, userType, isSearching: false, dateStart, dateEnd });
            });
        }
    }

    render() {
        const permission = this.getUserPermission('user');
        let { pageNumber, pageSize, pageTotal, pageCondition, totalItem, list } = this.props.user && this.props.user.page ?
            this.props.user.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, pageCondition: {}, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list, stickyHead: true,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Tên</th>
                    <th style={{ width: 'auto' }}>Thông tin liên hệ</th>
                    <th style={{ width: '20%', textAlign: 'center' }} nowrap='true'>Hình ảnh</th>
                    <th style={{ width: '40%', whiteSpace: 'nowrap' }}>Cơ sở đào tạo</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Thời gian tạo</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={<>{item.lastname + ' ' + item.firstname}<br />{item.identityCard}</>} url={`/user/manage-lecturer/${item._id}/rating`} style={{ whiteSpace: 'nowrap' }} />
                    <TableCell type='text' content={<>{item.email}<br />{item.phoneNumber}</>} />
                    <TableCell type='image' content={item.image ? item.image : '/img/avatar.png'} />
                    <TableCell type='text' content={item.division ? `${item.division.title} ${item.division.isOutside ? '(ngoài)' : ''}` : ''} />
                    <TableCell type='text' content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='buttons' content={item} permission={permission} onEdit={`/user/manage-lecturer/${item._id}/rating`} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-users',
            title: 'Quản lý giáo viên',
            breadcrumb: ['Quản lý giáo viên'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='adminUser' pageCondition={pageCondition} pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={(pageNumber, pageSize) => this.onSearch({ pageNumber, pageSize })} />
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, user: state.framework.user, role: state.framework.role });
const mapActionsToProps = { getUserPage };
export default connect(mapStateToProps, mapActionsToProps)(UserPage);
