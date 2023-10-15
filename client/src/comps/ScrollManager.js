import React from 'react'
import requestAnimationFrame from 'raf'

export const memoryStore = {
    _data: new Map(),
    // Get a value from the memory store
    get(key) {
        if (!key) {
            return null
        }
        return this._data.get(key) || null
    },
    // Set a value in the memory store
    set(key, data) {
        if (!key) {
            return
        }
        return this._data.set(key, data)
    }
}

/**
 * Component that will save and restore Window scroll position.
 */
export default class ScrollPositionManager extends React.Component {
    constructor(props) {
        super(...arguments)
        this.connectScrollTarget = this.connectScrollTarget.bind(this)
        this._target = window
    }

    // This function allows connecting a scroll target (e.g., a DOM element)
    connectScrollTarget(node) {
        this._target = node
    }

    // Restore the scroll position from memory and apply it to the target
    restoreScrollPosition(pos) {
        pos = pos || this.props.scrollStore.get(this.props.scrollKey)
        if (this._target && pos) {
            // Request an animation frame to smoothly scroll to the desired position
            requestAnimationFrame(() => {
                scroll(this._target, pos.x, pos.y + 236)
            })
        }
    }

    // Save the current scroll position in memory
    saveScrollPosition(key) {
        if (this._target) {
            const pos = getScrollPosition(this._target)
            key = key || this.props.scrollKey
            this.props.scrollStore.set(key, pos)
        }
    }

    // When the component is mounted, restore the scroll position
    componentDidMount() {
        this.restoreScrollPosition()
    }

    // When receiving new props, check if the scrollKey has changed and save the scroll position
    componentWillReceiveProps(nextProps) {
        if (this.props.scrollKey !== nextProps.scrollKey) {
            this.saveScrollPosition()
        }
    }

    // After a component update, check if the scrollKey has changed and restore the scroll position
    componentDidUpdate(prevProps) {
        if (this.props.scrollKey !== prevProps.scrollKey) {
            this.restoreScrollPosition()
        }
    }

    // When the component is about to be unmounted, save the scroll position
    componentWillUnmount() {
        this.saveScrollPosition()
    }

    render() {
        const { children = null, ...props } = this.props
        return (
            children &&
            // Render the children with the connectScrollTarget function
            children({ ...props, connectScrollTarget: this.connectScrollTarget })
        )
    }
}

// Set default props for the ScrollPositionManager component
ScrollPositionManager.defaultProps = {
    scrollStore: memoryStore
}

// Helper function to scroll a target element
function scroll(target, x, y) {
    if (target instanceof window.Window) {
        target.scrollTo(x, y)
    } else {
        target.scrollLeft = x
        target.scrollTop = y
    }
}

// Helper function to get the scroll position of a target element
function getScrollPosition(target) {
    if (target instanceof window.Window) {
        return { x: target.scrollX, y: target.scrollY }
    }
    return { x: target.scrollLeft, y: target.scrollTop }
}
