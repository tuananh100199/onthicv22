import React from 'react';
import { connect } from 'react-redux';
import { getAllVideosByUser } from './redux/reduxVideo.jsx';
import { getListVideoByUser } from './redux/reduxListVideo.jsx';

class SectionListVideo extends React.Component {
    state = { item: {}, items: [] };
    
    componentDidMount() {
        if (this.props.listVideoId) {
            this.props.getListVideoByUser(this.props.listVideoId, data => {
                if (data.error) {
                    console.log('list các video trống')
                } else if (data.item) {
                    this.props.getAllVideosByUser({ listVideoId: data.item._id }, (items) => {
                        if (items) {
                            this.setState({ item: data.item, items }, () => {
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
                            });
                        }
                    });
                }
            });
        }
    }
    
    render() {
        let { item, items } = this.state;
        const firstItem = items && items.length ? items.splice(0 ,1)[0] : null;
        return (
            <div>
                <h3 className='text-primary'>Video clip</h3>
                {firstItem ? (
                    <div className='row' style={{ padding: '5px', height: item.height + 20 + 'px' }}>
                        <div className='col-md-12 col-lg-9 p-0 m-0'>
                            <a href={firstItem.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                <img style={{ height: item.height + 'px' }} src={firstItem.image} alt='videoImage'/>
                            </a>
                        </div>
                        <div className='col-md-12 col-lg-3 m-0 p-0'>
                            <div className='custom-scroll' style={{ height: item.height + 'px', color: 'white', overflowY: 'auto', margin: '5px 0' }}>
                                {items.map((item, index) => (
                                    <a key={index} href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                        <img height='85px' src={item.image} alt='videoImage'/>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : <p>Không có danh sách videos</p>}
            </div>
        )
    }
}

const mapStateToProps = state => ({ });
const mapActionsToProps = { getAllVideosByUser, getListVideoByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionListVideo);