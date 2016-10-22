import React, { Component, PropTypes } from 'react';
import d3 from 'd3';
import copy from 'deepcopy';
import equal from 'deep-equal';

const WIDTH = 800;
const HEIGHT = 400;
const DURATION = 750;
const color = d3.scale.category20b();

export default class Treemap extends Component {
  static displayName = 'Treemap';
  static propTypes = {
    data: PropTypes.object.isRequired,
    path: PropTypes.array.isRequired,
    onMoveDown: PropTypes.func.isRequired,
    onShowFile: PropTypes.func.isRequired,
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
    this.renderTreemap();
  }

  componentDidUpdate(prevProps) {
    if (!equal(prevProps.path, this.props.path)) {
      this.setState({
        prev: {
          data: copy(prevProps.data),
          path: copy(prevProps.path),
        }
      }, () => {
        this.renderTreemap();
      });
    }
  }

  renderTreemap() {
    const { data, path, onMoveDown, onShowFile, onShowDetail, onHideDetail } = this.props;
    const { prev: { data: prevData, path: prevPath } } = this.state;

    if (!this.svg) {
      this.svg = d3.select(this.refs.content)
        .append('svg')
          .attr('width', WIDTH)
          .attr('height', HEIGHT);
    }

    // Populate for current data
    const currentNodes = this.treemap
      .nodes(copy(data)).filter(d => d.depth === 1);

    // Get original position before populating layout
    let x, y, prevNodes;
    if (typeof prevData !== 'undefined') {
      // Populate for prev data
      prevNodes = this.treemap
        .nodes(copy(prevData)).filter(d => d.depth === 1);

      // Check UP or DOWN
      if (prevPath.length < path.length) {
        let orig = prevNodes.filter(child => child.name === data.name)[0];
        // console.log('Down', {...orig});
        x = d3.scale.linear()
          .domain([orig.x, orig.x + orig.dx])
          .range([0, WIDTH]);
        y = d3.scale.linear()
          .domain([orig.y, orig.y + orig.dy])
          .range([0, HEIGHT]);
      } else {
        let orig = currentNodes.filter(child => child.name === prevData.name)[0];
        // console.log('Up', {...orig});
        x = d3.scale.linear()
          .domain([0, WIDTH])
          .range([orig.x, orig.x + orig.dx]);
        y = d3.scale.linear()
          .domain([0, HEIGHT])
          .range([orig.y, orig.y + orig.dy]);
      }
    }

    if (typeof x === 'undefined' && typeof y === 'undefined') {
      x = d3.scale.linear()
        .domain([0, WIDTH])
        .range([0, WIDTH]);
      y = d3.scale.linear()
        .domain([0, HEIGHT])
        .range([0, HEIGHT]);
    }

    // console.log('x, y',
    //   `${JSON.stringify(x.domain())} => ${JSON.stringify(x.range())}`,
    //   `${JSON.stringify(y.domain())} => ${JSON.stringify(y.range())}`);

    const ix = d => x.invert(d);
    const iy = d => y.invert(d);

    if (typeof prevData !== 'undefined') {
      // [1] Layer for Prev Level
      const prev = {};
      prev.layer = this.svg.select('.current')
          .attr('class', 'prev');

      // [JOIN] prev
      prev.child = prev.layer.selectAll('.child')
        .data(prevNodes);

      // [UPDATE] prev: child
      prev.child
        .transition().duration(DURATION)
          .attr('transform', d => `translate(${x(d.x)},${y(d.y)})`);

      // [UPDATE] prev: child > rect
      prev.rect = prev.child.select('rect')
        .transition().duration(DURATION)
          .attr('width', d => x(d.x + d.dx) - x(d.x))
          .attr('height', d => y(d.y + d.dy) - y(d.y));

      // Remove prev layer after transition
      prev.layer
        .transition().duration(DURATION)
          .delay(DURATION)
          .remove();
    }

    // [2] Layer for Current Level
    const current = {};
    current.layer = this.svg
      .append('g')
        .attr('class', 'current');

    // [JOIN] current
    current.child = current.layer.selectAll('.child')
      .data(currentNodes);

    // [ENTER] current: child
    current.enter = current.child
      .enter().append('g')
        .attr('class', 'child')
        .attr('transform', d => `translate(${ix(d.x)},${iy(d.y)})`)
        .style('cursor', d => d.children ? 'pointer' : 'normal')
        .style('opacity', 0)
        .on('click', d => {
          if (d.children) {
            onMoveDown(d.name);
          } else {
            onShowFile(d.name);
          }
        })
        .on('mousemove', d => {
          const el = document.getElementById('container');
          const [x, y] = d3.mouse(el);
          onShowDetail({ x, y }, d.name);
        })
        .on('mouseleave', d => {
          onHideDetail();
        });

    // [ENTER] current: child (transition)
    current.child
      .transition().duration(DURATION)
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('opacity', 1);

    // [ENTER] current: child > rect
    current.enter
      .append('rect')
        .attr('width', d => ix(d.x + d.dx) - ix(d.x))
        .attr('height', d => iy(d.y + d.dy) - iy(d.y))
        .attr('fill', (d, i) => color(i))
      .transition().duration(DURATION)
        .attr('width', d => d.dx)
        .attr('height', d => d.dy);
  }

  render() {
    return <div ref="content" />;
  }
}
