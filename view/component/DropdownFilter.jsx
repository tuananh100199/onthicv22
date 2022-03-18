import React from 'react';

export class DropdownSelect extends React.Component {
    state = { selectedItem: null,isFilted:false }

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
        this.setState({ selectedItem,isFilted:true }, () => {
            $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
            this.props.onSelected && this.props.onSelected(selectedItem.id);
        });
    }

    clear = ()=>{//Clear the selected data.
        this.setState({selectedItem:'',isFilted:false},()=>{
            $(this.element).html('');
            this.props.onSelected && this.props.onSelected(undefined);
        });
    }

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', style = {}, menuStyle = {}, textStyle = {}, items = [], selectedItem = null,allowClear=false, menuClassName='' } = this.props;
        if (items == null) items = [];
        className += ' dropdown-toggle';
        menuClassName='dropdown-menu '+menuClassName;
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };

        return (
            <div className='dropdown' style={{ whiteSpace: 'nowrap', ...style }}>
                <a ref={e => this.element = e} className={className} style={{ textDecoration: 'none', ...textStyle,color:this.state.isFilted?'#1488db':'#fff' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')}
                </a>
                {allowClear && this.state.isFilted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null}
                <div className={menuClassName} style={{ maxHeight: '60vh', overflowY: 'auto', ...menuStyle,minWidth:200}}>
                    {items.map((item, index) =>
                        <a key={index} className='dropdown-item' href='#' style={{whiteSpace:'normal'}} onClick={e => e.preventDefault() || this.select(item)}>
                            {item.text ? item.text : item}
                        </a>)
                    }
                </div>
            </div>
        );
    }
}
export class DropdownSelectMulti extends React.Component {
    state = { selectedItem: {},isFilted:false }

    componentDidMount() {
        $(document).ready(() => {
            this.props.item && this.setState({ selectedItem: [this.props.item] });
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.item && this.props.item !== prevProps.item) {
            this.setState({ selectedItem: this.props.item });
        }
    }

    select = (selectedItem) => {
        console.log('select: ',selectedItem);
        // this.setState({ selectedItem,isFilted:true }, () => {
        //     // $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
        //     this.props.onSelected && this.props.onSelected(selectedItem);
        // });
        // this.setState(prevState=>({selectedItem:{...prevState.selectedItem,[selectedItem.id]:!prevState.selectedItem[selectedItem.id]}))
    }

    clear = ()=>{//Clear the selected data.
        this.setState({selectedItem:'',isFilted:false},()=>{
            // $(this.element).html('');
            this.props.onSelected && this.props.onSelected(undefined);
        });
    }

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', style = {}, menuStyle = {}, textStyle = {}, items = [], selectedItem = null,allowClear=false, menuClassName='' } = this.props;
        if (items == null) items = [];
        className += ' dropdown-toggle';
        menuClassName='dropdown-menu '+menuClassName;
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };
        return (
            <div className='dropdown dropdown-filter' style={{ whiteSpace: 'nowrap', ...style }}>
                <a ref={e => this.element = e} className={className} style={{ textDecoration: 'none', ...textStyle,color:this.state.isFilted?'#1488db':'#fff' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>
                    {/* {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')} */}
                </a>
                {allowClear && this.state.isFilted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null}
                <div className={menuClassName} style={{ maxHeight: '60vh', overflowY: 'auto', ...menuStyle,minWidth:250 }}>
                    {items.map((item, index) =>
                        <a key={index} className='dropdown-item d-flex' href='#' onClick={e => e.stopPropagation() || this.select(item)}>
                            <div className={'animated-checkbox'}>
                                <label>
                                    <input type='checkbox' checked={item && item.id && this.state.selectedItem && this.state.selectedItem.id==item.id} />
                                    <span className={'label-text'}></span>
                                </label>
                            </div>
                            <span style={{whiteSpace:'normal'}}>{item.text ? item.text : item}</span>
                        </a>)}
                    <div className="dropdown-divider"></div>
                    <div className="d-flex p-2">
                        <button className='btn btn-danger' style={{ flex:'auto' }} type='button'>
                            <i className='fa fa-times' /> Hủy
                        </button>
                        <button className='btn btn-primary' style={{ flex:'auto',marginLeft:10 }} type='button'>
                            <i className='fa fa-filter' /> Lọc
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export class DropdownSearch extends React.Component {
    // TODO: Làm lại, chỉ mới copy ra thôi
    state = { selectedItem: null,isFilted:false }

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
        this.setState({ selectedItem,isFilted:true }, () => {
            // $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
            this.props.onSelected && this.props.onSelected(selectedItem);
        });
    }

    clear = ()=>{//Clear the selected data.
        this.setState({selectedItem:'',isFilted:false},()=>{
            // $(this.element).html('');
            this.props.onSelected && this.props.onSelected(undefined);
        });
    }

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', style = {}, menuStyle = {}, textStyle = {}, items = [], selectedItem = null,allowClear=false, menuClassName='' } = this.props;
        if (items == null) items = [];
        className += ' dropdown-toggle';
        menuClassName='dropdown-menu '+menuClassName;
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };
        return (
            <div className='dropdown dropdown-filter' style={{ whiteSpace: 'nowrap', ...style }}>
                <a ref={e => this.element = e} className={className} style={{ textDecoration: 'none', ...textStyle,color:this.state.isFilted?'#1488db':'#fff' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>
                    {/* {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')} */}
                </a>
                {allowClear && this.state.isFilted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null}
                <div className={menuClassName} style={{ maxHeight: '60vh', overflowY: 'auto', ...menuStyle,minWidth:250 }}>
                    {items.map((item, index) =>
                        <a key={index} className='dropdown-item d-flex' href='#' onClick={e => e.stopPropagation() || this.select(item)}>
                            <div className={'animated-checkbox'}>
                                <label>
                                    <input type='checkbox' checked={item && item.id && this.state.selectedItem && this.state.selectedItem.id==item.id} />
                                    <span className={'label-text'}></span>
                                </label>
                            </div>
                            <span style={{whiteSpace:'normal'}}>{item.text ? item.text : item}</span>
                        </a>)}
                    <div className="dropdown-divider"></div>
                    <div className="d-flex p-2">
                        <button className='btn btn-danger' style={{ flex:'auto' }} type='button'>
                            <i className='fa fa-times' /> Hủy
                        </button>
                        <button className='btn btn-primary' style={{ flex:'auto',marginLeft:10 }} type='button'>
                            <i className='fa fa-filter' /> Lọc
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}