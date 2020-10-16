import React from 'react';

export default class Dropdown extends React.Component {
    constructor(props) {
        super(props);
        this.element = React.createRef();
        this.menu = React.createRef();
        
        this.state = { selectedItem: null }
    }
    
    componentDidMount() {
        T.ready(() => {
            if (this.props.item) {
                this.setState({ selectedItem: this.props.item });
            }
        });
    }
    
    select = (e, item) => {
        this.setState({ selectedItem: item }, () => {
            $(this.element.current).html(item.text ? item.text : item);
            this.props.onSelected && this.props.onSelected(item);
        });
        e.preventDefault();
    }
    
    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};
    
    setText = (item) => {
        this.setState({ selectedItem: item }, () => {
            // $(this.element.current).html(item.text || this.props.emptyText || '');
        });
    };
    
    setItems = (items) => {
        this.setState({ items });
    }
    
    render() {
        const items = this.state.items && this.state.items.length ? this.state.items : (this.props.items ? this.props.items : []),
            className = this.props.className ? this.props.className + ' dropdown-toggle' : 'dropdown-toggle', menuStyle = this.props.menuStyle || {};
        const selectedItem = this.state.selectedItem ? this.state.selectedItem : (this.props.item ? this.props.item : { value: '', text: '' });
        let dropdownItems = items.map((item, index) =>
            <a key={index} className='dropdown-item' href='#' onClick={e => this.select(e, item)}>
                {item.text ? item.text : item}
            </a>);
        
        return (
            <div className='dropdown' style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}>
                <a ref={this.element} className={className} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text|| this.props.emptyText || '')}
                </a>
                <div ref={this.menu} className='dropdown-menu' style={{ maxHeight: '85vh', overflowY: 'auto', ...menuStyle }}>
                    {dropdownItems}
                </div>
            </div>
        );
    }
}