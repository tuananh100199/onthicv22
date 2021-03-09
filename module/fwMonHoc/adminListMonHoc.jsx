import React from 'react';
import { connect } from 'react-redux';
import { getMonHocInPage, createMonHoc, updateMonHoc, deleteMonHoc } from './redux.jsx'
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';

class AdminListMonHoc extends React.Component {
    componentDidMount() {
        this.props.getMonHocInPage();
        T.ready('/user/dao-tao', null);
    }

    create = (e) => {
        this.props.createMonHoc(data => this.props.history.push('/user/dao-tao/mon-hoc/edit/' + data.item._id));
        e.preventDefault();
    }
    delete = (e, item) => {
        T.confirm('Môn học', 'Bạn có chắc bạn muốn xóa môn học này?', 'warning', true, isConfirm => isConfirm && this.props.deleteMonHoc(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.subject && this.props.subject.page ?
            this.props.subject.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = 'Không có loại Môn học!';
        if (this.props.subject && this.props.subject.page && this.props.subject.page.list && this.props.subject.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '80%' }}>Tiêu đề</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.subject.page.list.map((item, index) => (
                            <tr key={index}>
                                {console.log('item', item)}
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td><Link to={'/user/dao-tao/mon-hoc/edit/' + item._id}>{item.title}</Link></td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dao-tao/mon-hoc/edit/' + item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.contains('course:write') ?
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
                    <h1><i className='fa fa-file' /> Môn học: Danh sách</h1>
                </div>
                <div className='row tile'>{table}</div>
                <Pagination name='pageSubject'
                    pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getMonHocInPage} />
                {currentPermissions.contains('course:write') ?
                    <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={this.create}>
                        <i className='fa fa-lg fa-plus' />
                    </button> : ''}
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, subject: state.subject });
const mapActionsToProps = { getMonHocInPage, createMonHoc, updateMonHoc, deleteMonHoc };
export default connect(mapStateToProps, mapActionsToProps)(AdminListMonHoc);
