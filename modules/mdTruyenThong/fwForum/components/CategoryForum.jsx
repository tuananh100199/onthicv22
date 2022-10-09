import React from 'react';
import { connect } from 'react-redux';
import { getForumHomePage } from '../redux';
import { Link } from 'react-router-dom';
import '../forum.scss';
import ForumItem from './ForumItem';
class CategoryForum extends React.Component {
    state = {viewMore:false,defaultItemGetPage:3};
    loading = false;

    componentDidMount() {
        const {category} = this.props;
        const defaultItemGetPage=this.state.defaultItemGetPage;
        category && this.props.getForumHomePage(1,defaultItemGetPage,{categoryId:category._id},page=>{
            const {list=[],totalItem} = page;
            this.setState({list,totalItem});
        });
    }

    renderForum = (item,index)=>{
        const totalMessages = item.messages && item.messages.totalItem ? item.messages.totalItem :0;
        return ( 
        <div key={index} className='forum_item p-3 row'>
            <div className="col-12 col-md-8">
                <div className="d-flex align-items-center">
                <i className="fa fa-comments forum_icon mr-2" aria-hidden="true"></i>
                <div>
                    <h6 className='m-0'><Link to={`/forums/bai-viet/${item._id}`}>{item.title}</Link></h6>
                    <p>Phản hồi: {totalMessages}</p>
                </div>
                </div>

            </div>

            <div className="col-12 col-md-4">
                <div className="d-flex align-items-center">
                    <img className='forum_image mr-2' src={item.user.image||'img/avatar-default.png'} alt="" />
                    <div>
                        <p className='m-0'>Tác giả: {item.user ? `${item.user.lastname} ${item.user.firstname}`:''}</p>
                        <p className='m-0'>{item.createdDate?T.dateToText(item.createdDate,'dd/mm/yyyy, HH:mm'):''}</p>
                    </div>
                </div>
            </div>
            

        </div>
        );
    }

    render() {
        const category = this.props.category;
        const {list,totalItem} = this.state;
        return (
            <div className='forum col-12'>
                <div className="forum_header">
                    <Link className='btn btn-link btn-main forum_title' to={`/forums/${category._id}`}>
                        Danh mục: {category?category.title:'...'} {`(${totalItem} bài viết)`}
                    </Link>
                </div>
                
                <div className="forum_body">
                    {/* {list ? list.length?list.map((forum,index)=>this.renderForum(forum,index)):<p className='p-4'>Chưa có bài viết nào</p>:'Loading ...'} */}
                    {list ? list.length?list.map((forum,index)=><ForumItem item={forum} key={index}/>):<p className='p-4'>Chưa có bài viết nào</p>:'Loading ...'}
                </div>
                
            </div>
        );
    }
}

const mapStateToProps = state => ({ system: state.system });
const mapActionsToProps = { getForumHomePage };
export default connect(mapStateToProps, mapActionsToProps)(CategoryForum);