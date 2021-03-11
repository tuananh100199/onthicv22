import React from 'react';
import { connect } from 'react-redux';
import { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan } from './redux/reduxDangKyTuVan.jsx';
import { Link } from 'react-router-dom';
import Pagination from '../../view/component/Pagination.jsx';


class DangKyTuVanModal extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#dangKyTuVanName').focus());
        });
    }

    show = () => {
        $('#dangKyTuVanName').val('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const newData = {
            title: $('#dangKyTuVanName').val().trim()
        };
        
        if (newData.title == '') {
            T.notify('Tên danh sách đăng ký tư vấn bị trống!', 'danger');
            $('#dangKyTuVanName').focus();
        } else {
            this.props.createDangKyTuVan(newData, data => {
                if (data.item) {
                    $(this.modal.current).modal('hide');
                    this.props.history.push('/user/dang-ky-tu-van-list/edit/' + data.item._id);
                }
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <form className='modal-dialog modal-lg' role='document' onSubmit={this.save}>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Danh sách đăng ký tư vấn</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='tab-content'>
                                <div className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='dangKyTuVanName'>Tên danh sách đăng ký tư vấn</label>
                                        <input className='form-control' id='dangKyTuVanName' type='text' placeholder='Tên danh sách đăng ký tư vấn' />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary'>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class DangKyTuVanPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllDangKyTuVan();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }
    
    delete = (e, item) => {
        T.confirm('Xóa danh sách đăng ký tư vấn', 'Bạn có chắc bạn muốn xóa danh sách đăng ký tư vấn này?', true, isConfirm => isConfirm && this.props.deleteDangKyTuVan(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [] ,
        { pageNumber, pageSize, pageTotal, totalItem } = this.props.dangKyTuVan && this.props.dangKyTuVan.page ?    this.props.dangKyTuVan.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        let table = null;
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.list && this.props.dangKyTuVan.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered' ref={this.table}>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên danh sách</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.dangKyTuVan.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/dang-ky-tu-van-list/edit/' + item._id}>
                                        {T.language.parse(item.title)}
                                    </Link>
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/dang-ky-tu-van-list/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
                                            <i className='fa fa-lg fa-edit' />
                                        </Link>
                                        {currentPermissions.includes('component:write') ?
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
        } else {
            table = <p key={0}>Không có danh sách các đăng ký tư vấn!</p>;
        }
        return (
            <main className='app-content'>
               <div className='app-title'>
                   <h1><i className='fa fa-file' /> Đăng ký tư vấn: Danh sách</h1>
               </div>
               <div className='row tile'>{table}</div>
                 <Pagination name='pageDangKyTuVan'
                   pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                   getPage={this.props.getDangKyTuVanInPage} />
                   <DangKyTuVanModal key={1} createDangKyTuVan={this.props.createDangKyTuVan} showDangKyTuVan={this.show} ref={this.modal} />
                   <button type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                       onClick={this.create}>
                       <i className='fa fa-lg fa-plus' />
                   </button>
           </main>
           );
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);