import React from 'react';
import { Link } from 'react-router-dom';
export default class ForumItem extends React.Component {
    state = {viewMore:false,defaultItemGetPage:3};
    
    render() {
        const {item} = this.props;
        const totalMessages = item.messages && item.messages.totalItem ? item.messages.totalItem :0;
        return ( 
        <div className='forum_item p-3 row'>
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
                    <img className='forum_image mr-2' src={item.user && item.user.image ? item.user.image :'img/avatar-default.png'} alt="" />
                    <div>
                        <p className='m-0'>Tác giả: {item.user ? `${item.user.lastname} ${item.user.firstname}`:''}</p>
                        <p className='m-0'>{item.createdDate?T.dateToText(item.createdDate,'dd/mm/yyyy, HH:mm'):''}</p>
                    </div>
                </div>
            </div>
            

        </div>
        );
    }
}