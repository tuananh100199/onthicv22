import React from 'react';
import { connect } from 'react-redux';
import { getAllContents} from './redux.jsx';
import { getListContentItem } from './redux.jsx';

class SectionListContent extends React.Component {
    state = {};

    componentDidMount() {
        if (this.props.listContentId) {
            this.props.getListContentItem(this.props.listContentId, data => {
                    if (data.error) {
                       console.log('list các Content trống')
                    } 
                    else if (data.item) {
                        this.props.getAllContents({ listContentId : data.item._id }, (items) => {
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
                <div className='row'>
                    <div className='col-12 p-0' style={{ fontSize: '23px' }} >
                        <div style={{ backgroundColor: '#4D983C', color: 'white', padding: '5px', marginBottom: '20px' }} >Content Clip</div>
                    </div>
                </div>
                
                <div className='row' style={{ padding: '5px', border: '1px solid #ccc', height: this.state.item.height + 20 + 'px'}}>
                    <div className='col-md-9 p-0 m-0'>
                        {firstItem.map((item, index) => (
                            <div key={index} style={{height: '100%', padding: '5px'}}>
                                <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                    <img style={{ height: this.state.item.height + 'px' }} src={item.image} alt='ContentImage' />
                                </a>`
                            </div>
                        ))}
                    </div>
                    <div className='col-md-3 m-0 p-0'>
                        <div className='custom-scroll' style = {{ height: this.state.item.height + 'px', color: 'white', overflowY: 'scroll', margin: '5px 0' }} >
                            {arr.map((item, index) => (
                                <div key={index}>
                                    <a href={item.link} className='button popup-youtube d-flex justify-content-center align-items-center'>
                                        <img height='85px' src= {item.image} alt='ContentImage' />
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

const mapStateToProps = state => ({ Content: state.Content });
const mapActionsToProps = { getAllContents, getListContentItem };
export default connect(mapStateToProps, mapActionsToProps)(SectionListContent);