import React from 'react';
import { connect } from 'react-redux';
import { getAllVideos} from './redux/reduxVideo.jsx';
import { getListVideoItem } from './redux/reduxListVideo.jsx';
// import { backgroundImage } from 'html2canvas/dist/types/css/property-descriptors/background-image';

class SectionListVideo extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.listVideoId) {
            this.props.getListVideoItem(this.props.listVideoId, data => {
                    if (data.error) {
                       console.log('list các video trống')
                    } 
                    else if (data.item) { //id và title của list video
                        this.props.getAllVideos({ listVideoId : data.item._id }, (items) => {
                            if (items) {
                                this.setState({ item : data.item, items : items});
                                const done = () => {
                                    const elements = $('.popup-youtube, .popup-vimeo, .popup-gmaps');
                                    if (elements.length > 0) {
                                        $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                                            disableOn: 700,
                                            type: 'iframe',
                                            mainClass: 'mfp-fade',
                                            removalDelay: 160,
                                            preloader: false,
                                            fixedContentPos: false
                                        });
                                    } else {
                                        setTimeout(done, 100);
                                    }
                                };
                                done();
                            }
                        });
                    } else {
                        this.props.history.push('/user/component');
                    }
                
            });
        }
    }
    
    render() {
        let listVideo = Object.assign({});
        let noPadding = Object.assign({ padding: '0', margin: '0' });
        let videoTitle = Object.assign({ backgroundColor: '#4D983C', color: 'white', padding: '5px', marginBottom: '20px' });
        let arr = this.state.items;
        let firstItem = [];
        if (arr){
            firstItem = arr.splice(0,1);
        }
        else{
            console.log('không có list video !')
        }
        return this.state.items ? (
                <div className="container">
                    <div className="row">
                        <div style={{width: "100%", fontSize: "23px"}} >
                            <div style = {videoTitle} >
                                Video Clip
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{ padding: "5px", border: "1px solid #ccc", height: this.state.item.height + 20 + 'px'}}>
                        <div className="col-md-9" style={noPadding}>
                            {firstItem.map((item, index) => (
                                <div key={index} style={{height: "100%", padding: "5px"}}>
                                    <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                        <img style={{height: this.state.item.height + 'px'}} src= {`${item.image}`} />
                                    </a>`
                                </div>   
                                ))}     
                        </div>              
                        <div className="col-md-3" style={noPadding}>
                            <div className="custom-scroll" style = {{listVideo}, {height: this.state.item.height + 'px',color: 'white', overflowY: 'scroll',margin: "5px 0"}} >
                                {arr.map((item, index) => (
                                    <div key={index}>
                                        <div height="100%">
                                        <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                            <img height="85px"  src= {`${item.image}`} alt="xe-oto" />
                                        </a>
                                        </div>
                                    </div>     
                                ))}    
                            </div>
                        </div>                                                                  
                    </div   >
                </div>
        ) : '';
    }
}

const mapStateToProps = state => ({ video: state.video });
const mapActionsToProps = { getAllVideos, getListVideoItem };
export default connect(mapStateToProps, mapActionsToProps)(SectionListVideo);