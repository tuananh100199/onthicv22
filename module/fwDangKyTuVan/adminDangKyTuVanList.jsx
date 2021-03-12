import React from 'react';
import { connect } from 'react-redux';
import { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan } from './redux/reduxDangKyTuVan';
import { Link } from 'react-router-dom';
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
        let table = 'Không có danh sách các đăng ký tư vấn!';
        if (this.props.dangKyTuVan && this.props.dangKyTuVan.list && this.props.dangKyTuVan.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
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
                                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, item)}>
                                            <i className='fa fa-lg fa-trash' />
                                        </a>
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
                    <h1><i className='fa fa-file' /> Đăng ký tư vấn: Danh sách</h1>
                </div>
                <div className='row tile'>{table}</div>
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, dangKyTuVan: state.dangKyTuVan });
const mapActionsToProps = { getAllDangKyTuVan, createDangKyTuVan, deleteDangKyTuVan };
export default connect(mapStateToProps, mapActionsToProps)(DangKyTuVanPage);