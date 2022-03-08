import React from 'react';

export default class Dropdown extends React.Component {
    state = { selectedItem: null,isSeleted:false }

    componentDidMount() {
        $(document).ready(() => {
            this.props.item && this.setState({ selectedItem: this.props.item });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.item && this.props.item !== prevProps.item) {
            this.setState({ selectedItem: this.props.item });
        }
    }

    select = (selectedItem) => {
        this.setState({ selectedItem,isSeleted:true }, () => {
            $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
            this.props.onSelected && this.props.onSelected(selectedItem);
        });
    }

    clear = ()=>{//Clear the selected data.
        this.setState({selectedItem:'',isSeleted:false},()=>{
            $(this.element).html('');
            this.props.onSelected && this.props.onSelected(undefined);
        });
    }

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', style = {}, menuStyle = {}, textStyle = {}, items = [], selectedItem = null,allowClear=false } = this.props;
        if (items == null) items = [];
        className += ' dropdown-toggle';
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };

        return (
            <div className='dropdown' style={{ whiteSpace: 'nowrap', ...style }}>
                <a ref={e => this.element = e} className={className} style={{ textDecoration: 'none', ...textStyle }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')}
                </a>
                {allowClear && this.state.isSeleted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null}
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