import React from 'react'

import "./TabViewer.css"

type TabViewerItem<T> = {
    id: T;
    label: string;
}

export type TabElementProps<T> = {
    className: string;
    children?: React.ReactElement;
    itemId: T;
}

type Props<T> = {
    className?: string;
    currentId: T;
    items: TabViewerItem<T>[];
    hideTabs?: boolean;
    Tab: (props: TabElementProps<T>) => JSX.Element;
}

type TabProps<T> = React.PropsWithChildren<Props<T>>

const TabViewer = <T,>({ children, className, currentId, items, hideTabs, Tab }: TabProps<T>) : React.ReactElement => {
    return (
        <div className='tab-viewer'>
            { <div className='menu-entries'>
                { items.filter(item => !hideTabs || item.id === currentId).map(item => Tab({
                    className: `menu-entry ${'current' && currentId === item.id}`,
                    children: <h5>{item.label}</h5>,
                    itemId: item.id,
                }))}
            </div> }

            <div className={`content-body ${className}`}>
                { children }
            </div>
        </div>
    );
}

export default TabViewer;
