import React from 'react';

// Keep callback navigation while exposing real URLs to crawlers and new-tab clicks.
export const PageLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ onClick, ...props }) => (
  <a {...props} onClick={(event) => {
    event.stopPropagation();
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target === '_blank') return;
    if (onClick) {
      event.preventDefault();
      onClick(event);
    }
  }} />
);
