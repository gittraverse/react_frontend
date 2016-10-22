import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Tooltip, actions as tooltipActions } from 'redux-tooltip';
import copy from 'deepcopy';
import Treemap from './treemap';
import DATA from './data.h';
import FileBrowser from './FileBrowser';

const hier = parsePathArray(DATA);

function crop(path) {
  let cropped = hier;
  const remain = [...path];
  while (0 < remain.length) {
    const name = remain.shift();
    if (typeof cropped.children === 'undefined') {
      console.warn(`No children, this is a leaf node`);
      break;
    }
    const matches = cropped.children.filter(c => c.name === name);
    if (1 < matches.length) {
      console.warn(`Found multiple nodes which have same name: '${name}'`);
      break;
    }
    if (matches.length === 0) {
      console.warn(`No child named '${name}'`);
      break;
    }
    cropped = matches[0];
  }
  return copy(cropped);
}


function findWhere(list, props) {
    var idx = 0;
    var len = list.length;
    var match = false;
    var item, item_k, item_v, prop_k, prop_val;
    for (; idx<len; idx++) {
        item = list[idx];
        for (prop_k in props) {
            // If props doesn't own the property, skip it.
            if (!props.hasOwnProperty(prop_k)) continue;
            // If item doesn't have the property, no match;
            if (!item.hasOwnProperty(prop_k)) {
                match = false;
                break;
            }
            if (props[prop_k] === item[prop_k]) {
                // We have a match…so far.
                match = true;
            } else {
                // No match.
                match = false;
                // Don't compare more properties.
                break;
            }
        }
        // We've iterated all of props' properties, and we still match!
        // Return that item!
        if (match) return item;
    }
    // No matches
    return null;
}
function parsePathArray(paths) {
    var tree = [];

    // This example uses the underscore.js library.
    paths.forEach(function(path,index,array) {

        var pathParts = path.relativepath.split('/');

        var currentLevel = tree; // initialize currentLevel to root

        pathParts.forEach(function(part,index,array) {

            // check to see if the path already exists.
            var existingPath = findWhere(currentLevel, {
                name: part
            });

            if (existingPath) {
                // The path to this item was already in the tree, so don't add it again.
                // Set the current level to this path's children
                existingPath.size += path.size;
                currentLevel = existingPath.children;
            } else {
                var newPart = {
                    name: part,
                    size: path.size,
                    children: [],
                }
                currentLevel.push(newPart);
                currentLevel = newPart.children;
            }
        });
    });
    var s = tree.map((s)=>s.size);
    s = s.reduce((a,b)=>a+b);
    return {children:tree, size:s, name:'/'};
}


@connect(({ app }) => ({ app }))
export default class Home extends Component {
  static displayName = 'Home';
  static contextTypes = { router: PropTypes.object };

  handleMoveDown(name) {
    const { location } = this.props;
    const { router } = this.context;
    if (location.pathname.slice(-1) !== '/') {
      name = '/' + name;
    }

    console.log(location, name);

    router.push(`${location.pathname}${name}`);
  }

  handleHover(origin, name) {
    this.props.dispatch(tooltipActions.show({ origin, content: name }));
  }

  handleLeave() {
    this.props.dispatch(tooltipActions.hide());
  }

  render() {
    const { location, app: { base } } = this.props;
    const pathname = location.pathname.replace(base, '');
    const path = pathname.split('/').filter(s => 0 < s.length);
    const data = crop(path);
    return (
      <div>
        <div id="home" style={{ position: 'relative' }}>
          <h1>GitTraverse v0.0.0.1</h1>
          <div className="path">
            <Link to={`${base}`} key="top" className="path-item">[ROOT]</Link>
            {path.map((name, i) => (
              <Link to={`${base}/` + path.slice(0, i + 1).join('/')} key={`l_${name}_${i}`} className="path-item">{name}</Link>
            ))}
          </div>
          <Treemap
            { ...{ data, path } }
            onMoveDown={::this.handleMoveDown}
            onShowDetail={::this.handleHover}
            onHideDetail={::this.handleLeave}
          />
          <Tooltip />
        </div>
          <FileBrowser
            { ...{ data, path } }
            onMoveDown={::this.handleMoveDown}
            onShowDetail={::this.handleHover}
            onHideDetail={::this.handleLeave}
          />
      </div>
    );
  }
}
