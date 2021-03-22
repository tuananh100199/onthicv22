import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu } from './redux';
import { AdminPage } from 'view/component/AdminPage';

class MenuPage extends AdminPage {
    componentDidMount() {
        this.props.getAll();
        T.ready(() => {
            $('.menuList').sortable({ update: () => this.updateMenuPriorities() });
            $('.menuList').disableSelection();
        });
    }

    create = (e) => e.preventDefault() || this.props.createMenu(null, data => this.props.history.push('/user/menu/edit/' + data.item._id));

    createChild = (e, item) => e.preventDefault() || this.props.createMenu(item._id, data => this.props.history.push('/user/menu/edit/' + data.item._id));

    updateMenuPriorities = () => {
        const changes = [];
        for (let i = 0, priority = 0, list1 = $('#menuMain').children(); i < list1.length; i++) {
            let menu = list1.eq(i);
            priority++;
            changes.push({ _id: menu.attr('data-id'), priority });

            let list2 = menu.children();
            if (list2.length > 1) {
                list2 = list2.eq(1).children();
                for (let j = 0; j < list2.length; j++) {
                    priority++;
                    changes.push({ _id: list2.eq(j).attr('data-id'), priority });
                }
            }
        }
        this.props.updateMenuPriorities(changes);
    }

    changeActive = (e, item) => e.preventDefault() || this.props.updateMenu(item._id, { active: !item.active });

    delete = (e, item) => e.preventDefault() || T.confirm('Xóa menu', 'Bạn có chắc bạn muốn xóa menu này?', true, isConfirm =>
        isConfirm && this.props.deleteMenu(item._id));

    renderMenu = (menu, level, hasUpdate, hasDelete) => (
        <li key={menu._id} data-id={menu._id}>
            <div style={{ display: 'inline-flex' }}>
                <Link to={'/user/menu/edit/' + menu._id} style={{ color: menu.active ? '#009688' : 'gray' }}>
                    {menu.title}
                </Link>&nbsp;
                {menu.link ? <p>(<a href={menu.link} target='_blank' style={{ color: 'blue' }}>{menu.link}</a>)</p> : null}

                <div className='buttons btn-group btn-group-sm'>
                    {hasUpdate && level == 0 ?
                        <a className='btn btn-info' href='#' onClick={e => this.createChild(e, menu)}>
                            <i className='fa fa-lg fa-plus' />
                        </a> : null}
                    <a href='#' className={menu.active ? 'btn btn-warning' : 'btn btn-secondary'} onClick={e => hasUpdate && this.changeActive(e, menu)}>
                        <i className={'fa fa-lg ' + (menu.active ? 'fa-check' : 'fa-times')} />
                    </a>
                    <Link to={'/user/menu/edit/' + menu._id} className='btn btn-primary'>
                        <i className='fa fa-lg fa-edit' />
                    </Link>
                    {hasDelete ?
                        <a className='btn btn-danger' href='#' onClick={e => this.delete(e, menu)}>
                            <i className='fa fa-lg fa-trash' />
                        </a> : null}
                </div>
            </div>

            {menu.submenus ? (
                <ul className='menuList'>
                    {menu.submenus.map(subMenu => this.renderMenu(subMenu, level + 1, hasUpdate, hasDelete))}
                </ul>
            ) : null}
        </li>);

    render() {
        const permissionMenu = this.getUserPermission('menu'),
            permissionComponent = this.getUserPermission('component');
        return this.renderPage({
            icon: 'fa fa-bars',
            title: 'Menu',
            breadcrumb: ['Menu'],
            content: <>
                <div className='tile'>
                    <ul id='menuMain' className='menuList' style={{ width: '100%', paddingLeft: 20, margin: 0 }}>
                        {(this.props.menu ? this.props.menu : []).map(menu => this.renderMenu(menu, 0, permissionMenu.write, permissionMenu.delete))}
                    </ul>
                </div>
                {/* {permissionMenu.write ?
                    <button type='button' className='btn btn-danger btn-circle' style={{ position: 'fixed', bottom: '10px' }} onClick={this.props.buildMenu}>
                        <i className='fa fa-lg fa-refresh' />
                    </button> : null} */}
                {permissionComponent.read ?
                    <button type='button' className='btn btn-info btn-circle' style={{ position: 'fixed', right: '66px', bottom: '10px' }} onClick={() => this.props.history.push('/user/component')}>
                        <i className='fa fa-lg fa-cogs' />
                    </button> : null}
            </>,
            onCreate: permissionMenu.write ? this.create : null,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, menu: state.menu });
const mapActionsToProps = { getAll, createMenu, updateMenuPriorities, updateMenu, deleteMenu, buildMenu };
export default connect(mapStateToProps, mapActionsToProps)(MenuPage);