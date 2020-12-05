import React from 'react';
import { connect } from 'react-redux';
import { getAllVideos} from './redux/reduxVideo.jsx';
import { getListVideoItem } from './redux/reduxListVideo.jsx';

class SectionListVideo extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.listVideoId) {
            this.props.getListVideoItem(this.props.listVideoId, data => {
                    if (data.error) {
                       console.log('list các video trống')
                    } 
                    else if (data.item) {
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
        let arr = this.state.items;
        let firstItem = [];
        if (arr) {
            firstItem = arr.splice(0,1);
        }
        return this.state.items ? (
            <div>
                <h3>Video clip</h3>
                <div className='row' style={{ padding: '5px',  height: this.state.item.height + 20 + 'px'}}>
                    <div className='col-md-9 p-0 m-0'>
                        {firstItem.map((item, index) => (
                            <div key={index} style={{height: '100%', padding: '5px'}}>
                                <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                    <img style={{ height: this.state.item.height + 'px' }} src={item.image} alt='videoImage' />
                                </a>
                            </div>
                        ))}
                    </div>
                    <div className='col-md-3 m-0 p-0'>
                        <div className='custom-scroll' style = {{ height: this.state.item.height + 'px', color: 'white', overflowY: 'auto', margin: '5px 0' }} >
                            {arr.map((item, index) => (
                                <div key={index}>
                                    <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                        <img height='85px' src= {item.image} alt='videoImage' />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : '';
    }
}

const mapStateToProps = state => ({ video: state.video });
const mapActionsToProps = { getAllVideos, getListVideoItem };
export default connect(mapStateToProps, mapActionsToProps)(SectionListVideo);