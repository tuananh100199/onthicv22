import React from 'react';
import { connect } from 'react-redux';
import { getAllContents } from '../fwHome/redux/reduxContent.jsx';
import { getAllContentList } from './redux.jsx';
import { Link } from 'react-router-dom';

class SectionContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { item: {}, items: [] };
    }

    componentDidMount() {
        $(document).ready(() => {
            this.props.getAllContentList();
            this.props.getAllContents();
            this.getData();
        })
    }
    getData = () => {
        if (this.props.listContentId && this.props.contentList) {
            const currentList = this.props.contentList.list.find(list => list._id === this.props.listContentId);
            console.log('currentList', currentList)
            let title = T.language.parse(currentList.title, true);
            $('#listContentTitle').val(title.vi).focus();
            this.setState({ item: currentList });
            this.getListContentItem();
            console.log('state', this.state)
        }
    }
    getListContentItem = () => {
        const listItem = this.state.item.listOfContentId.map(item => this.props.content.find(ele => ele._id === item))
        this.setState({ items: listItem });
    }

    render() {
        const items = this.state.items ? this.state.items : [];
        if (items && items.length) {
            items.map((item, index) => {
                const link = '/content/item/' + item._id;
                return (
                    <div key={index} className='row ml-0 wow fadeInUp' data-wow-delay={((index + 1) * 250) + 'ms'}>
                        <div style={{ width: '150px', padding: '15px 15px 15px 0px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <Link to={link}>
                                <img src={item.image} style={{ height: '95px', width: '100%' }} alt='Image' className='img-fluid' />
                            </Link>
                        </div>
                        <div style={{ width: 'calc(100% - 165px)', marginRight: '15px' }} className={index < items.length - 1 ? 'border-bottom' : ''}>
                            <div className='text'>
                                <div className='text-inner' style={{ paddingLeft: '15px' }}>
                                    <h2 className='heading pb-0 mb-0'>
                                        <Link to={link} className='text-primary'>{T.language.parse(item.title)}</Link>
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
                <h3 className='text-primary'>{T.language.parse(this.state.item.title, true).vi}</h3>
                <div>
                    {items}
                    {/*<button className='expand-btn' onClick={this.handleClickExpand}>*/}
                    {/*    {T.language.parse('{ "vi": "Xem thêm...", "en": "See more..." }')}*/}
                    {/*</button>*/}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({ system: state.system, content: state.content, contentList: state.contentList });
const mapActionsToProps = { getAllContents, getAllContentList };
export default connect(mapStateToProps, mapActionsToProps)(SectionContent);