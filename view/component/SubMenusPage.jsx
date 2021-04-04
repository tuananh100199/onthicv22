import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

const nonAccentVietnamese = str => str.toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
    .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentHatVietnamese = str => str.toLowerCase()
    .replace(/â|ă/g, 'a')
    .replace(/à|ầ|ằ/g, 'à')
    .replace(/á|ấ|ắ/g, 'á')
    .replace(/ả|ẩ|ẳ/g, 'ả')
    .replace(/ã|ẫ|ẵ/g, 'ã')
    .replace(/ạ|ậ|ặ/g, 'ạ')
    .replace(/ê/g, 'e')
    .replace(/è|ề/g, 'è')
    .replace(/é|ế/g, 'é')
    .replace(/ẻ|ể/g, 'ẻ')
    .replace(/ẽ|ễ/g, 'ẽ')
    .replace(/ẹ|ệ/g, 'ẹ')
    .replace(/ô|ơ/g, 'o')
    .replace(/ò|ồ|ờ/g, 'ò')
    .replace(/ó|ố|ớ/g, 'ó')
    .replace(/ỏ|ổ|ở/g, 'ỏ')
    .replace(/õ|ỗ|ỗ/g, 'õ')
    .replace(/ọ|ộ|ợ/g, 'ọ')
    .replace(/ư/g, 'u')
    .replace(/ù|ừ/g, 'ù')
    .replace(/ú|ứ/g, 'ú')
    .replace(/ủ|ử/g, 'ủ')
    .replace(/ũ|ữ/g, 'ũ')
    .replace(/ụ|ự/g, 'ụ')
    .replace(/đ/g, 'd')
    .replace(/\u02C6|\u0306|\u031B/g, '');

const removeAccentMarksVietnamese = str => str.toLowerCase()
    .replace(/à|á|ả|ã|ạ/g, 'a')
    .replace(/ằ|ắ|ẳ|ẵ|ặ/g, 'ă')
    .replace(/ầ|ấ|ẩ|ẫ|ậ/g, 'â')
    .replace(/è|é|ẻ|ẽ|ẹ/g, 'e')
    .replace(/ề|ế|ể|ễ|ệ/g, 'ê')
    .replace(/ì|í|ỉ|ĩ|ị/g, 'i')
    .replace(/ò|ó|ỏ|õ|ọ/g, 'o')
    .replace(/ờ|ớ|ở|ỡ|ợ/g, 'ơ')
    .replace(/ồ|ố|ổ|ỗ|ộ/g, 'ô')
    .replace(/ù|ú|ủ|ũ|ụ/g, 'u')
    .replace(/ừ|ứ|ử|ữ|ự/g, 'ư')
    .replace(/ỳ|ý|ỷ|ỹ|ỵ/g, 'y')
    .replace(/\u0300|\u0301|\u0309|\u0303|\u0323/g, '');

const compareSearch = (item, searchValue) => {
    item = item.toLowerCase();
    searchValue = searchValue.toLowerCase();
    if (item.includes(searchValue)) {
        return true;
    } else if (!nonAccentVietnamese(item).includes(nonAccentVietnamese(searchValue))) {
        return false;
    } else {
        return (nonAccentVietnamese(item).includes(searchValue) ||
            removeAccentMarksVietnamese(item).includes(searchValue) ||
            removeAccentHatVietnamese(item).includes(searchValue));
    }
}

class SubMenusPage extends React.Component {
    state = { mode: 'normal' };
    searchBox = React.createRef();

    componentDidMount() {
        T.ready(this.props.menuLink, () => {
            this.searchBox.current.focus();
            if (this.props.ready) this.props.ready();
            const getMenu = () => {
                const menu = this.props.system && this.props.system.user ? this.props.system.user.menu[this.props.menuKey] : null;
                if (menu) {
                    const menuState = T.storage('menuKey' + this.props.menuKey);
                    Object.keys(menu.menus).forEach(key => {
                        menu.menus[key].key = key;
                        if (menuState[key] == null) menuState[key] = true;
                    });
                    T.storage('menuKey' + this.props.menuKey, menuState);
                    this.setState({ menuState, parentMenu: menu.parentMenu, menus: Object.values(menu.menus) });
                } else {
                    setTimeout(getMenu, 500);
                }
            }
            getMenu();
        });
    }

    search = (e, searchValue) => {
        e.preventDefault();
        const menus = this.state.menus.slice();
        for (let i = 0; i < menus.length; i++)
            menus[i].show = compareSearch(menus[i].title, searchValue);
        this.setState({ menus });
    }

    clearSearch = e => {
        if (this.searchBox.current.value) {
            this.searchBox.current.value = '';
            this.search(e, '');
        }
    }

    menuClick = (e, item) => {
        e.preventDefault();
        this.props.history.push(item.link);
    }

    changeIconState = (e, item) => {
        e.preventDefault();
        const menuState = this.state.menuState;
        menuState[item.key] = !menuState[item.key];
        this.setState({ menuState });
    }
    selectAllIcons = (value) => {
        const menuState = this.state.menuState;
        Object.keys(menuState).forEach(key => menuState[key] = value)
        this.setState({ menuState });
    }
    cancelUserPage = () => {
        const menuState = T.storage('menuKey' + this.props.menuKey);
        this.setState({ mode: 'normal', menuState });
    }
    saveUserPage = () => {
        const menuState = this.state.menuState;
        T.storage('menuKey' + this.props.menuKey, menuState);
        this.setState({ mode: 'normal' });
    }

    render() {
        const { mode, menuState, parentMenu, menus } = this.state;
        const isEditMode = mode == 'edit';
        const noGroup = parentMenu && (parentMenu.groups == null || parentMenu.groups.length == 0);
        return (
            <main className='app-content'>
                <div className='app-title'>
                    <div>
                        <h1><i className={'fa ' + this.props.headerIcon} /> {this.props.customTitle ? this.props.customTitle : parentMenu ? parentMenu.title : ''}</h1>
                        <p dangerouslySetInnerHTML={{ __html: this.props.customBelowTitle ? `Hạng : ${this.props.customBelowTitle}` : '' }} />
                    </div>
                    <ul className='app-breadcrumb breadcrumb'>
                        <div style={{ position: 'relative', border: '1px solid #ddd', marginRight: 6 }} onClick={this.clearSearch}>
                            <input ref={this.searchBox} className='app-search__input' style={{ width: '30vw', outline: 'none' }} type='search' placeholder='Tìm kiếm' onChange={e => this.search(e, e.target.value)} />
                            <a href='#' style={{ position: 'absolute', top: 6, right: 9 }}>
                                <i className='fa fa-search' />
                            </a>
                        </div>
                    </ul>
                </div>

                {parentMenu && menus ? (parentMenu.groups || ['']).map((groupText, groupIndex) => {
                    const groupMenus = [];
                    menus.forEach((item, index) => {
                        if ((item.show == null || item.show == true) && (noGroup || (item.groupIndex == null || item.groupIndex == groupIndex)) && (isEditMode || menuState[item.key])) {
                            groupMenus.push(
                                <a key={index} href='#' className='col-md-6 col-lg-4' onClick={e => isEditMode ? this.changeIconState(e, item) : this.menuClick(e, item)}>
                                    <div className='widget-small coloured-icon'>
                                        <i style={{ backgroundColor: menuState[item.key] ? item.backgroundColor || '#00b0ff' : '#aaa' }} className={'icon fa fa-3x ' + (item.icon || 'fa-tasks')} />
                                        <div className='info'>
                                            <p>{item.title}</p>
                                            {isEditMode ? <i className={'fa fa-lg ' + (menuState[item.key] ? 'fa-check text-success' : 'fa-times text-danger')} style={{ position: 'absolute', right: 24, top: 12 }} /> : null}
                                        </div>
                                    </div>
                                </a>
                            );
                        }
                    });
                    return groupMenus.length ? (
                        <div key={groupIndex} className='row'>
                            {groupText ? <h4 className='col-12'>{groupText}</h4> : null}
                            {groupMenus}
                        </div>
                    ) : null;
                }) : null}

                {isEditMode ?
                    <React.Fragment>
                        <button type='button' className='btn btn-danger btn-circle' title='Ẩn tất cả' style={{ position: 'fixed', right: '200px', bottom: '10px' }} onClick={() => this.selectAllIcons(false)}>
                            <i className='fa fa-lg fa-times' />
                        </button>
                        <button type='button' className='btn btn-success btn-circle' title='Hiện tất cả' style={{ position: 'fixed', right: '140px', bottom: '10px' }} onClick={() => this.selectAllIcons(true)}>
                            <i className='fa fa-lg fa-check' />
                        </button>
                        <button type='button' className='btn btn-secondary btn-circle' title='Trở về' style={{ position: 'fixed', right: '70px', bottom: '10px' }} onClick={this.cancelUserPage}>
                            <i className='fa fa-lg fa-reply' />
                        </button>
                        <button type='button' className='btn btn-primary btn-circle' title='Lưu chỉnh sửa' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={this.saveUserPage}>
                            <i className='fa fa-lg fa-save' />
                        </button>
                    </React.Fragment> :
                    <button type='button' className='btn btn-primary btn-circle' title='Chỉnh sửa giao diện' style={{ position: 'fixed', right: '10px', bottom: '10px' }} onClick={() => this.setState({ mode: 'edit' })}>
                        <i className='fa fa-lg fa-edit' />
                    </button>}
            </main>);
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = {};
export default connect(mapStateToProps, mapActionsToProps)(withRouter(SubMenusPage));