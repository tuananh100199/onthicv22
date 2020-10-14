import React from 'react';
import { connect } from 'react-redux';
import { getVideo } from './redux/reduxVideo.jsx';

class SectionVideo extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.videoId) {
            this.props.getVideo(this.props.videoId, item =>
                item && this.setState({ title: item.title, link: item.link, image: item.image, content: item.content }));
        }

        const done = (callback) => {
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
                callback && callback();
            } else {
                setTimeout(() => done(callback), 300);
            }
        };
        done(T.ftcoAnimate);
    }

    componentDidUpdate() {
        setTimeout(T.ftcoAnimate, 250);
    }

    render() {
        const title = T.language.parse(this.state.title),
            content = T.language.parse(this.state.content),
            videoUrl = this.state.link ? this.state.link : '',
            imageUrl = this.state.image ? this.state.image : '';

        return (
            <section className=' ftco-section-2' style={{ padding: 0 }}>
                <div className='col-md-12 hotel-single ftco-animate mb-5 mt-4' >
                    <h4 className='mb-4 text-center'>{title}</h4>
                    <div className='block-16 row' >
                        <div className='col-12 col-md-6'>
                            <p dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                        <figure className='col-12 col-md-6' >
                            <img src={imageUrl} alt='Image placeholder' className='img-fluid' />
                            <a href={videoUrl} className='play-button popup-vimeo'><span className='icon-play' /></a>
                        </figure>
                    </div>
                </div>
            </section>
        );
    }
}

const mapStateToProps = state => ({ video: state.video });
const mapActionsToProps = { getVideo };
export default connect(mapStateToProps, mapActionsToProps)(SectionVideo);