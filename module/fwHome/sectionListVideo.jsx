import React from 'react';
import { connect } from 'react-redux';
import { getAllVideosByUser } from './redux/reduxVideo.jsx';
import { getListVideoByUser } from './redux/reduxListVideo.jsx';

class SectionListVideo extends React.Component {
    state = { item: {}, items: [], mobileView: false };
    handleResize = () => {
        const windowWidth = $(window).width();
        const mobileView = this.state.mobileView;
        const done = () => {
            setTimeout(() => {
                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                    disableOn: 700,
                    type: 'iframe',
                    mainClass: 'mfp-fade',
                    removalDelay: 160,
                    preloader: false,
                    fixedContentPos: false,
                    closeOnBgClick: false
                });
            },  50)
        };
        
        if (windowWidth < 768 && mobileView == false) {
            this.setState({ mobileView: true }, done)
        } else if (windowWidth >= 768 && mobileView == true) {
            this.setState({ mobileView: false }, done)
        }
    }
    
    componentDidMount() {
        $(document).ready(() => {
            window.addEventListener('resize', this.handleResize);
    
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
                                        if (elements.length == items.length) {
                                            this.handleResize()
                                            setTimeout(() => {
                                                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                                                    disableOn: 700,
                                                    type: 'iframe',
                                                    mainClass: 'mfp-fade',
                                                    removalDelay: 160,
                                                    preloader: false,
                                                    fixedContentPos: false,
                                                    closeOnBgClick: false
                                                });
                                            },  50)
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
        })
    }
    
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    
    render() {
        let { item, items, mobileView } = this.state;
        const firstItem = items && items.length ? items.slice(0 ,1)[0] : null;
        const remainItems = items.slice(1)
        return (
            <div>
                <div className='services'>
                    {/*<div className='section_subtitle'>This is Dr Pro</div>*/}
                    <div className='section_title'><h2>Video clip</h2></div>
                </div>
                {firstItem ? (
                    <div className='row'>
                        <div className={items.length ? 'col-md-12 col-lg-7 col-xl-8 m-0' : 'col-md-12 m-0'} style={{ height: item.height + 'px', padding: '2px' }}>
                            <a href={firstItem.link} className='button popup-youtube d-flex justify-content-center align-items-center'
                               style={{
                                   height: '100%', backgroundImage: `url('${firstItem.image}')`,
                                   backgroundRepeat: 'no-repeat',
                                   backgroundPosition: 'center',
                                   backgroundSize: 'contain'
                               }}
                            />
                        </div>
                        {mobileView ? (
                            remainItems.length && (
                                remainItems.map((_item, index) => (
                                    <div key={index} className='col-md-12 col-lg-5 col-xl-4 m-0' style={{ height: item.height + 'px', padding: '2px' }}>
                                        <a href={_item.link} className='button popup-youtube d-flex justify-content-center align-items-center'
                                           style={{
                                               height: '100%', backgroundImage: `url('${_item.image}')`,
                                               backgroundRepeat: 'no-repeat',
                                               backgroundPosition: 'center',
                                               backgroundSize: 'contain'
                                           }}
                                        />
                                    </div>
                                ))
                            )
                        ) : (
                            remainItems.length && (
                                <div className='col-md-12 col-lg-5 col-xl-4 m-0' style={{ height: item.height + 'px' }}>
                                    <div className='custom-scroll' style={{ height: item.height + 'px', color: 'white', overflowY: 'auto' }}>
                                        {remainItems.map((item, index) => (
                                            <div key={index} style={{ height: '85px', padding: '2px',  }}>
                                                <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'
                                                   style={{
                                                       height: '100%', backgroundImage: `url('${item.image}')`,
                                                       backgroundRepeat: 'no-repeat',
                                                       backgroundPosition: 'center',
                                                       backgroundSize: 'contain'
                                                   }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                ) : <p>Không có danh sách video</p>}
            </div>
        )
    }
}

const mapStateToProps = state => ({ });
const mapActionsToProps = { getAllVideosByUser, getListVideoByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionListVideo);