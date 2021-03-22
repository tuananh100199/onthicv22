import React from 'react';
import { connect } from 'react-redux';
import { updateMenu, getMenu, createComponent, updateComponent, swapComponent, deleteComponent, getComponentViews } from './redux';
import { Link } from 'react-router-dom';
import ComponentModal from './componentModal';
import { AdminPage, FormTextBox, FormCheckbox } from 'view/component/AdminPage';

class MenuEditPage extends AdminPage {
    state = { _id: null, priority: 1, title: '', link: '', view: 0, items: [], active: false };
    menuId = null;

    componentDidMount() {
        T.ready('/user/menu', () => {
            const route = T.routeMatcher('/user/menu/edit/:menuId'),
                params = route.parse(window.location.pathname);
            this.menuId = params.menuId;
            this.getData();
        });
    }

    getData = () => {
        this.props.getMenu(this.menuId, data => {
            if (data.error) {
                T.notify('Lấy tin tức bị lỗi!', 'danger');
                this.props.history.push('/user/menu');
            } else if (data.menu) {
                this.setState(data.menu);
                this.itemTitle.value(data.menu.title);
                this.itemLink.value(data.menu.link);
                this.itemActive.value(data.menu.active);
            } else {
                this.props.history.push('/user/menu');
            }
        });
    }
    changeActive = e => this.setState({ active: e.target.checked });

    save = () => {
        const changes = {
            title: this.itemTitle.value(),
            link: this.itemLink.value(),
            active: this.itemActive.value(),
        };
        this.props.updateMenu(this.state._id, changes, () => $('#menuLink').val(changes.link));
    }

    showComponent = (e, parentId, component) => e.preventDefault() || this.modal.show({ parentId, component });
    createComponent = (parentId, data, done) => this.props.createComponent(parentId, data, () => this.getData() || done());
    updateComponent = (_id, data, done) => this.props.updateComponent(_id, data, () => this.getData() || done());
    swapComponent = (e, component, isMoveUp) => e.preventDefault() || this.props.swapComponent(component._id, isMoveUp, this.getData);
    deleteComponent = (e, component) => e.preventDefault() || T.confirm('Xóa component', 'Bạn có chắc bạn muốn xóa component này?', 'warning', true, isConfirm =>
        isConfirm && this.props.deleteComponent(component._id, () => this.getData()));

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
            }
            else if (component.viewType == 'dangKyTuVan') {
                mainStyle.backgroundColor = '#c8e6f9';
            }
            else if (component.viewType == 'subscribe') {
                mainStyle.backgroundColor = '#c8e6c9';
                component.viewName = '';
            } else if (component.viewType == 'staff group') {
                mainStyle.backgroundColor = '#e6ee9c';
            } else if (component.viewType == 'last news') {
                mainStyle.backgroundColor = '#d7ccc8';
                component.viewName = '';
            } else if (component.viewType == 'list video') {
                mainStyle.backgroundColor = '#ef9a9b';
            } else if (component.viewType == 'all courses') {
                mainStyle.backgroundColor = '#ef9a9c';
                component.viewName = '';
            } else if (component.viewType == 'last course') {
                mainStyle.backgroundColor = '#ef9a9a';
                component.viewName = '';
            } else if (component.viewType == 'list contents') {
                mainStyle.backgroundColor = '#fb6094';
                component.viewName = '';
            } else if (component.viewType == 'all course types') {
                mainStyle.backgroundColor = '#fb3553';
                component.viewName = '';
            }
        }
        let displayText = component.viewType + (component.viewName ? ` - ${component.viewName} ` : '');
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
        const permission = this.getUserPermission('menu');
        const { title, link, createdDate } = this.state;
        const linkLabel = link == '' ? 'Link' :
            (link.startsWith('http://') || link.startsWith('https://') ?
                <>Link: <a href={link} style={{ fontWeight: 'bold' }} target='_blank'>{link}</a></> :
                <>Link: <a href={T.rootUrl + link} style={{ fontWeight: 'bold' }} target='_blank'>{T.rootUrl + link}</a></>);
        return this.renderPage({
            icon: 'fa fa-bars',
            title: `Menu: ${title || ''}${createdDate ? ' (' + T.dateToText(createdDate) + ')' : ''}`,
            breadcrumb: [<Link to='/user/menu'>Menu</Link>, 'Chỉnh sửa'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Thông tin chung</h3>
                    <div className='tile-body row'>
                        <FormTextBox ref={e => this.itemTitle = e} className='col-md-6' label='Menu' onChange={e => this.setState({ title: e.target.value })} readOnly={!permission.write} />
                        <FormTextBox ref={e => this.itemLink = e} className='col-md-6' label={linkLabel} onChange={e => this.setState({ link: e.target.value })} readOnly={!permission.write} />
                        <FormCheckbox ref={e => this.itemActive = e} className='col-md-6' label='Kích hoạt' readOnly={!permission.write} />
                    </div>
                    {permission.write ?
                        <div className='tile-footer' style={{ textAlign: 'right' }}>
                            <button className='btn btn-primary' type='button' onClick={this.save}>
                                <i className='fa fa-fw fa-lg fa-save' /> Lưu
                            </button>
                        </div> : null}
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>Cấu trúc trang web</h3>
                    <div className='tile-body'>
                        {this.state.component ? this.renderComponents(permission.write, 0, [this.state.component]) : null}
                    </div>
                </div>

                {permission.read ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}

                <ComponentModal ref={e => this.modal = e} getComponentViews={this.props.getComponentViews} readOnly={!permission.write}
                    onUpdate={this.updateComponent} onCreate={this.createComponent} />
            </>,
            backRoute: '/user/menu',
        });
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { updateMenu, getMenu, createComponent, updateComponent, swapComponent, deleteComponent, getComponentViews };
export default connect(mapStateToProps, mapActionsToProps)(MenuEditPage);
