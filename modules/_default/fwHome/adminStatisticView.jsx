import React from 'react';
import { connect } from 'react-redux';
import { getAllStatistics, createStatistic, deleteStatistic } from './redux/reduxStatistic';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';

class StatisticModal extends React.Component {
    constructor(props) {
        super(props);

        this.modal = React.createRef();
        this.btnSave = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('hidden.bs.modal', () => $('#statisticTabs li:first-child a').tab('show'))
                .on('shown.bs.modal', () => $('#statisticViName').focus());
        }, 250));
    }

    show = () => {
        $('#statisticViName').val('');
        $('#statisticEnName').val('');
        this.editor.vi.current.html('');
        this.editor.en.current.html('');
        $(this.modal.current).modal('show');
    }

    save = (event) => {
        const statisticName = {
            vi: $('#statisticViName').val().trim(),
            en: $('#statisticEnName').val().trim()
        };
        const description = {
            vi: this.editor.vi.current.html(),
            en: this.editor.en.current.html(),
        }
        if (statisticName.vi === '') {
            T.notify('Tên nhóm thống kê bị trống!', 'danger');
            $('#statisticViName').focus();
        } else if (statisticName.en === '') {
            T.notify('Name of statistics group is empty!', 'danger');
            $('#statisticEnName').focus();
        } else {
            this.props.createStatistic(JSON.stringify(statisticName), JSON.stringify(description), '', data => {
                if (data.error === undefined || data.error == null) {
                    $(this.modal.current).modal('hide');
                    if (data.item) {
                        this.props.showStatistic(data.item);
                    }
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
                            <h5 className='modal-title'>Thống kê</h5>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <ul id='statisticTabs' className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#statisticViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#statisticEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='statisticViTab' className='tab-pane fade show active mt-3'>
                                    <div className='form-group'>
                                        <label htmlFor='statisticViName'>Tên nhóm thống kê</label>
                                        <input className='form-control' id='statisticViName' type='text' placeholder='Tên nhóm thống kê' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='statisticViDescription'>Mô tả</label>
                                        <Editor ref={this.editor.vi} id='statisticViDescription' /><br />
                                    </div>
                                </div>

                                <div id='statisticEnTab' className='tab-pane fade mt-3t'>
                                    <div className='form-group'>
                                        <label htmlFor='statisticEnName'>Name of statistics group</label>
                                        <input className='form-control' id='statisticEnName' type='text' placeholder='Name of statistics group' />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='statisticEnDescription'>Description</label>
                                        <Editor ref={this.editor.en} id='statisticEnDescription' /><br />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='submit' className='btn btn-primary' ref={this.btnSave}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StatisticPage extends React.Component {
    constructor(props) {
        super(props);
        this.modal = React.createRef();
    }

    componentDidMount() {
        this.props.getAllStatistics();
    }

    create = (e) => {
        this.modal.current.show();
        e.preventDefault();
    }

    show = (item) => {
        this.props.history.push('/user/statistic/edit/' + item._id);
    }

    delete = (e, item) => {
        T.confirm('Xóa nhóm thống kê', 'Bạn có chắc bạn muốn xóa nhóm thống kê này?', true, isConfirm => isConfirm && this.props.deleteStatistic(item._id));
        e.preventDefault();
    }

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [];
        let table = null;
        if (this.props.statistic && this.props.statistic.list && this.props.statistic.list.length > 0) {
            table = (
                <table key={0} className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                            <th style={{ width: '100%' }}>Tên nhóm</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Số lượng</th>
                            <th style={{ width: 'auto', whiteSpace: 'nowrap' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.statistic.list.map((item, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'right' }}>{index + 1}</td>
                                <td>
                                    <Link to={'/user/statistic/edit/' + item._id} data-id={item._id}>{item.title}</Link>
                                </td>
                                <td style={{ textAlign: 'right' }}>{item.items.length}</td>
                                <td>
                                    <div className='btn-group'>
                                        <Link to={'/user/statistic/edit/' + item._id} data-id={item._id} className='btn btn-primary'>
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
            table = <p key={0}>Không có nhóm thống kê!</p>;
        }

        const result = [table, <StatisticModal key={1} createStatistic={this.props.createStatistic} showStatistic={this.show} ref={this.modal} />];
        if (currentPermissions.includes('component:write')) {
            result.push(
                <button key={2} type='button' className='btn btn-primary btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.create}>
                    <i className='fa fa-lg fa-plus' />
                </button>
            );
        }
        return result;
    }
}

const mapStateToProps = state => ({ system: state.system, statistic: state.statistic });
const mapActionsToProps = { getAllStatistics, createStatistic, deleteStatistic };
export default connect(mapStateToProps, mapActionsToProps)(StatisticPage);