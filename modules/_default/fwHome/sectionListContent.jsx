import React from 'react';
import { connect } from 'react-redux';
import { homeGetListContent } from './redux/reduxListContent';
import { Link } from 'react-router-dom';

class SectionListContent extends React.Component {
    state = { items: [] };
    componentDidMount() {
        $(document).ready(() => {
            if (this.props.viewId) {
                this.props.homeGetListContent(this.props.viewId, data => {
                    console.log(data)
                    if (data.item) {
                        this.setState(data.item, () => {
                            T.ftcoAnimate()
                            $(this.background).parallax();
                        });
                    } else {
                        this.props.history.push('/');
                    }
                });
            }
        });
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background).parallax('destroy');
    }

    render() {
        const { title = '', abstract = '', items = [] } = this.state,
            image = this.state.image || '/img/avatar.jpg';

        const itemList = (items || []).map((item, index) => (
            <div key={index} className='row ml-0 ftco-animate' style={{ marginBottom: '15px' }}>
                <div style={{ width: '150px', padding: '15px 15px 30px 0px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                    <Link to={'/content/' + item._id}>
                        <img src={item.image} style={{ height: '95px', width: '100%', objectFit: 'contain' }} alt='Image' className='img-fluid' />
                    </Link>
                </div>
                <div style={{ width: 'calc(100% - 165px)', marginRight: '15px', paddingTop: '15px', paddingBottom: '15px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                    <div className='text'>
                        <div className='text-inner' style={{ paddingLeft: '15px' }}>
                            <Link to={'/content/' + item._id}><div className='contact_content_title mt-0'>{item.title}</div></Link>
                            <div className='contact_content_text'>
                                <p className='text-justify'>{item.abstract}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ));

        return <>
            <div className='home-contact d-flex flex-column align-items-start justify-content-end'>
                <div ref={e => this.background = e} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={image} data-speed='0.8' />
                <div className='home_overlay'><img src='/img/home_overlay.png' alt='' /></div>
                <div className='home_container'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <div className='home_content ftco-animate'>
                                    <div className='home_text_content'>
                                        <div className='home_title' style={{ whiteSpace: 'nowrap' }}>{title}</div>
                                        <div className='home_text'>{abstract}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='contact'>
                <div className='container mt-2'>{itemList}</div>
            </div>
        </>
    }
}
const mapStateToProps = state => ({ system: state.system, component: state.component });
const mapActionsToProps = { homeGetListContent };
export default connect(mapStateToProps, mapActionsToProps)(SectionListContent);