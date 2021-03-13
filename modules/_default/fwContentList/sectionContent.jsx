import React from 'react';
import { connect } from 'react-redux';
import { getContentListByUser } from './redux';
import { Link } from 'react-router-dom';

class SectionContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: { items: [] } };
        this.background = React.createRef();
    }

    componentDidMount() {
        $(document).ready(() => {
            if (this.props.listContentId) {
                this.props.getContentListByUser(this.props.listContentId, data => {
                    if (data.item) {
                        this.setState({ item: data.item }, () => {
                            T.ftcoAnimate()
                            $(this.background.current).parallax();
                        });
                    } else {
                        this.props.history.push('/');
                    }
                });
            }
        });
    }

    componentWillUnmount() {
        $('.parallax-mirror').length != 0 && $(this.background.current).parallax('destroy');
    }

    render() {
        const item = this.state.item;
        const items = item.items || [], image = item.image || '/img/avatar.jpg';

        let itemList = null;
        if (items && items.length) {
            itemList = items.map((item, index) => {
                const link = '/content/item/' + item._id;
                return (
                    <div key={index} className='row ml-0 ftco-animate' style={{ marginBottom: '15px' }}>
                        <div style={{ width: '150px', padding: '15px 15px 30px 0px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <Link to={link}>
                                <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                            </Link>
                        </div>
                        <div style={{ width: 'calc(100% - 165px)', marginRight: '15px', paddingTop: '15px', paddingBottom: '15px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                    <Link to={link}><div className='contact_content_title mt-0'>{item.title}</div></Link>
                                    <div className='contact_content_text'>
                                        <p className='text-justify'>{item.abstract}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }

        return [
            <div key={0} className='home-contact d-flex flex-column align-items-start justify-content-end'>
                <div ref={this.background} className='parallax_background parallax-window' data-parallax='scroll' data-image-src={image} data-speed='0.8' />
                <div className='home_overlay'><img src='/img/home_overlay.png' alt='' /></div>
                <div className='home_container'>
                    <div className='container'>
                        <div className='row'>
                            <div className='col'>
                                <div className='home_content ftco-animate'>
                                    <div className='home_text_content'>
                                        <div className='home_title' style={{ whiteSpace: 'nowrap' }}>{item.title}</div>
                                        <div className='home_text'>{item.abstract}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            <div key={1} className='contact'>
                <div className='container'>
                    <div className='mt-2'>
                        <div>{itemList}</div>
                    </div>
                </div>
            </div>
        ]
    }
}
const mapStateToProps = state => ({ system: state.system, contentList: state.contentList });
const mapActionsToProps = { getContentListByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContent);