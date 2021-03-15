import React from 'react';
import { connect } from 'react-redux';
import { getLogoItem, updateLogo, addLogoIntoGroup, updateLogoInGroup, removeLogoFromGroup, swapLogoInGroup } from './redux/reduxLogo';
import { Link } from 'react-router-dom';
import ImageBox from 'view/component/ImageBox';

const texts = {
    vi: {
        getLogoError: 'Lấy nhóm logo bị lỗi!',
    },
    en: {
        getLogoError: 'Failed to get group of logos!'
    }
};
const language = T.language(texts);

class LogoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { image: '' };

        this.modal = React.createRef();
        this.imageBox = React.createRef();
        this.btnSave = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            setTimeout(() => $(this.modal.current).on('shown.bs.modal', () => $('#logoViTitle').focus()), 250);
        });
    }

    imageChanged = (data) => this.setState({ image: data.url });

    show = (selectedItem, index) => {
        let { name, address, link, image } = selectedItem ? selectedItem : {
            name: JSON.stringify({ vi: '', en: '' }),
            address: JSON.stringify({ vi: '', en: '' }),
            link: '',
            image: ''
        };
        name = T.language.parse(name, true);
        address = T.language.parse(address, true);
        $('#logoViTitle').val(name.vi);
        $('#logoEnTitle').val(name.en);
        $('#logoViAddress').val(address.vi);
        $('#logoEnAddress').val(address.en);
        $('#logoLink').val(link);
        this.setState({ image });
        this.imageBox.current.setData('Logo', image);
        $(this.btnSave.current).data('isNewMember', selectedItem == null).data('index', index);

        $(this.modal.current).modal('show');
    }
    hide = () => $(this.modal.current).modal('hide');

    save = (event) => {
        const btnSave = $(this.btnSave.current),
            isNewMember = btnSave.data('isNewMember'),
            index = btnSave.data('index'),
            name = {
                vi: $('#logoViTitle').val(),
                en: $('#logoEnTitle').val()
            }, address = {
                vi: $('#logoViAddress').val(),
                en: $('#logoEnAddress').val()
            }, link = $('#logoLink').val();
        if (isNewMember) {
            this.props.add(JSON.stringify(name), JSON.stringify(address), link, this.state.image);
        } else {
            this.props.update(index, JSON.stringify(name), JSON.stringify(address), link, this.state.image);
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
                                <h5 className='modal-title col-6'>Logo (Việt Nam)</h5>
                                <h5 className='modal-title col-6'>Logo (English)</h5>
                            </div>
                            <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            <div className='container-fluid row'>
                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='logoViTitle'>Tên</label><br />
                                        <input className='form-control' id='logoViTitle' type='text' placeholder='Tên' />
                                    </div>
                                    <div className='form-group col-12'>
                                        <label htmlFor='logoViAddress'>Địa chỉ</label><br />
                                        <input className='form-control' id='logoViAddress' type='text' placeholder='Địa chỉ' />
                                    </div>
                                </div>

                                <div className='col-6'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='logoEnTitle'>Name</label><br />
                                        <input className='form-control' id='logoEnTitle' type='text' placeholder='Name' />
                                    </div>
                                    <div className='form-group col-12'>
                                        <label htmlFor='logoEnAddress'>Address</label><br />
                                        <input className='form-control' id='logoEnAddress' type='text' placeholder='Address' />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label htmlFor='logoLink'>Link</label><br />
                                        <input className='form-control' id='logoLink' type='text' placeholder='Link' />
                                    </div>
                                </div>
                                <div className='col-12'>
                                    <div className='form-group col-12'>
                                        <label>Hình ảnh logo</label>
                                        <ImageBox ref={this.imageBox} postUrl='/user/upload' uploadType='LogoImage' userData='Logo' success={this.imageChanged} />
                                    </div>
                                </div>
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

class LogoEditPage extends React.Component {
    modal = React.createRef();

    componentDidMount() {
        T.ready(() => {
            const route = T.routeMatcher('/user/logo/edit/:logoId'),
                params = route.parse(window.location.pathname);

            this.props.getLogoItem(params.logoId, data => {
                if (data.error) {
                    T.notify(language.getLogoError, 'danger');
                    this.props.history.push('/user/component');
                } else if (data.item) {
                    const title = T.language.parse(data.item.title, true);
                    $('#logosViTitle').val(title.vi).focus();
                    $('#logosEnTitle').val(title.en);
                } else {
                    this.props.history.push('/user/component');
                }
            });
        });
    }

    showAddLogoModal = () => this.modal.current.show();
    showEditLogoModal = (e, selectedLogo, index) => {
        this.modal.current.show(selectedLogo, index);
        e.preventDefault();
    }

    add = (name, address, link, image) => {
        this.props.addLogoIntoGroup(name, address, link, image);
        this.modal.current.hide();
    }
    update = (index, name, address, link, image) => {
        this.props.updateLogoInGroup(index, name, address, link, image);
        this.modal.current.hide();
    }
    remove = (e, index) => {
        this.props.removeLogoFromGroup(index);
        e.preventDefault();
    }
    swap = (e, index, isMoveUp) => {
        this.props.swapLogoInGroup(index, isMoveUp);
        e.preventDefault();
    }

    save = () => {
        const title = {
            vi: $('#logosViTitle').val().trim(),
            en: $('#logosEnTitle').val().trim(),
        };

        if (title.vi === '') {
            T.notify('Tên nhóm logo bị trống!', 'danger');
            $('#logosViTitle').focus();
        } else if (title.en === '') {
            T.notify('Name of logos group is empty!', 'danger');
            $('#logosEnTitle').focus();
        } else {
            const changes = {
                title: JSON.stringify(title),
                items: this.props.logo.item.items,
            };
            this.props.updateLogo(this.props.logo.item._id, changes);
        }
    }

    render() {
        let table = null,
            currentLogo = this.props.logo ? this.props.logo.item : null;
        if (currentLogo && currentLogo.items.length > 0) {
            table = (
                <table className='table table-hover table-bordered'>
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Tên</th>
                            <th style={{ width: '40%' }}>Địa chỉ</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Hình ảnh</th>
                            <th style={{ width: 'auto', textAlign: 'center' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentLogo.items.map((item, index) => {
                            const name = T.language.parse(item.name, true),
                                address = T.language.parse(item.address, true);
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href='#' onClick={e => this.showEditLogoModal(e, item, index)}>{name.vi}</a>
                                    </td>
                                    <td>{address.vi}</td>
                                    <td style={{ width: '20%', textAlign: 'center' }}>
                                        <img src={item.image} alt='logo' style={{ height: '32px' }} />
                                    </td>
                                    <td>
                                        <div className='btn-group'>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, true)}>
                                                <i className='fa fa-lg fa-arrow-up' />
                                            </a>
                                            <a className='btn btn-success' href='#' onClick={e => this.swap(e, index, false)}>
                                                <i className='fa fa-lg fa-arrow-down' />
                                            </a>
                                            <a className='btn btn-primary' href='#' onClick={e => this.showEditLogoModal(e, item, index)}>
                                                <i className='fa fa-lg fa-edit' />
                                            </a>
                                            <a className='btn btn-danger' href='#' onClick={e => this.remove(e, index)}>
                                                <i className='fa fa-lg fa-trash' />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })
                        }
                    </tbody>
                </table>
            );
        } else {
            table = <p>Không có logo!</p>;
        }
        const title = currentLogo && currentLogo.title ? T.language.parse(currentLogo.title, true) : { en: '<empty>', vi: '<Trống>' };
        return (
            <main className='app-content' >
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-bar-chart' /> Logo: Chỉnh sửa</h1>
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
                                    <a className='nav-link active show' data-toggle='tab' href='#logoViTab'>Việt Nam</a>
                                </li>
                                <li className='nav-item'>
                                    <a className='nav-link' data-toggle='tab' href='#logoEnTab'>English</a>
                                </li>
                            </ul>
                            <div className='tab-content'>
                                <div id='logoViTab' className='tab-pane fade show active'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='logosViTitle'>Tiêu đề</label>
                                        <input className='form-control col-6' type='text' placeholder='Tiêu đề' id='logosViTitle' defaultValue={title.vi} /><br />
                                    </div>
                                </div>
                                <div id='logoEnTab' className='tab-pane fade'>
                                    <div className='form-group mt-3'>
                                        <label className='control-label' htmlFor='logosEnTitle'>Title</label>
                                        <input className='form-control col-6' type='text' placeholder='Title' id='logosEnTitle' defaultValue={title.en} /><br />
                                    </div>
                                </div>
                            </div>
                            <div className='form-group'>
                                {table}
                            </div>
                        </div>
                        <div className='tile-footer'>
                            <div className='row'>
                                <div className='col-md-12' style={{ textAlign: 'right' }}>
                                    <button className='btn btn-info' type='button' onClick={this.showAddLogoModal}>
                                        <i className='fa fa-fw fa-lg fa-plus' /> Thêm
                                    </button>&nbsp;
                                    <button className='btn btn-primary' type='button' onClick={this.save}>
                                        <i className='fa fa-fw fa-lg fa-save' /> Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link to='/user/component' className='btn btn-secondary btn-circle' style={{ position: 'fixed', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>

                <LogoModal ref={this.modal} add={this.add} update={this.update} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ logo: state.logo });
const mapActionsToProps = { getLogoItem, updateLogo, addLogoIntoGroup, updateLogoInGroup, removeLogoFromGroup, swapLogoInGroup };
export default connect(mapStateToProps, mapActionsToProps)(LogoEditPage);