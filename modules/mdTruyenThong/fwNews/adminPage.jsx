import React from 'react';
import { connect } from 'react-redux';
import { getNewsPage, createNews, updateNews, swapNews, deleteNews } from './redux';
import Pagination from 'view/component/Pagination';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class NewsPage extends AdminPage {
    componentDidMount() {
        T.ready(() => T.showSearchBox());
        T.onSearch = (searchText) => this.props.getNewsPage(undefined, undefined, searchText ? { searchText } : null, () => { });
        this.props.getNewsPage();
    }

    create = (e) => e.preventDefault() || this.props.createNews(data => this.props.history.push('/user/news/' + data.item._id));

    swap = (e, item, isMoveUp) => e.preventDefault() || this.props.swapNews(item._id, isMoveUp);

    delete = (e, item) => e.preventDefault() || T.confirm('Tin tức', 'Bạn có chắc bạn muốn xóa tin tức này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteNews(item._id));

    render() {
        const permission = this.getUserPermission('news');
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.news && this.props.news.page ?
            this.props.news.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const table = renderTable({
            getDataSource: () => list,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '80%' }}>Tiêu đề</th>
                    <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                    <th style={{ width: 'auto' }} nowrap='true'>Kích hoạt</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={(pageNumber - 1) * pageSize + index + 1} />
                    <TableCell type='link' content={item.title} url={'/user/news/' + item._id} />
                    <TableCell type='image' content={item.image || '/img/avatar.png'} style={{ height: '32px' }} />
                    <TableCell type='checkbox' content={item.active} permission={permission} onChanged={active => this.props.updateNews(item._id, { active })} />
                    <TableCell type='buttons' content={item} permission={permission} onSwap={this.swap} onEdit={'/user/news/' + item._id} onDelete={this.delete} />
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-file',
            title: 'Tin tức',
            breadcrumb: ['Tin tức'],
            content: <>
                <div className='tile'>{table}</div>
                <Pagination name='pageNews' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem} getPage={this.props.getNewsPage} />
            </>,
            onCreate: permission.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, news: state.news });
const mapActionsToProps = { getNewsPage, createNews, updateNews, swapNews, deleteNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsPage);