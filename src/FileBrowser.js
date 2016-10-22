import React, { Component, PropTypes } from 'react';
import d3 from 'd3';
import copy from 'deepcopy';
import equal from 'deep-equal';
import Radium, {Style} from 'radium';
import FontAwesome from 'react-fontawesome';

const WIDTH = 800;
const HEIGHT = 400;
const DURATION = 750;
const color = d3.scale.category20b();

@Radium
export default class FileBrowser extends Component {
  static displayName = 'FileBrowser';
  static propTypes = {
    data: PropTypes.object.isRequired,
    path: PropTypes.array.isRequired,
    onMoveDown: PropTypes.func.isRequired,
    onShowDetail: PropTypes.func.isRequired,
    onHideDetail: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.treemap = d3.layout.treemap()
      .children(d => d.children)
      .value(d => d.size)
      .size([WIDTH, HEIGHT]);

    this.state = { prev: {} };
  }

  componentDidMount() {
    this.render();
  }

  componentDidUpdate(prevProps) {
    if (!equal(prevProps.path, this.props.path)) {
      this.setState({
        prev: {
          data: copy(prevProps.data),
          path: copy(prevProps.path),
        }
      }, () => {
        this.render();
      });
    }
  }

  render() {
    const { data, path, onMoveDown, onShowFile, onShowDetail, onHideDetail } = this.props;
    const { prev: { data: prevData, path: prevPath } } = this.state;

    var code;
    var files = [];
    var folders = [];
    data.children.map(function(entry){
      if (entry.children.length === 0)
        files.push(<div style={styles.row} className="row" key={entry.name} onClick={()=>onShowFile(entry.name)}><FontAwesome fixedWidth={true} name="file-text-o"/>{entry.name}</div>);
      else      
        folders.push(<div style={styles.row} className="row" key={entry.name} onClick={()=>onMoveDown(entry.name)}><FontAwesome fixedWidth={true} name="folder-o"/>{entry.name}</div>);
    })

    return (<div style={[styles.base]}>
      {folders.map((f)=>f)}
      {files.map((f)=>f)}
    </div>);
  }

}

var styles = {
  base: {
    backgroundAttachment: 'scroll',
    backgroundClip: 'border-box',
    backgroundColor: 'rgb(255, 255, 255)',
    backgroundImage: 'none',
    backgroundOrigin: 'padding-box',
    backgroundSize: 'auto',
    BorderBottomColor: 'rgb(128, 128, 128)',
    borderCollapse: 'collapse',
    BorderLeftColor: 'rgb(128, 128, 128)',
    BorderRightColor: 'rgb(128, 128, 128)',
    BorderTopColor: 'rgb(128, 128, 128)',
    borderRadius: '2px',
    boxSizing: 'border-box',
    color: 'rgb(51, 51, 51)',
    display: 'table',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    minWidth: WIDTH,
    fontSize: '14px',
    wordWrap: 'break-word',
    WebkitBorderHorizontalSpacing: '0px',
    WebkitBorderVerticalSpacing: '0px',
  },
  row: {
    backgroundColor: '#fff',
    BorderBottomColor: 'rgb(128, 128, 128)',
    borderCollapse: 'collapse',
    BorderLeftColor: 'rgb(128, 128, 128)',
    BorderRightColor: 'rgb(128, 128, 128)',
    BorderTopColor: 'rgb(128, 128, 128)',
    boxSizing: 'border-box',
    color: 'rgb(51, 51, 51)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    fontSize: '14px',
    fontWeight: 'bold',
    height: 'auto',
    lineHeight: '21px',
    marginBottom: '2px',
    paddingBottom: '1px',
    paddingLeft: '7px',
    paddingRight: '7px',
    paddingTop: '7px',
    verticalAlign: 'middle',
    width: 'auto',
    wordWrap: 'break-word',
    ':hover' : {
      backgroundColor: '#f5f5f5',
    }
  } 

};