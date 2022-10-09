import React from 'react';
import { connect } from 'react-redux';
import { updateMenu, getMenu, createComponent, updateComponent, swapComponent, deleteComponent, getComponentViews } from './redux';
import { Link } from 'react-router-dom';
import { AdminPage, AdminModal, FormTextBox, FormSelect, FormCheckbox } from 'view/component/AdminPage';

class ComponentModal extends AdminModal {
    state = { viewType: '<empty>', adapter: null };
    componentDidMount() {
        $(document).ready(() => this.onShown(() => this.itemClassname.focus()));
        this.componentTypes = Object.keys(T.component).sort().map(key => ({ id: key, text: (T.component[key] && T.component[key].text) || key }));
    }

    onShow = ({ parentId, component }) => {
        console.log('component', component);
        const { _id, className, style, href, viewId, viewType } = component || { _id: null, className: '', style: '', href: '', viewId: null, viewType: '<empty>' };
        this.itemClassname.value(className);
        this.itemStyle.value(style);
        this.itemHref.value(href);
        this.itemViewTyle.value(viewType || '<empty>');

        this.setState({ _id, parentId, viewId: viewId || '' }, () => viewType && this.viewTypeChanged(viewType));
    }

    viewTypeChanged = (selectedType) => {
        const selectedComponent = T.component[selectedType];
        if (selectedComponent && selectedComponent.adapter && selectedComponent.getItem) {
            this.setState({ adapter: selectedComponent.adapter }, () => {
                selectedComponent.getItem(this.state.viewId, data => {
                    this.itemViewItem.value(data && data.item ? { id: this.state.viewId, text: data.item.title } : null);
                });
            });
        } else {
            this.setState({ adapter: null });
        }
    }

    onSubmit = () => {
        const { _id, parentId, viewId } = this.state,
            data = {
                viewType: this.itemViewTyle.value(),
                className: this.itemClassname.value().trim(),
                style: this.itemStyle.value(),
                href: this.itemHref.value(),
            };
            console.log('data', data);
        if (data.style) data.style = data.style.trim();
        if (viewId) data.viewId = viewId;

        if (_id) {
            this.props.onUpdate(_id, data, () => this.hide());
        } else {
            if (_id) data._id = _id;
            this.props.onCreate(parentId, data, () => this.hide());
        }
    }

    render = () => this.renderModal({
        title: 'Thành phần giao diện',
        body: <>
            <FormTextBox ref={e => this.itemClassname = e} label='Classname' readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemStyle = e} label='Style' smallText='Ví dụ: <strong>marginTop: 50px; backgroundColor: red</strong> <br/> (Các style cách nhau bởi dấu chấm phẩy &apos;;&apos;)' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemViewTyle = e} label='Loại thành phần' data={this.componentTypes} onChange={data => this.viewTypeChanged(data.id)} readOnly={this.props.readOnly} />
            <FormTextBox ref={e => this.itemHref = e} label='Id của thành phần' smallText='Ví dụ: #dangKyTuVan' readOnly={this.props.readOnly} />
            <FormSelect ref={e => this.itemViewItem = e} label='Tên thành phần' data={this.state.adapter} onChange={data => this.setState({ viewId: data.id })} readOnly={this.props.readOnly}
                style={{ display: this.state.adapter ? 'block' : 'none' }} />
        </>,
    });
}

class MenuEditPage extends AdminPage {
    state = { _id: null, priority: 1, title: '', link: '', view: 0, items: [], active: false };
    menuId = null;

    componentDidMount() {
        T.ready('/user/menu', () => {
            const route = T.routeMatcher('/user/menu/:menuId'),
                params = route.parse(window.location.pathname);
            this.menuId = params.menuId;
            this.getData();
        });
    }

    getData = () => {
        this.props.getMenu(this.menuId, data => {
            if (data.error) {
                T.notify('Lấy thông tin menu bị lỗi!', 'danger');
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
        let displayText = '<empty>',
            mainStyle = { padding: '0 6px', margin: '6px 0', color: '#000' },
            componentClassName = component.className.trim();
        if (component.viewType && T.component[component.viewType]) {
            const { text, backgroundColor } = T.component[component.viewType];
            displayText = text || component.viewType;
            mainStyle.backgroundColor = backgroundColor;
        }
        displayText += (component.viewName && component.viewName !== '<empty>' ? `: ${component.viewName} ` : '') + (componentClassName ? ` (${componentClassName})` : '');

        return (
            <div key={index} data-level={level} className={'component ' + component.className} style={mainStyle}>
                <p style={{ width: '100%' }}>{displayText}</p>
                {component.components && component.components.length > 0 ? this.renderComponents(hasUpdate, level + 1, component.components) : ''}
                {hasUpdate ?
                    <div className='btn-group btn-group-sm control'>
                        <a className='btn btn-info' href='#' onClick={e => this.showComponent(e, component._id, null)}>
                            <i className='fa fa-lg fa-plus' />
                        </a>
                        {level ?
                            <a className='btn btn-success' href='#' onClick={e => this.swapComponent(e, component, true)}>
                                <i className='fa fa-lg fa-arrow-up' />
                            </a> : null}
                        {level ? <a className='btn btn-success' href='#' onClick={e => this.swapComponent(e, component, false)}>
                            <i className='fa fa-lg fa-arrow-down' />
                        </a> : null}
                        <a className='btn btn-primary' href='#' onClick={e => this.showComponent(e, null, component)}>
                            <i className='fa fa-lg fa-edit' />
                        </a>
                        {level ?
                            <a className='btn btn-danger' href='#' onClick={e => this.deleteComponent(e, component)}>
                                <i className='fa fa-lg fa-trash' />
                            </a> : null}
                    </div> : null}
            </div>
        );
    });

    render() {
        const permission = this.getUserPermission('menu');
        const { title, link, createdDate } = this.state;
        const linkLabel = link == '' ? 'Link' :
            (link.startsWith('http://') || link.startsWith('https://') ?
                <>Link: <a href={link} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{link}</a></> :
                <>Link: <a href={T.rootUrl + link} style={{ fontWeight: 'bold' }} target='_blank' rel='noreferrer'>{T.rootUrl + link}</a></>);
        return this.renderPage({
            icon: 'fa fa-bars',
            title: `Menu: ${title || ''}${createdDate ? ' (' + T.dateToText(createdDate) + ')' : ''}`,
            breadcrumb: [<Link key={0} to='/user/menu'>Menu</Link>, 'Chỉnh sửa'],
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
