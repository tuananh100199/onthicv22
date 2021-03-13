import React from 'react';
import { connect } from 'react-redux';
import { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe } from './redux/reduxSubscribe';
import Pagination from 'view/component/Pagination';

class AdminSubscribeModal extends React.Component {
    state = {};
    modal = React.createRef();

    show = (item) => {
        this.setState(item);
        $(this.modal.current).modal('show');
    }

    render() {
        const {email,createdDate} = this.state;
        return (
            <div className='modal' tabIndex='-1' role='dialog' ref={this.modal}>
                <div className='modal-dialog modal-lg' role='document'>
                    <div className='modal-content'>
                        <div className='modal-header'>
                            <h5 className='modal-title'>Thông tin đăng ký nhận tin</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <label>Email: <b>{email}</b></label><br />
                            <label>Ngày đăng ký nhận tin: <b>{createdDate}</b></label><br />
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
class SubscribePage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        this.props.getSubscribePage();
        T.ready('/user/settings');
    }

    showSubscribe = (e, SubscribeId) => {
        e.preventDefault();
        this.props.getSubscribe(SubscribeId, subscribe => this.modal.current.show(subscribe));
    }

    changeRead = (item) => this.props.updateSubscribe(item._id, { read: !item.read });

    delete = (e, item) => {
        T.confirm('Xoá đăng ký nhận tin', 'Bạn có chắc muốn xoá đăng ký nhận tin này?', true, isConfirm => isConfirm && this.props.deleteSubscribe(item._id));
        e.preventDefault();
    }

    render() {
        const { pageNumber, pageSize, pageTotal, totalItem } = this.props.subscribe && this.props.subscribe.page ?
            this.props.subscribe.page : { pageNumber: 1, pageSize: 50, pageTotal: 1, totalItem: 0 };
        const readStyle = { textDecorationLine: 'none', fontWeight: 'normal', color: 'black' },
            unreadStyle = { textDecorationLine: 'none', fontWeight: 'bold' };
        let table = 'Không có đăng ký nhận tin!';
        if (this.props.subscribe && this.props.subscribe.page && this.props.subscribe.page.list && this.props.subscribe.page.list.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '70%' }}>Email</th>
                            <th style={{ width: '30%' }}>Ngày đăng ký</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.subscribe.page.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{(pageNumber - 1) * pageSize + index + 1}</td>
                                <td>
                                    <a href='#' onClick={e => this.showSubscribe(e, item._id)} style={item.read ? readStyle : unreadStyle}>{item.email}</a>

                                </td>
                                <td>
                                    {new Date(item.createdDate).getText()}
                                </td>
                                <td>
                                    <div className='btn-group'>
                                        <a className='btn btn-primary' href='#' onClick={e => this.showSubscribe(e, item._id)}>
                                            <i className='fa fa-lg fa-envelope-open-o' />
                                        </a>
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
                    <h1><i className='fa fa fa-envelope-o' /> Đăng ký nhận tin</h1>
                </div>
                <div className='tile'>{table}</div>
                <Pagination name='pageContact' pageNumber={pageNumber} pageSize={pageSize} pageTotal={pageTotal} totalItem={totalItem}
                    getPage={this.props.getSubscribePage} />
                <AdminSubscribeModal ref={this.modal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ subscribe: state.subscribe });
const mapActionsToProps = { getSubscribePage, getSubscribe, updateSubscribe, deleteSubscribe };
export default connect(mapStateToProps, mapActionsToProps)(SubscribePage);