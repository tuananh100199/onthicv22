import React from 'react';
import { connect } from 'react-redux';
import { getClusterAll, createCluster, resetCluster, deleteCluster, getSystemImageAll, applySystemImage, deleteSystemImage } from './redux';
import { AdminPage, TableCell, renderTable } from 'view/component/AdminPage';

class ClusterPage extends AdminPage {
    componentDidMount() {
        T.ready();
        this.props.getSystemImageAll();
        this.props.getClusterAll();
        T.socket.on('workers-changed', () => this.props.getClusterAll());
    }

    componentWillUnmount() {
        T.socket.off('workers-changed');
    }

    createCluster = (e) => e.preventDefault() || this.props.createCluster();
    resetCluster = (e, item) => e.preventDefault() || T.confirm('Reset cluster', `Are you sure you want to reset cluster ${item.pid}?`, true, isConfirm =>
        isConfirm && this.props.resetCluster(item.pid));
    deleteCluster = (e, item) => e.preventDefault() || T.confirm('Delete cluster', `Are you sure you want to delete cluster ${item.pid}?`, true, isConfirm =>
        isConfirm && this.props.deleteCluster(item.pid));
    resetAllClusters = (e) => e.preventDefault() || T.confirm('Delete cluster', 'Are you sure you want to reset all clusters?', true, isConfirm =>
        isConfirm && this.props.resetCluster());

    refreshSystemImages = (e) => e.preventDefault() || this.props.getSystemImageAll();
    applySystemImage = (e, item) => {
        e.preventDefault();
        let applyButton = $(e.target);
        if (applyButton.is('i')) applyButton = applyButton.parent();
        const deleteButton = applyButton.next();
        T.confirm('Apply cluster', `Are you sure you want to apply image ${item.filename}?`, true, isConfirm => {
            if (isConfirm) {
                applyButton.fadeOut();
                deleteButton.fadeOut();
                this.props.applySystemImage(item.filename, () => {
                    applyButton.fadeIn();
                    deleteButton.fadeIn();
                });
            }
        });
    }
    deleteSystemImage = (e, item) => e.preventDefault() || T.confirm('Delete image', `Are you sure you want to delete image ${item.filename}?`, true,
        isConfirm => isConfirm && this.props.deleteSystemImage(item.filename));

    render() {
        const permission = this.getUserPermission('cluster');
        const clusterTable = renderTable({
            getDataSource: () => this.props.cluster && this.props.cluster.clusters,
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Id</th>
                    <th style={{ width: '100%' }} nowrap='true'>Image name</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Image version</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Start date</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Status</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.pid} />
                    <TableCell type='text' content={item.imageInfo} />
                    <TableCell type='text' style={{ textAlign: 'center' }} content={item.version} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='text' className={item.status == 'running' ? 'text-primary' : 'text-danger'} content={item.status} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={this.deleteCluster}>
                        {permission.write &&
                            <a className='btn btn-success' href='#' onClick={e => this.resetCluster(e, item)}>
                                <i className='fa fa-lg fa-refresh' />
                            </a>}
                    </TableCell>
                </tr>),
        });
        const imageTable = renderTable({
            getDataSource: () => this.props.cluster && this.props.cluster.images && this.props.cluster.images.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()),
            renderHead: () => (
                <tr>
                    <th style={{ width: 'auto', textAlign: 'center' }}>#</th>
                    <th style={{ width: '100%' }} nowrap='true'>Image name</th>
                    <th style={{ width: 'auto', textAlign: 'center' }} nowrap='true'>Created date</th>
                    <th style={{ width: 'auto', textAlign: 'center' }}>Actions</th>
                </tr>),
            renderRow: (item, index) => (
                <tr key={index}>
                    <TableCell type='number' content={index + 1} />
                    <TableCell type='text' content={item.filename} />
                    <TableCell type='text' style={{ textAlign: 'center', whiteSpace: 'nowrap' }} content={new Date(item.createdDate).getShortText()} />
                    <TableCell type='buttons' content={item} style={{ textAlign: 'center' }} permission={permission} onDelete={this.deleteSystemImage}>
                        {permission.write &&
                            <a className='btn btn-success' href='#' onClick={e => this.applySystemImage(e, item)}>
                                <i className='fa fa-lg fa-arrow-up' />
                            </a>}
                    </TableCell>
                </tr>),
        });

        return this.renderPage({
            icon: 'fa fa-braille',
            title: 'Cluster',
            breadcrumb: ['Cluster'],
            content: <>
                <div className='tile'>
                    <h3 className='tile-title'>Cluster</h3>
                    <div className='tile-body'>{clusterTable}</div>
                    <div style={{ textAlign: 'right' }}>
                        {/* <button className='btn btn-success' type='button' onClick={this.resetAllClusters}>
                            <i className='fa fa-fw fa-lg fa-refresh'/>Reset
                        </button>&nbsp;&nbsp; */}
                        <button className='btn btn-primary' type='button' onClick={this.createCluster}>
                            <i className='fa fa-fw fa-lg fa-plus' />Add
                        </button>
                    </div>
                </div>

                <div className='tile'>
                    <h3 className='tile-title'>System Image</h3>
                    <div className='tile-body'>{imageTable}</div>
                    <div style={{ textAlign: 'right' }}>
                        <button className='btn btn-warning' type='button' onClick={this.refreshSystemImages}>
                            <i className='fa fa-fw fa-lg fa-refresh' />Refresh
                        </button>
                    </div>
                </div>
            </>,
        });
    }
}

const mapStateToProps = state => ({ system: state.system, cluster: state.cluster });
const mapActionsToProps = { getClusterAll, createCluster, resetCluster, deleteCluster, getSystemImageAll, applySystemImage, deleteSystemImage };
export default connect(mapStateToProps, mapActionsToProps)(ClusterPage);