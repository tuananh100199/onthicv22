import React from 'react';
import { connect } from 'react-redux';
import { createDraftNewsDefault, draftToNews, deleteDraftNews, getDraftNewsInPage } from './redux';
import { Link } from 'react-router-dom';
import Pagination from 'view/component/Pagination';

class NewsWaitApprovalPage extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.getDraftNewsInPage();
        T.ready();
    }
    create = (e) => {
        this.props.createDraftNewsDefault(data => this.props.history.push('/user/news/draft/edit/' + data.item._id));
        e.preventDefault();
    };

    changeActive(item, index) {
        this.props.draftToNews(item._id);
    }

    delete(e, item) {
        T.confirm('Tin tức', 'Bạn có chắc bạn muốn xóa mẫu tin tức này?', 'warning', true, isConfirm => isConfirm && this.props.deleteDraftNews(item._id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem, list } = this.props.news && this.props.news.draft ?
            this.props.news.draft : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0, list: [] };
        let table = 'Không có tin tức!';
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            viewerType = currentPermissions.includes('news:write') ? 2 : (currentPermissions.includes('news:draft') ? 1 : 0);
        if (list && list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            {viewerType == 2 ? <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Người tạo</th> : null}
                            {viewerType == 1 ? <th style={{ width: 'auto' }} nowrap='true'>Được duyệt</th> : null}
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <Link to={'/user/news/draft/edit/' + item._id} data-id={item._id}>{item.title}</Link>
                                </td>
                                <td style={{ width: '20%', textAlign: 'center' }}>
                                    <img src={item.image} alt='avatar' style={{ height: '32px' }} />
                                </td>
                                {viewerType == 2 ? (<td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{item.editorName}</td>) : null}
                                {viewerType == 1 ? (
                                    <td className='toggle' style={{ textAlign: 'center' }} >
                                        <label>
                                            <input type='checkbox' checked={item.active} disabled={viewerType != 2} onChange={() => { }} /><span className='button-indecator' />
                                        </label>
                                    </td>
                                ) : null}
                                <td>
                                    <div className='btn-group'>
                                        {viewerType == 2 ? (<a href='#' className='btn btn-success' onClick={() => this.changeActive(item, index)} title='Duyệt bản nháp này'> <i className='fa fa-check' /></a>) : null}
                                        <Link to={'/user/news/draft/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('news:draft') ?
                                            <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a> : null}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <h1><i className='fa fa-file' /> Tin tức: Chờ duyệt</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='pageNews'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getDraftNewsInPage} />
                {!currentPermissions.contains('news:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={(e) => this.create()}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : null}

            </main>
        );
    }
}

const mapStateToProps = state => ({ news: state.news, system: state.system });
const mapActionsToProps = { getDraftNewsInPage, createDraftNewsDefault, draftToNews, deleteDraftNews };
export default connect(mapStateToProps, mapActionsToProps)(NewsWaitApprovalPage);