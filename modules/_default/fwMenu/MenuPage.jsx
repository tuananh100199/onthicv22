import React from 'react';

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

    renderComponents(index, ins, outs, isFirst = false) {
        if (index < ins.length) {
            let item = ins[index],
                itemView = null,
                itemStyle = {};
            if (item.style) {
                const styleList = item.style.split(';');
                styleList.forEach(item => {
                    let [key, value] = item.split(':');
                    key = key.trim();
                    value = value.trim();
                    itemStyle[key] = value;
                })
            }
            
            if (T.component[item.viewType] && T.component[item.viewType].render) {
                itemView = T.component[item.viewType].render(item.viewId);
            }

            let childComponents = [];
            if (item.components) this.renderComponents(0, item.components, childComponents);

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
        if (this.state.component) this.renderComponents(0, [this.state.component], components, true);
        return components;
    }
}
