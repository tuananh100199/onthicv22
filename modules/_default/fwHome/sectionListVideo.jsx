import React from 'react';
import { connect } from 'react-redux';
import { getAllVideosByUser } from './redux/reduxVideo';
import { getListVideoByUser } from './redux/reduxListVideo';

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
            }, 50)
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

            if (this.props.viewId) {
                this.props.getListVideoByUser(this.props.viewId, data => {
                    if (data.error) {
                        console.log('list các video trống')
                    } else if (data.item) {
                        this.props.getAllVideosByUser({ listVideoId: data.item._id }, (items) => {
                            if (items) {
                                this.setState({ item: data.item, items }, () => {
                                    const done = () => {
                                        const elements = $('.popup-youtube, .popup-vimeo, .popup-gmaps');
                                        if (elements.length == 2 * items.length) {
                                            this.handleResize()
                                            setTimeout(() => {
                                                $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
                                                    disableOn: 700,
                                                    type: 'iframe',
                                                    mainClass: 'mfp-fade',
                                                    removalDelay: 160,
                                                    preloader: false,
                                                    fixedContentPos: false,
                                                    // closeOnBgClick: false
                                                });
                                            }, 50)
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
        let { item, items } = this.state;
        return (
            <div className='services'>
                <div className='container'>
                    <div className='row'>
                        <div className='col text-center'>
                            <div className='section_title_container'>
                                {/*<div className='section_subtitle'>This is Dr Pro</div>*/}
                                <div className='section_title'><h2>{item.title}</h2></div>
                            </div>
                        </div>
                    </div>
                    <div className='row services_row'>
                        {(items || []).map((_item, index) => (
                            <div key={index} className='col-xl-4 col-md-6 service_col'>
                                <div className='service text-center'>
                                    <div className='service'>
                                        <div className='d-flex flex-column align-items-center justify-content-center ml-auto mr-auto'>
                                            <div>
                                                <a href={_item.link} className='popup-youtube'>
                                                    <img src={_item.image} style={{ width: '100%' }} alt={_item.title} />
                                                </a>
                                            </div>
                                        </div>

                                        <div className='service_title'>
                                            <a href={_item.link} className='text-success popup-youtube'>
                                                {_item.title}
                                            </a>
                                        </div>

                                        <div className='service_text'>
                                            <p dangerouslySetInnerHTML={{ __html: _item.content }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({});
const mapActionsToProps = { getAllVideosByUser, getListVideoByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionListVideo);