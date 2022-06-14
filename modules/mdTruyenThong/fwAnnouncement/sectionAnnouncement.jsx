import React from 'react';
import { connect } from 'react-redux';
import { getAnnouncementPageByUser } from './redux';
import { Link } from 'react-router-dom';
import './announcement.scss';

class SectionAnnouncement extends React.Component {
    state = {}
    componentDidMount() {
        $(document).ready(() => {
            this.props.getAnnouncementPageByUser(1,3,{type:'enroll'},()=>{
                T.ftcoAnimate();
                $(window).on('resize', this.handleResize);
            });
        });
        
        
        
    }
    handleResize = () => {
        this.setState({ viewport: $('.services').width() > 768 ? 'big' : 'small' });
        T.ftcoAnimate();
    }

    renderTypeItem = (item,index)=>{
        const link = item.link?`thong-bao/${item.link}`:`announcement/${item._id}`;
        return (
        <div key={index} className='team_col ftco-animate col-12 col-md-4 col-sm-6 mt-4'>
            <Link to={link} className='wrap_item'>
                <h5 className='text-white'>{item.title}</h5>
            </Link>
        </div>
    );}

    render() {
        const {list} = this.props.announcement && this.props.announcement.userPage ? this.props.announcement.userPage : {list:[]};
        return (
            <div className="announcement">
                <div className='container' >
                    <h3 className='text-title text-main'>Thông báo - chiêu sinh</h3>
                    <div className='row mt-4'>
                        {
                            list.map((item,index)=>this.renderTypeItem(item,index))
                        }
                    </div >
                    <div className="text-center mt-4">
                        <h5>
                            <Link to='/announcement' className="link_watch_more text-main">Xem thêm</Link>
                        </h5>
                    </div>
                </div>
            </div>
                
            
        );
    }
}

const mapStateToProps = state => ({ system: state.system, announcement: state.communication.announcement });
const mapActionsToProps = { getAnnouncementPageByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionAnnouncement);
