import React from 'react';

import fwHome from '../../module/fwHome/index.jsx';
import fwContact from '../../module/fwContact/index.jsx';
import fwNews from '../../module/fwNews/index.jsx'

export default class MenuPage extends React.Component {
    state = { component: null };

    componentDidMount() {
        T.get('/api/menu/path', { pathname: window.location.pathname }, res => {
            if (res.error) {
                this.props.history.push('/');
            } else {
                this.setState({ component: res });
            }
        });
    }

    renderComponents(index, ins, outs, isFirst) {
        if (index < ins.length) {
            let item = ins[index],
                itemView = null,
                itemStyle = {};
            if (item.style) {
                let [key, value] = item.style.split(':');
                key = key.trim();
                value = value.trim();
                itemStyle[key] = value;
            }
            if (item.viewType == 'carousel') {
                itemView = <fwHome.Section.SectionCarousel viewId={item.viewId} />;
            } else if (item.viewType == 'slogan') {
                itemView = <fwHome.Section.SectionSlogan sloganId={item.viewId} />;
            } else if (item.viewType == 'video') {
                itemView = <fwHome.Section.SectionVideo videoId={item.viewId} />;
            } else if (item.viewType == 'list video') {
                itemView = <fwHome.Section.SectionListVideo listVideoId={item.viewId} />;
            } else if (item.viewType == 'statistic') {
                itemView = <fwHome.Section.SectionStatistic statisticId={item.viewId} />;
            } else if (item.viewType == 'logo') {
                itemView = <fwHome.Section.SectionLogo logoId={item.viewId} />;
            } else if (item.viewType == 'staff group') {
                itemView = <fwHome.Section.SectionStaffGroup staffGroupId={item.viewId} />;
            } else if (item.viewType == 'testimony') {
                itemView = <fwHome.Section.SectionTestimony testimonyId={item.viewId} />;
            } else if (item.viewType == 'contact') {
                itemView = <fwContact.Section.SectionContact />;
            } else if (item.viewType == 'last news') {
                itemView = <fwNews.Section.SectionNews />;
            }else if (item.viewType == 'all news') {
                itemView = <fwNews.Section.SectionNewsList />;
            } 
            else if (item.viewType == 'content' && item.view) {
                itemView = <div dangerouslySetInnerHTML={{ __html: T.language.parse(item.view.content) }} />;
            }

            let childComponents = [];
            if (item.components) {
                this.renderComponents(0, item.components, childComponents);
            }

            outs.push(
                <div key={index} className={item.className + (isFirst ? ' first-component' : '')} style={itemStyle}>
                    {itemView}
                    {childComponents}
                </div>
            );
            outs.push(this.renderComponents(index + 1, ins, outs));
        }
    }

    render() {
        let components = [];
        if (this.state.component) {
            this.renderComponents(0, [this.state.component], components, true);
        }
        return components;
    }
}
