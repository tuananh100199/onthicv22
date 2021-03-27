import React from 'react';

export default class Dropdown extends React.Component {
    state = { selectedItem: null }

    componentDidMount() {
        T.ready(() => {
            this.props.item && this.setState({ selectedItem: this.props.item });
        });
    }

    select = (selectedItem) => {
        this.setState({ selectedItem }, () => {
            $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
            this.props.onSelected && this.props.onSelected(selectedItem);
        });
    }

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', menuStyle = {}, items = [], selectedItem = null } = this.props;
        if (items == null) items = [];
        className += ' dropdown-toggle';
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };

        return (
            <div className='dropdown' style={{ whiteSpace: 'nowrap', textDecoration: 'none', ...(this.props.style || {}) }}>
                <a ref={e => this.element = e} className={className} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')}
                </a>
                <div className='dropdown-menu' style={{ maxHeight: '85vh', overflowY: 'auto', ...menuStyle }}>
                    {items.map((item, index) =>
                        <a key={index} className='dropdown-item' href='#' onClick={e => e.preventDefault() || this.select(item)}>
                            {item.text ? item.text : item}
                        </a>)}
                </div>
            </div>
        );
    }
}