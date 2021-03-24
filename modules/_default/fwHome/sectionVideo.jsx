import React from 'react';
import { connect } from 'react-redux';
import { getVideo } from './redux/reduxVideo';

class SectionVideo extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.viewId) {
            this.props.getVideo(this.props.viewId, item => {
                if (item) {
                    this.setState({ title: item.title, link: item.link, image: item.image });
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
        }
    }

    render() {
        let videoTitle = this.state.title ? this.state.title : '',
            videoUrl = this.state.link ? this.state.link : '',
            sectionStyle = Object.assign({ padding: '8em 0', marginBottom: '6em', position: 'relative' }, this.props.style, this.state.image ? { backgroundImage: 'url(' + T.baseUrl + this.state.image + ')' } : '');

        return (
            <section className='img' style={sectionStyle}>
                <div className='overlay' />
                <div className='container'>
                    <div className='row d-md-flex justify-content-center'>
                        <div className='col-md-9 about-video text-center'>
                            <h2>{videoTitle}</h2>
                            <div className='video d-flex justify-content-center'>
                                <a href={videoUrl} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                    <span className='fa fa-play' />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ component: state.component });
const mapActionsToProps = { getVideo };
export default connect(mapStateToProps, mapActionsToProps)(SectionVideo);