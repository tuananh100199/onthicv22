import React from 'react';
import { connect } from 'react-redux';
import { getStatisticItem, updateStatistic, addStatisticIntoGroup, updateStatisticInGroup, removeStatisticFromGroup, swapStatisticInGroup } from './redux/reduxStatistic.jsx';
import { Link } from 'react-router-dom';
import Editor from '../../view/component/CkEditor4.jsx';
import ImageBox from '../../view/component/ImageBox.jsx';

const texts = {
    vi: {
        getStatisticError: 'Lấy nhóm thống kê bị lỗi!',
    },
    en: {
        getStatisticError: 'Failed to get group of statistics!'
    }
}
const language = T.language(texts);

class StatisticModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.modal = React.createRef();
        this.editor = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => setTimeout(() => {
            $(this.modal.current).on('shown.bs.modal', () => $('#sttTitle').focus())
        }, 250));
    }

    show = (selectedItem, index) => {
        let { title, number } = selectedItem ? selectedItem : { title: JSON.stringify({ vi: '', en: '' }), number: 0 };
        title = T.language.parse(title, true);
        $('#sttViTitle').val(title.vi);
        $('#sttEnTitle').val(title.en);
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
            title = {
                vi: $('#sttViTitle').val(),
                en: $('#sttEnTitle').val()
            },
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
                            <div className='container-fluid row'>
                                <h5 className='modal-title col-6'>Thống kê (Việt Nam)</h5>
                                <h5 className='modal-title col-6'>Statistic (English)</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='container-fluid row'>
                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttViTitle'>Tên</label><br />
                                        <input className='form-control' id='sttViTitle' type='text' placeholder='Tên' />
                                    </div>
                                </div>

                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttEnTitle'>Name</label><br />
                                        <input className='form-control' id='sttEnTitle' type='text' placeholder='Name' />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='sttNumber'>Số lượng | Quantity</label><br />
                                        <input className='form-control' id='sttNumber' type='number' placeholder='Số lượng' />
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className='modal-footer'>
                            <button type='button' className='btn btn-secondary' data-dismiss='modal'>Đóng</button>
                            <button type='button' className='btn btn-primary' ref={this.btnSave} onClick={this.save}>Lưu</button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

class StatisticEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { image: '' };
        this.modal = React.createRef();
        this.editor = { vi: React.createRef(), en: React.createRef() };
        this.image = React.createRef();
    }

    componentDidMount() {
        T.ready('/user/settings', () => {
            const route = T.routeMatcher('/user/statistic/edit/:statisticId'),
                params = route.parse(window.location.pathname);

            this.props.getStatisticItem(params.statisticId, data => {
                if (data.error) {
                    T.notify(language.getStatisticError, 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const title = T.language.parse(data.item.title, true),
                        content = T.language.parse(data.item.description, true);
                    $('#tepViTitle').val(title.vi).focus();
                    $('#tepEnTitle').val(title.en);
                    this.image.current.setData('statistic:' + data.item._id, data.item.image ? data.item.image : '');
                    this.editor.vi.current.html(content.vi);
                    this.editor.en.current.html(content.en);
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
        const title = {
            vi: $('#tepViTitle').val().trim(),
            en: $('#tepEnTitle').val().trim(),
        };
        const description = {
            vi: this.editor.vi.current.html(),
            en: this.editor.en.current.html()
        };

        if (title.vi === '') {
            T.notify('Tên nhóm thống kê bị trống!', 'danger');
            $('#statisticViName').focus();
        } else if (title.en === '') {
            T.notify('Name of statistics group is empty!', 'danger');
            $('#statisticEnName').focus();
        } else {
            const changes = {
                title: JSON.stringify(title),
                description: JSON.stringify(description),
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
                            <th style={{ width: '50%' }}>Tên (Việt Nam)</th>
                            <th style={{ width: '50%' }}>Name (English)</th>
                            <th style={{ width: 'auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lượng</th>
                            {readOnly ? null : <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentStatistic.items.map((item, index) => {
                            const title = T.language.parse(item.title, true);
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        {readOnly ? title.vi : <a href='#' onClick={e => this.showEditStatisticModal(e, item, index)}>{title.vi}</a>}
                                    </td>
                                    <td>
                                        {readOnly ? title.en : <a href='#' onClick={e => this.showEditStatisticModal(e, item, index)}>{title.en}</a>}
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
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có thống kê!</p>;
        }

        const title = currentStatistic && currentStatistic.title ? T.language.parse(currentStatistic.title, true) : { en: '<empty>', vi: '<Trống>' };
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Thống kê: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/component'>Thành phần giao diện</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='tile col-md-12'>
                        <div className='tile-body'>
                            <ul className='nav nav-tabs'>
                                <li className='nav-item'>
                                    <a className='nav-link active show' data-toggle='tab' href='#statisticViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#statisticEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='statisticViTab' className='tab-pane fade show active'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='tepViTitle'>Tiêu đề</label>
                                        <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='tepViTitle' defaultValue={title.vi} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='tepViDescription'>Mô tả</label>
                                        <Editor ref={this.editor.vi} placeholder='Nội dung' id='tepViDescription' readOnly={readOnly} /><br />
                                        <label htmlFor='tepBacground'>Ảnh nền</label>
                                    </div>
                                </div>

                                <div id='statisticEnTab' className='tab-pane fade'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='tepEnTitle'>Title</label>
                                        <input className='form-control col-6' type='text' placeholder='Title' id='tepEnTitle' defaultValue={title.en} readOnly={readOnly} />
                                    </div>
                                    <div className='form-group'>
                                        <label htmlFor='tepEnDescription'>Description</label>
                                        <Editor ref={this.editor.en} placeholder='Content' id='tepEnDescription' readOnly={readOnly} /><br />
                                        <label htmlFor='tepBacground'>Background image</label>
                                    </div>
                                </div>

                                <div className='form-group'>
                                    <ImageBox ref={this.image} image={this.state.image} id='tepBacground' postUrl='/user/upload' uploadType='StatisticImage' userData='statistic' success={this.imageChanged} readOnly={readOnly} />
                                </div>
                            </div>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        {readOnly ? null :
                            <div className='tile-footer'>
                                <div className='row'>
                                    <div className='col-md-12' style={{ textAlign: 'right' }}>
                                        <button className='btn btn-info' type='button' onClick={this.showAddStatisticModal}>
                                            <i className='fa fa-fw fa-lg fa-plus' />Thêm thống kê
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                            <i className='fa fa-fw fa-lg fa-save' />Lưu
                                    </button>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
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
