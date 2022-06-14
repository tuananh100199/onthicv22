import React from 'react';
import { connect } from 'react-redux';
import inView from 'in-view';
import { getHomeForum,getHomeForumMessagePage,createForumMessage } from './redux';
// import NewsFeed from 'view/component/NewsFeed';
import { FormRichTextBox } from 'view/component/AdminPage';
import './forum.scss';

class NewsDetail extends React.Component {
    state = {_id:''};
    loading = false;

    constructor(props) {
        super(props);
        this.state = {
            viewMode: (T.cookie('viewMode') ? T.cookie('viewMode') : 'grid')
        };
    }

    ready = () => {
        inView('.listViewLoading').on('enter', () => {
            let userMessagePage = this.props.forum.userMessagePage;
            if (!this.loading && this.props.getHomeForumMessagePage && userMessagePage && userMessagePage.pageNumber < userMessagePage.pageTotal) {
                this.loading = true;
                this.props.getHomeForumMessagePage(userMessagePage.pageNumber + 1, T.defaultUserPageSize,{forum:this.state._id}, () => this.loading = false);
            }
        });
    }

    setViewMode = (e, viewMode) => {
        e.preventDefault();
        this.setState({ viewMode: viewMode });
        T.cookie('viewMode', viewMode);
    }

    componentDidMount() {
        const route = T.routeMatcher('/forums/bai-viet/:_id'),
                params = route.parse(window.location.pathname);
        if(params && params._id){
            this.setState({ _id: params._id });
            // this.props.getHomeForum(params._id,()=>{
            //     T.ftcoAnimate();
            // });
            this.props.getHomeForumMessagePage(1,T.defaultUserPageSize,{forum:params._id},()=>{
                T.ftcoAnimate();
            });
        }else{
            this.props.history.push('/forums');
        }
        

    }

    renderMessage = (item,index)=>{
        return (
        <div key={index} className='mt-4 d-flex'>
            <img className="forumMessage_avatar mr-2" src={item.user?item.user.image:'img/avatar.png'} alt={item.user?`${item.user.lastname} ${item.user.firstname}`:''} />

            <div className="forumMessage_content pl-2 pr-2">
                <p className='mb-0'>{item.user?`${item.user.lastname} ${item.user.firstname}`:''} {T.dateToText(item.modifiedDate,'dd/mm/yyyy, HH:mm:ss')}</p>
                <p>{item.content}</p>
            </div> 
        </div>);
    }

    sendMessage = (e)=>{
        e.preventDefault();
        const data = {
            content: this.itemContent.value(),
            state: this.itemState ? this.itemState.value() : 'waiting',
            forum: this.props._id,
        };

        if (data.content == '') {
            T.notify('Nội dung bài viết bị trống!', 'danger');
            this.itemContent.focus();
        }else{
            this.props.createForumMessage(data,()=>{
                // có thể làm 1 hàm trên redux để nhét item mới tạo này vào trực tiếp bên trong userMessagePage.list;
                this.itemContent.value('');
                T.alert('Bình luận của bạn đã được gửi thành công và  quản trị viên duyệt bình luận của bạn. Cảm ơn', 'success', false);
            });
        }
    }

    render() {
        const {user} = this.props.system;
        const permissionWriteMessage = user && user.permissions && (user.permissions.includes('user:login'));
        console.log({permissionWriteMessage});
        let {userMessagePage=null,forum} = this.props.forum,elements=[];
        
        if (userMessagePage) {
            elements = userMessagePage.list.map((item,index) => this.renderMessage(item,index));
        }

        if (userMessagePage && userMessagePage.pageNumber < userMessagePage.pageTotal) {
            elements.push(
                <div key={elements.length} style={{ width: '100%', textAlign: 'center' }}>
                    <img alt='Loading' className='listViewLoading' src='/img/loading.gif'
                        style={{ width: '48px', height: 'auto' }} onLoad={this.ready} />
                </div>
            );
        }

        if (forum == null) {
            return <p>...</p>;
        } else {
            return <>
                <div className='contact'>
                    <div className='container' style={{paddingTop:120,paddingBottom:50}}>
                        
                        <div className="d-flex justify-content-center ftco-animate">
                            {forum.video && forum.video.active?<iframe width="600" height="320"
                                src={`https://www.youtube.com/embed/${forum.video.link}`}>
                            </iframe>:''}
                        </div>
                        
                        <div className='row'>
                            <div className='col-12'>
                                <div className='contact_content'>
                                    <div className='contact_content_title ftco-animate'>{forum.title}</div>
                                    <div className='section_subtitle ftco-animate' style={{ lineHeight: 1.4 }}>{forum.abstract}</div>
                                    <div className='contact_info ftco-animate'>
                                        <p dangerouslySetInnerHTML={{ __html: forum.content }} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="forumMessage ftco-animate">
                            {(!user || !user._id) ?'Đăng nhập vào hệ thống để tham gia bình luận'
                            : !permissionWriteMessage ? 'Bạn không thể tham gia bình luận!'
                            :<div className='d-flex'>
                                <FormRichTextBox style={{flex:'auto'}} ref={e => this.itemContent = e} label='Phản hồi' />
                                <div className='d-flex flex-column ml-2'>
                                <button className='btn btn-success' onClick={e=>this.sendMessage(e)} style={{marginTop:30}}>Phản hồi <i className="fa fa-paper-plane-o" aria-hidden="true"></i></button>
                                <button onClick={e=>e.preventDefault&&this.itemContent.value('')} className='btn btn-danger mt-2'>Hủy <i className="fa fa-times" aria-hidden="true"></i></button>
                                </div>
                            </div>
                            }
                            {elements}
                        </div>
                    </div>
                </div>
            </>;
        }
    }
}

const mapStateToProps = state => ({ system:state.system ,forum: state.communication.forum });
const mapActionsToProps = { getHomeForum,getHomeForumMessagePage,createForumMessage };
export default connect(mapStateToProps, mapActionsToProps)(NewsDetail);