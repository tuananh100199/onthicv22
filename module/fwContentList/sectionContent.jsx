import React from 'react';
import { connect } from 'react-redux';
import { getContentListItem } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
    }

    componentDidMount() {
        $(document).ready(() => {
            if (this.props.listContentId) {
                this.props.getContentListItem(this.props.listContentId, data => {
                    if (data.item) {
                        this.setState({ item: data.item });
                    } else {
                        this.props.history.push('/');
                    }
                });
            }
        });
    }
    
    render() {
        const items = this.state.item.items ? this.state.item.items : [];
        let itemList = null;
        if (items && items.length) {
            itemList = items.map((item, index) => {
                const link = '/content/item/' + item._id;
                return (
                    <div key={index} className='row ml-0 wow fadeInUp' data-wow-delay={((index + 1) * 250) + 'ms'}>
                        <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '5px' }}>
                                    <h2 className='heading pb-0 mb-0'>
                                        <Link to={link} className='text-primary'>{item.title}</Link>
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>


                )
            })
        }
        return (
            <div className='mt-2'>
                {/* <div className="tenmoi" style={{
                    backgroundImage: 'url("http://daotaolaixehiepphat.com/images/v4.png")',
                    backgroundPositionX: 'left', backgroundPositionY: '10px',
                    backgroundRepeat: 'repeat-x',
                    width: '960px',

                }}>
                    <div className="v1"
                        style={{
                            width: '15px',
                            height: '36px',
                            float: 'left',
                            backgroundImage: 'url("http://daotaolaixehiepphat.com/images/v1.png")',
                        }}></div>
                    <h3 style={{
                        paddingLeft: '-40px',
                        margin: '0',
                        textShadow: ' 1px -1px 2px #2C2626',
                        position: 'relative',
                        fontWeight: 'normal',
                        float: 'left',
                        height: '36px',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        backgroundImage: 'url("http://daotaolaixehiepphat.com/images/v2.png")',
                        minWidth: '220px',
                        paddingRight: '3px',
                    }} >{T.language.parse(this.state.item.title, true).vi}</h3>
                    <div style={{
                        width: '17px',
                        height: '36px',
                        backgroundImage: 'url("http://daotaolaixehiepphat.com/images/v3.png")',
                        float: 'left',
                    }} className="v2"></div>
                    <div className="clear" style={{
                        overflow: 'hidden',
                        clear: 'both'
                    }}></div>
                </div>
                <img src="http://daotaolaixehiepphat.com/images/v5.png" alt="Giới thiệu"></img>
                <div className="clear" style={{
                    overflow: 'hidden',
                    clear: 'both'
                }}></div> */}
                <h3 className='text-primary'>{this.state.item.title}</h3>
                <div>
                    {itemList}
                </div>
            </div>
        )
    }
}
const mapStateToProps = state => ({ system: state.system, contentList: state.contentList });
const mapActionsToProps = { getContentListItem };
export default connect(mapStateToProps, mapActionsToProps)(SectionContent);