import React from 'react';
import { debounce } from 'lodash';
import './dropdownFilter.scss';
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
    // had to handle 2 type of search: search local data in frontend and search ajax(or function)
    state = { selectedItem: [],tempSelectedItem:[],isFilted:false,filtered_data:[] }
    hasInit = false;

    componentDidMount() {
        $(document).ready(() => {
            this.props.item && this.setState({ selectedItem: [this.props.item] });
            
            this.search();
            $(this.dropDown).on('show.bs.dropdown', ()=> {
                // focus on searchBox
                setTimeout(()=> { $(this.searchBox).focus(); }, 100);
            });
            $(this.dropDown).on('hide.bs.dropdown', ()=> {
                // set selected item to temp, prevent select item but not filter.
                this.setState(prev=>({tempSelectedItem:prev.selectedItem}));
            });
        });
    }
    // componentDidUpdate(prevProps) {
    //     if (this.props.item && this.props.item !== prevProps.item) {
    //         this.setState({ selectedItem: this.props.item });
    //     }
    // }

    getAjaxData = (settings)=>{
        $.ajax({...settings,
            dataType:'json',
            success:(data)=>{
                console.log('data: ',data);
                const {results} = settings.processResults(data);
                this.setState({filtered_data:results});
            }
        });
    }

    select = (selectedItem) => {
        let tempSelectedState = this.state.tempSelectedItem;
        const isSelected = tempSelectedState.find(item=>item==selectedItem.id)!=undefined;
        if(isSelected){
            this.setState({ tempSelectedItem:tempSelectedState.filter(item=>item!=selectedItem.id)});
        }else{
            this.setState({tempSelectedItem:[...tempSelectedState,selectedItem.id]});
        }
    }

    filter = ()=>{
        this.setState(prev=>(
            {isFilted:prev.tempSelectedItem.length>0?true:false,
                selectedItem:[...prev.tempSelectedItem],
            }
            ),()=>{
            this.props.onSelected && this.props.onSelected(this.state.selectedItem.length?this.state.selectedItem:undefined);
        });
    }

    clear = ()=>{//Clear the selected data.
        this.state.isFilted && this.props.onSelected && this.props.onSelected(undefined);
        this.setState({selectedItem:[],tempSelectedItem:[],isFilted:false});
    }

    search = ()=>{
        const searchText = this.searchBox.value.toLowerCase().trim();
        const done=()=>{
            const items = this.props.items;
            if(!items){
                setTimeout(done,100);
            }else{
                if(Array.isArray(items)){
                    //sort in array
                    const filtered_data = items.filter(item=>{
                        let text = item.text.toLowerCase();
                        return text.indexOf(searchText) > -1; 
                    });
                    this.setState({filtered_data});
                }else{
                    // search with ajax
                    let getData = typeof items.data=='function'?()=>items.data:null;
                    let data =getData? getData():null; 
                    const value =data? data({term:searchText}):{...items.data,searchText};
                    this.getAjaxData(
                    {   ...items,
                        data:value
                    });
                }
            }
        };
        done();
    }

    debouncedSearch = debounce(() => {
        // do something
        this.search();
    }, 300);

    getSelectedItem = () => this.state.selectedItem ? this.state.selectedItem : {};

    render() {
        let { className = '', style = {}, menuStyle = {}, textStyle = {}, selectedItem = null, menuClassName='' } = this.props;
        // if (items == null) items = [];
        const {filtered_data=[]}=this.state;
        className += ' dropdown-toggle';
        menuClassName='dropdown-menu '+menuClassName;
        if (this.state.selectedItem) selectedItem = this.state.selectedItem;
        if (selectedItem == null) selectedItem = { value: '', text: '' };
        return (
            <span className='dropdown dropdown-filter' ref={e=>this.dropDown=e} style={{ whiteSpace: 'nowrap', ...style }}>
                <a ref={e => this.element = e} className={className} style={{textDecoration: 'none', ...textStyle,color:this.state.isFilted?'#1488db':'#fff' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>
                    {/* {typeof selectedItem == 'string' && selectedItem != '' ? selectedItem : (selectedItem.text || this.props.text || this.props.emptyText || '')} */}
                    <i className="fa fa-filter" aria-hidden="true"></i>
                </a>
                {/* {allowClear && this.state.isFilted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null} */}
                <div className={menuClassName} style={{ ...menuStyle }}>
                    {/* <div style = {{position:'relative'}}>
                        <select ref={e => this.input = e} multiple={false} disabled={false} onClick= {e=>e.stopPropagation()} />
                    </div> */}
                    
                    <input ref={e => this.searchBox = e} className='app-search__input' type='search' placeholder='Tìm kiếm' onChange = {this.debouncedSearch} />
                    <div className="dropdown-divider"></div>
                    <div style={{maxHeight: 270, overflowY: 'auto',minWidth:'100%'}}>
                        {filtered_data.length?filtered_data.map((item, index) =>
                            <a key={index} className='dropdown-item d-flex p-2 justify-content-between' href='#' onClick={e => e.preventDefault()|| e.stopPropagation() || this.select(item)}>
                                <span style={{whiteSpace:'normal'}}>{item.text ? item.text : item}</span>
                                <div className={'animated-checkbox'}>
                                        <input type='checkbox' checked={item.id && (this.state.tempSelectedItem.find(id=>id==item.id)!=undefined)} onChange={e=>e.preventDefault()} />
                                        <span className={'label-text'}></span>
                                </div>
                            </a>):<p className='p-2'>No results found</p>}
                    </div>
                    
                    <div className="dropdown-divider"></div>
                    <div className="d-flex">
                        <button className='btn btn-link text-danger' style={{ flex:'auto' }} type='button' onClick={this.clear}>
                            <i className='fa fa-times' /> Hủy
                        </button>
                        <button className='btn btn-link' style={{ flex:'auto',marginLeft:5 }} type='button' onClick = {this.filter}>
                            <i className='fa fa-filter' /> Lọc
                        </button>
                    </div>
                </div>
            </span>
        );
    }
}

export class DropdownSearch extends React.Component {
    state = { searchText:'',isFilted:false }

    componentDidMount() {
        $(document).ready(() => {
            $(this.dropDown).on('show.bs.dropdown', ()=> {
                // focus on input when open dropdown
                setTimeout(()=> { $(this.searchBox).focus(); }, 100);
            });
            $(this.searchBox).on('keypress',(e)=> {
                if(e.which == 13) {// press enter
                    this.filter();
                    $(this.element).dropdown('toggle');
                }
            });
        
        });
    }

    filter = () => {
        if(this.state.searchText!=''){
            this.setState({ isFilted:true }, () => {
                // $(this.element).html(selectedItem.text ? selectedItem.text : selectedItem);
                this.props.onSelected && this.props.onSelected(this.state.searchText);
            });
        }else{
            this.clear();
        }
        
    }

    clear = ()=>{//Clear searchText
        this.setState({searchText:'',isFilted:false},()=>{
            this.searchBox.value='';
            // $(this.element).html('');
            this.props.onSelected && this.props.onSelected(undefined);
        });
    }

    search = ()=>{
        this.setState({searchText:this.searchBox.value.trim()});
    }

    render() {
        let { className = '', menuStyle = {},allowClear=false, menuClassName='' } = this.props;
        className += ' dropdown-toggle';
        menuClassName='dropdown-menu '+menuClassName;
        return (
            <div className='dropdown dropdown-filter' style={{ whiteSpace: 'nowrap' }} ref={e=>this.dropDown=e}>
                <a ref={e => this.element = e} className={className} style={{ textDecoration: 'none',color:this.state.isFilted?'#1488db':'#fff' }} href='#' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'>
                    <i className="fa fa-filter" aria-hidden="true"></i>
                </a>
                {allowClear && this.state.isFilted?<i className='fa fa-times ml-1 text-danger' onClick = {this.clear} style={{cursor:'pointer'}} aria-hidden="true"></i>:null}
                <div className={menuClassName} style={{ maxHeight: 270, overflowY: 'auto', ...menuStyle }}>
                <input ref={e => this.searchBox = e} className='app-search__input' type='search' placeholder='Tìm kiếm' onChange = {this.search} />
                    <div className="dropdown-divider"></div>
                    <div className="d-flex">
                        <button className='btn btn-link text-danger' style={{ flex:'auto' }} type='button' onClick={this.clear}>
                            <i className='fa fa-times' /> Hủy
                        </button>
                        <button className='btn btn-link' style={{ flex:'auto',marginLeft:5 }} type='button' onClick = {this.filter}>
                            <i className='fa fa-filter' /> Lọc
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}