import React from 'react';
import { connect } from 'react-redux';
import { updateMenu, getMenu, createComponent, updateComponent, swapComponent, deleteComponent, getComponentViews } from './redux.jsx';
import { Link } from 'react-router-dom';
import ComponentModal from './componentModal.jsx';

class MenuEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            _id: null,
            priority: 1,
            title: '',
            view: 0,
            items: [],
            active: false,
        };

        this.modal = React.createRef();
        this.menuLink = React.createRef();
    }

    componentDidMount() {
        this.getData();
        T.ready('/user/menu');
    }

    getData = () => {
        const route = T.routeMatcher('/user/menu/edit/:menuId'),
            params = route.parse(window.location.pathname);

        this.props.getMenu(params.menuId, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/menu');
            } else if (data.menu) {
                const link = data.menu.link ? data.menu.link.toLowerCase() : '/';
                if (link.startsWith('http://') || link.startsWith('https://')) {
                    $(this.menuLink.current).html(link).attr('href', link);
                } else {
                    $(this.menuLink.current).html(T.rootUrl + link).attr('href', link);
                }

                this.setState(data.menu);
            } else {
                this.props.history.push('/user/menu');
            }
        });
    }
    changeActive = event => this.setState({ active: event.target.checked });

    menuLinkChange = event => {
        const link = event.target.value.toLowerCase();
        if (link.startsWith('http://') || link.startsWith('https://')) {
            $(this.menuLink.current).html(event.target.value).attr('href', event.target.value);
        } else {
            $(this.menuLink.current).html(T.rootUrl + event.target.value)
                .attr('href', event.target.value);
        }
    }

    save = () => {
        const changes = {
            title: JSON.stringify({ vi: $('#menuViTitle').val(), en: $('#menuEnTitle').val() }),
            link: $('#menuLink').val().trim(),
            active: this.state.active,
        };

        this.props.updateMenu(this.state._id, changes, () => $('#menuLink').val(changes.link));
    }

    showComponent = (e, parentId, component) => {
        this.modal.current.show(parentId, component);
        e.preventDefault();
    }
    createComponent = (parentId, data, done) => {
        this.props.createComponent(parentId, data, () => {
            this.getData();
            done();
        });
    }
    updateComponent = (_id, data, done) => {
        this.props.updateComponent(_id, data, () => {
            this.getData();
            done();
        });
    }
    swapComponent = (e, component, isMoveUp) => {
        this.props.swapComponent(component._id, isMoveUp, this.getData);
        e.preventDefault();
    }
    deleteComponent = (e, component) => {
        T.confirm('Xóa component', 'Bạn có chắc bạn muốn xóa component này?', 'warning', true, isConfirm =>
            isConfirm && this.props.deleteComponent(component._id, () => this.getData()));
        e.preventDefault();
    }

    renderComponents = (hasUpdate, level, components) => components.map((component, index) => {
        const buttons = [];
        if (hasUpdate) {
            buttons.push(
                <a key={0} className='btn btn-info' href='#' onClick={e => this.showComponent(e, component._id, null)}>
                    <i className='fa fa-lg fa-plus' />
                </a>);

            if (level > 0) {
                buttons.push(
                    <a key={1} className='btn btn-success' href='#' onClick={e => this.swapComponent(e, component, true)}>
                        <i className='fa fa-lg fa-arrow-up' />
                    </a>);
                buttons.push(
                    <a key={2} className='btn btn-success' href='#' onClick={e => this.swapComponent(e, component, false)}>
                        <i className='fa fa-lg fa-arrow-down' />
                    </a>);
            }

            buttons.push(
                <a key={3} className='btn btn-primary' href='#' onClick={e => this.showComponent(e, null, component)}>
                    <i className='fa fa-lg fa-edit' />
                </a>);

            if (level > 0) {
                buttons.push(
                    <a key={4} className='btn btn-danger' href='#' onClick={e => this.deleteComponent(e, component)}>
                        <i className='fa fa-lg fa-trash' />
                    </a>
                );
            }
        }

        const mainStyle = { padding: '0 6px', margin: '6px 0', color: '#000' };
        if (component.viewType) {
            if (component.viewType == 'carousel') {
                mainStyle.backgroundColor = '#ef9a9a';
            } else if (component.viewType == 'content') {
                mainStyle.backgroundColor = '#f48fb1';
            } else if (component.viewType == 'event feed') {
                mainStyle.backgroundColor = '#b39ddb';
            } else if (component.viewType == 'video') {
                mainStyle.backgroundColor = '#90caf9';
            } else if (component.viewType == 'statistic') {
                mainStyle.backgroundColor = '#b388ff';
            } else if (component.viewType == 'logo') {
                mainStyle.backgroundColor = '#ef9a9a';
            } else if (component.viewType == 'all news') {
                mainStyle.backgroundColor = '#82b1ff';
                component.viewName = '';
            } else if (component.viewType == 'slogan') {
                mainStyle.backgroundColor = '#b2ebf2';
            } else if (component.viewType == 'testimony') {
                mainStyle.backgroundColor = '#b2dfdb';
            } else if (component.viewType == 'all staffs') {
                mainStyle.backgroundColor = '#00bcd4';
                component.viewName = '';
            } else if (component.viewType == 'contact') {
                mainStyle.backgroundColor = '#c8e6f9';
                component.viewName = '';
            } else if (component.viewType == 'subscribe') {
                mainStyle.backgroundColor = '#c8e6c9';
                component.viewName = '';
            } else if (component.viewType == 'staff group') {
                mainStyle.backgroundColor = '#e6ee9c';
            } else if (component.viewType == 'last news') {
                mainStyle.backgroundColor = '#d7ccc8';
                component.viewName = '';
            } else if (component.viewType == 'event') {
                mainStyle.backgroundColor = '#ef9a9a';
            }else if (component.viewType == 'list video') {
                mainStyle.backgroundColor = '#ef9a9b';
            }else if (component.viewType == 'all courses') {
                mainStyle.backgroundColor = '#ef9a9c';
                component.viewName = '';
            }else if (component.viewType == 'last course') {
                mainStyle.backgroundColor = '#ef9a9a';
                component.viewName = '';
            }
        }
        let displayText = component.viewType + (component.viewName ? ' - ' + T.language.parse(component.viewName) + ' ' : '');
        if (component.className.trim() != '') displayText += ' (' + component.className.trim() + ')';

        return (
            <div key={index} data-level={level} className={'component ' + component.className} style={mainStyle}>
                <p style={{ width: '100%' }}>{displayText}</p>
                {component.components && component.components.length > 0 ? this.renderComponents(hasUpdate, level + 1, component.components) : ''}
                <div className='btn-group btn-group-sm control'>{buttons}</div>
            </div>
        );
    });

    render() {
        const currentPermissions = this.props.system && this.props.system.user && this.props.system.user.permissions ? this.props.system.user.permissions : [],
            hasUpdate = currentPermissions.includes('menu:write');
        const title = T.language.parse(this.state.title, true);
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className='fa fa-edit' /> Menu: Chỉnh sửa</h1>
                        <p dangerouslySetInnerHTML={{ __html: title.vi != '' ? 'Tiêu đề: <b>' + title.vi + '</b> - ' + T.dateToText(this.state.createdDate) : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <Link to='/user'><i className='fa fa-home fa-lg' /></Link>
                        &nbsp;/&nbsp;
                        <Link to='/user/menu'>Menu</Link>
                        &nbsp;/&nbsp;Chỉnh sửa
                    </ul>
                </div>
                <div className='row'>
                    <div className='col-md-6'>
                        <div className='tile'>
                            <h3 className='tile-title'>Thông tin chung</h3>
                            <div className='tile-body'>
                                <div className='form-group'>
                                    <label className='control-label'>Menu (VI)</label>
                                    <input className='form-control' type='text' placeholder='Menu (VI)' id='menuViTitle' defaultValue={title.vi} autoFocus={true} readOnly={!hasUpdate} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Menu (EN)</label>
                                    <input className='form-control' type='text' placeholder='Menu (EN)' id='menuEnTitle' defaultValue={title.en} readOnly={!hasUpdate} />
                                </div>
                                <div className='form-group'>
                                    <label className='control-label'>Link</label><br />
                                    <a href='#' ref={this.menuLink} style={{ fontWeight: 'bold' }} target='_blank' />
                                    <input className='form-control' id='menuLink' type='text' placeholder='Link' defaultValue={this.state.link} onChange={this.menuLinkChange} readOnly={!hasUpdate} />
                                </div>
                                <div className='form-group' style={{ display: 'flex' }}>
                                    <label className='control-label'>Kích hoạt: &nbsp;</label>
                                    <div className='toggle'>
                                        <label>
                                            <input type='checkbox' checked={this.state.active} onChange={(e) => hasUpdate && this.changeActive(e)} /><span className='button-indecator' />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            {hasUpdate ?
                                <div className='tile-footer'>
                                    <div className='row'>
                                        <div className='col-md-12' style={{ textAlign: 'right' }}>
                                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                                <i className='fa fa-fw fa-lg fa-check-circle'></i>Lưu
                                        </button>
                                        </div>
                                    </div>
                                </div> : null}
                        </div>
                    </div>
                    <div className='col-md-12'>
                        <div className='tile'>
                            <h3 className='tile-title'>Cấu trúc trang web</h3>
                            <div className='tile-body'>
                                {this.state.component ? this.renderComponents(hasUpdate, 0, [this.state.component]) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <Link to='/user/menu' className='btn btn-secondary btn-circle' style={{ position: 'fixed', lefft: '10px', bottom: '10px' }}>
                    <i className='fa fa-lg fa-reply' />
                </Link>
                {currentPermissions.includes('component:read') ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }}
                        onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}

                <ComponentModal onUpdate={this.updateComponent} onCreate={this.createComponent} getComponentViews={this.props.getComponentViews} ref={this.modal} />
            </main>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateMenu, getMenu, createComponent, updateComponent, swapComponent, deleteComponent, getComponentViews };
export default connect(mapStateToProps, mapActionsToProps)(MenuEditPage);
