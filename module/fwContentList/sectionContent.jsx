import React from 'react';
import { connect } from 'react-redux';
import { getContentListByUser } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
    }

    componentDidMount() {
        $(document).ready(() => {
            if (this.props.listContentId) {
                this.props.getContentListByUser(this.props.listContentId, data => {
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
                        <div className={index < items.length - 1 ? 'col-12 border-bottom' : 'col-12'}>
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
                <h3 className='text-primary'>{this.state.item.title}</h3>
                <div>{itemList}</div>
            </div>
        )
    }
}
const mapStateToProps = state => ({ system: state.system, contentList: state.contentList });
const mapActionsToProps = { getContentListByUser };
export default connect(mapStateToProps, mapActionsToProps)(SectionContent);