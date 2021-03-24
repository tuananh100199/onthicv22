import React from 'react';
import { connect } from 'react-redux';
import { getStatisticItem, updateStatistic, addStatisticIntoGroup, updateStatisticInGroup, removeStatisticFromGroup, swapStatisticInGroup } from './redux/reduxStatistic';
import { Link } from 'react-router-dom';
import Editor from 'view/component/CkEditor4';
import ImageBox from 'view/component/ImageBox';

class StatisticModal extends React.Component {
    state = {};
    modal = React.createRef();
    editor = React.createRef();
    btnSave = React.createRef();

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus());
        }, 250));
    }

    show = (selectedItem, index) => {
        let { title, number } = selectedItem ? selectedItem : { title: JSON.stringify({ vi: '', en: '' }), number: 0 };
        $('#sttTitle').val(title);
        $('#sttNumber').val(number);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        $(this.modal.current).modal('show');
    }
    hide = () => {
        $(this.modal.current).modal('hide');
    }

    save = (event) => {
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            title = $('#sttTitle').val(),
            number = $('#sttNumber').val();
        if (isNewMember) {
            this.props.addStatistic(JSON.stringify(title), number);
        } else {
            this.props.updateStatistic(index, JSON.stringify(title), number);
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
                            <div className='form-group'>
                                <label htmlFor='sttTitle'>Tên</label><br />
                                <input className='form-control' id='sttTitle' type='text' placeholder='Tên' />
                            </div>
                            <div className='form-group'>
                                <label htmlFor='sttNumber'>Số lượng</label><br />
                                <input className='form-control' id='sttNumber' type='number' placeholder='Số lượng' />
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StatisticEditPage extends React.Component {
    state = { image: '' };
    modal = React.createRef();
    editor = { vi: React.createRef(), en: React.createRef() };
    image = React.createRef();

    componentDidMount() {
        T.ready(() => {
            const route = T.routeMatcher('/user/statistic/edit/:statisticId'),
                params = route.parse(window.location.pathname);

            this.props.getStatisticItem(params.statisticId, data => {
                if (data.error) {
                    T.notify('Lấy nhóm thống kê bị lỗi!', 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    $('#tepTitle').val(data.item.title).focus();
                    this.image.current.setData('statistic:' + data.item._id, data.item.image ? data.item.image : '');
                    this.editor.vi.current.html(data.item.description);
                    this.setState({ image: data.item.image ? data.item.image : '' });
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    imageChanged = (data) => {
        this.setState({ image: data.image });
    };

    showAddStatisticModal = () => {
        this.modal.current.show();
    };

    showEditStatisticModal = (e, selectedStatistic, index) => {
        this.modal.current.show(selectedStatistic, index);
        e.preventDefault();
    };

    add = (title, number) => {
        this.props.addStatisticIntoGroup(title, number);
        this.modal.current.hide();
    };

    update = (index, title, number) => {
        this.props.updateStatisticInGroup(index, title, number);
        this.modal.current.hide();
    };

    remove = (e, index) => {
        this.props.removeStatisticFromGroup(index);
        e.preventDefault();
    };

    swap = (e, index, isMoveUp) => {
        this.props.swapStatisticInGroup(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const title = $('#tepTitle').val().trim();
        const description = this.editor.vi.current.html();

        if (title === '') {
            T.notify('Tên nhóm thống kê bị trống!', 'danger');
            $('#statisticName').focus();
        } else {
            const changes = {
                title,
                description,
                image: this.state.image,
                items: this.props.statistic.item.items,
            };
            if (changes.items && changes.items.length == 0) changes.items = 'empty';
            this.props.updateStatistic(this.props.statistic.item._id, changes);
        }
    };

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            readOnly = !currentPermissions.includes('component:write');
        let table = null,
            currentStatistic = this.props.statistic ? this.props.statistic.item : null;
        if (currentStatistic && currentStatistic.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: 'auto' }}>#</th>
                            <th style={{ width: '100%' }}>Tên (Việt Nam)</th>
                            <th style={{ width: 'auto', textAlign: 'right' }} nowrap='true'>Số lượng</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentStatistic.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    {readOnly ? item.title : <a href='#' onClick={e => this.showEditStatisticModal(e, item, index)}>{item.title}</a>}
                                </td>
                                <td style={{ textAlign: 'right' }}>{T.numberDisplay(item.number)}</td>
                                {readOnly ? null :
                                    <td>
                                        <div className='btn-group'>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>
                                            <a className='btn btn-primary' href='#' onClick={e => this.showEditStatisticModal(e, item, index)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </div>
                                    </td>
                                }
                            </tr>))}
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có thống kê!</p>;
        }

        const title = currentStatistic ? currentStatistic.title : '';
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Thống kê: {title}</h1>
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>&nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>&nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='tile'>
                    <div className='tile-body'>
                        <div className='form-group'>
                            <label className='control-label' htmlFor='tepTitle'>Tiêu đề</label>
                            <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='tepTitle' defaultValue={title.vi} readOnly={readOnly} />
                        </div>
                        <div className='form-group'>
                            <label htmlFor='tepDescription'>Mô tả</label>
                            <Editor ref={this.editor.vi} placeholder='Nội dung' id='tepDescription' readOnly={readOnly} /><br />
                            <label htmlFor='tepBacground'>Ảnh nền</label>
                        </div>
                        <div className='form-group'>
                            <ImageBox ref={this.image} image={this.state.image} id='tepBacground' postUrl='/user/upload' uploadType='StatisticImage' userData='statistic' success={this.imageChanged} readOnly={readOnly} />
                        </div>
                        <div className='form-group'>{table}</div>
                    </div>
                    {readOnly ? null :
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-info' type='button' onClick={this.showAddStatisticModal}>
                                <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                            </button>&nbsp;
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div>}
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <StatisticModal ref={this.modal} addStatistic={this.add} updateStatistic={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system, statistic: state.statistic });
const mapActionsToProps = { getStatisticItem, updateStatistic, addStatisticIntoGroup, updateStatisticInGroup, removeStatisticFromGroup, swapStatisticInGroup };
export default connect(mapStateToProps, mapActionsToProps)(StatisticEditPage);
