import React from 'react';
import { connect } from 'react-redux';
import { homeGetIntroVideo } from './redux/reduxIntroVideo';

class SectionVideo extends React.Component {
    state = {link:'',image:'',videoHeight:0,deviceWidth:0,isShowMenu:false};

    componentDidMount() {
        
        $(document).ready(() => {
            if (this.props.viewId) {
                this.props.homeGetIntroVideo(this.props.viewId, item => {
                    if (item) {
                        this.setState({ title: item.item.title, link: this.getSrcDrive(item.item.link), image: item.item.image });
                    }
                });
            }
            // UI
            let main = $('#main');
            let footer = $('#footer');
            let shadowBox = $('#shadowBoxVideo');
            // let introVideo = $('#introVideo');

            shadowBox.css('height',`${main.height()+footer.height()}px`);
            this.setState({videoHeight:window.innerHeight, deviceWidth:window.innerWidth});
            let currentHeight = window.scrollY;
            
            if(currentHeight>=window.innerHeight){
                main.css('position','relative');
                shadowBox.css('display','none');
            }

            main.css('position','fixed');
            $(window).on('scroll', () =>{
                let main = $('#main');
                let shadowBox = $('#shadowBoxVideo');
                let Y = window.scrollY;
                if(Y>=window.innerHeight){
                    // if(!this.state.doneScroll){
                    //     main.css('position','relative');
                    //     shadowBox.css('display','none');
                    //     // introVideo.css('height',0);
                    //     // introVideo.css('display','none');
                    //     introVideo.css('min-height','unset');
                    //     const body = $('html, body');
                    //     // body.stop().animate({scrollTop:0}, 1, 'swing');
                    //     this.setState({doneScroll:true});
                    // }
                    main.css('position','relative');
                        shadowBox.css('display','none');
                        // introVideo.css('height',0);
                        // introVideo.css('display','none');
                        // introVideo.css('min-height','unset');
                        // const body = $('html, body');
                    
                }
                else{
                    main.css('position','fixed');
                    shadowBox.css('display','block');
                }
                
            });
            window.addEventListener('resize',()=>{
                if( this.state.deviceWidth != window.innerWidth && Math.abs(this.state.deviceWidth-window.innerWidth)>50 ){// xử lý xoay ngang
                    this.setState({videoHeight:window.innerHeight,deviceWidth:window.innerWidth});
                }
            });
        });
    }

    scrollFullHeight = (e)=>{
        e.preventDefault();
        // window.scrollBy({top:window.innerHeight-window.scrollY,behavior:'smooth'})
        window.scrollTo({
            top:window.innerWidth<=991?this.state.videoHeight+50:this.state.videoHeight,// handle tabs menu on mobile
            behavior: 'smooth'
          });
    }

    getSrcDrive=id =>`https://drive.google.com/uc?export=download&id=${id}`

    render() {
        const {link,image} = this.state;
    return (
            <section id='introVideo' style={{display:'flex'}} className='section-video-intro flex-column justify-content-center align-items-center'>
                {/* <div className="overlay" style={{background:'transparent',opacity:0}}></div>
                {this.state.video?<iframe allow='loop;autoplay;allowfullscreen;mute' className="embed-responsive-item"id="ytplayer" type="text/html" style={{width:'100vw',height:'100vh'}} 
                src={this.state.video} frameborder="0" allowfullscreen={true}></iframe>:null} */}
            <div className="intro-video" style={{height:'100vh',overflowY:'hidden'}}>
                <video muted autoPlay loop style={{height:this.state.videoHeight}} poster = {image}>
                {link?<source src={link} type='video/mp4'/>:null}
                </video>
                            
                <a className="arrow" href='#' style={{top:this.state.videoHeight-60}} onClick={(e)=>this.scrollFullHeight(e)}>
                    <div></div>
                    <div></div>
                    <div></div>
                </a>
                
            </div>
            {/* <div className='intro-menu'>
                <ul className={`${this.state.isShowMenu?'intro-menu-move':''}`}>
                    <li>
                        <a href="#"><i class="fa fa-user" aria-hidden="true"></i>
                        Đăng nhập</a>
                    </li>
                    <li>
                        <a href='#'><i class='fa fa-paper-plane' aria-hidden='true'></i> 
                        Đăng ký tư vấn</a>
                    </li>
                    <li>
                        <a href='#'> <i className='fa fa-phone' aria-hidden='true'></i> 
                        Điện thoại</a>
                    </li>
                    <li>
                        <a href='#dangKyNhanTin'><i class='fa fa-comments' aria-hidden='true'></i> 
                        Liên hệ</a>
                    </li>
                </ul>
                <div className='d-flex justify-content-end'>
                    <a href='#' className='intro-menu-bar' onClick={()=>this.setState({isShowMenu:!this.state.isShowMenu})}>
                        <i className={this.state.isShowMenu?'fa fa-times':'fa fa-bars'} aria-hidden="true"></i>
                    </a>
                </div>
            </div> */}
            
            {/* <div id="shadowBoxVideo" style={{width:'100%',minHeight:'100vh',backgroundColor:this.state.color||'transparent'}}></div> */}
            </section>
        );
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { homeGetIntroVideo };
export default connect(mapStateToProps, mapActionsToProps)(SectionVideo);